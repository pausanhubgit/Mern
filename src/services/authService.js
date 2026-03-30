import User from '../models/UserModel.js';
import ResetPassword from '../models/ResetPassword.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mainConfig from '../config/index.js';
import sendSMS from '../utils/sms.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';
import { OAuth2Client } from 'google-auth-library';
import { Merchant } from '../constants/roles.js';

const client = new OAuth2Client(mainConfig.googleClientId);

const register = async(data) =>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await User.findOne({email: data.email});
    if(user){
        throw new Error("User already exists");
    }

    const hashedPassword = bcrypt.hashSync(data.password);
   
   const registerUser = await User.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        roles: [Merchant]
    });
    return {
        _id: registerUser._id,
        username: registerUser.username,
        email: registerUser.email,
        roles: registerUser.roles,
    }
};

const login = async(data) =>{
   if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
   const user = await User.findOne({email: data.email});
    if(!user){
        throw new Error("User not found");
    }
    const isMatch = bcrypt.compareSync(data.password, user.password);
    if(!isMatch){
        throw new Error("Invalid  email or password");
    }
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
    };
};

const forgetPassword = async (email) =>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await User.findOne({email: email});
if(!user)  throw{statusCode:404, message:"User not found"};

    const token = crypto.randomUUID();

   await ResetPassword.create({
        userId: user._id,
        token,
    });

    await sendEmail(email, {
        subject:"Reset Password link",
         body:`
         <div style="padding:20px">
         <h1>Reset Password Link </h1>
         <a href="${mainConfig.appUrl}/reset-password?token=${token}&userId=${user._id}"
         style="padding:10px 20px;
         background-color:#6d28d9;
         color:white;
         text-decoration:none;
         border-radius:8px;
         font-weight:bold;
         display:inline-block;
         ">Reset Password</a>
         </div>
         `,
         });

        return{message:"Reset password token sent to your email"};
};



const resetPassword = async(userId, token, newPassword) =>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const data = await ResetPassword.findOne({
        userId: userId,
        token: token,
        expiresAt:{$gt:Date.now()},
    }).sort({expiresAt:-1});

    if(!data){
        throw new Error("Invalid or expired token");
    }
    if (data.isUsed) {
        throw new Error("Token already used");
    }
    const hashedPassword = bcrypt.hashSync(newPassword);
    await User.findByIdAndUpdate(userId,{password:hashedPassword});

    await ResetPassword.findByIdAndUpdate(data._id,{isUsed:true});

    return {message:"Password reset successfully"}
};
// const logout = async () =>{
//     const data = {message:"Logout successful"};
//     return data;

// };

const googleLogin = async (token) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: mainConfig.googleClientId,
    });
    const { email, name, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            username: name,
            email: email,
            profileImageUrl: picture,
            googleId: sub,
            password: bcrypt.hashSync(crypto.randomBytes(16).toString('hex')), // random password
            roles: [Merchant]
        });
    }

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
    };
};

export default{register, login, forgetPassword, resetPassword, googleLogin};
