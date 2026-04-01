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

const forgetPassword = async (email, redirectUrl) =>{
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

    const resetBaseUrl = redirectUrl || `${mainConfig.appUrl}/reset-password`;
    const resetLink = `${resetBaseUrl}?token=${token}&userId=${user._id}`;

    await sendEmail(email, {
        subject:"Reset Password Link",
         body:`
         <div style="font-family: sans-serif; padding: 20px; color: #333;">
           <h2 style="color: #6d28d9;">Reset Your Password</h2>
           <p>We received a request to reset your password. Click the button below to proceed:</p>
           <div style="margin: 25px 0;">
             <a href="${resetLink}"
                style="padding: 12px 24px;
                       background-color: #6d28d9;
                       color: white;
                       text-decoration: none;
                       border-radius: 8px;
                       font-weight: bold;
                       display: inline-block;">
               Reset Password
             </a>
           </div>
           <p style="font-size: 0.9em; color: #666;">If you didn't request this, you can safely ignore this email.</p>
           <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
           <p style="font-size: 0.8em; color: #999;">If the button doesn't work, copy and paste this link into your browser:</p>
           <p style="font-size: 0.8em; color: #999; word-break: break-all;">${resetLink}</p>
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
