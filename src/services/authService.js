import User from '../models/UserModel.js';
import ResetPassword from '../models/ResetPassword.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mainConfig from '../config/index.js';
import sendSMS from '../utils/sms.js';
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';

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
    });
    return {
        _id: registerUser._id,
        username: registerUser.username,
        email: registerUser.email,
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
         style="padding:5px 15px;
         background color:blue;
         color:black;
         text-decoration:none;
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

export default{register, login, forgetPassword, resetPassword};
