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

const isGoogleEmail = (email) => {
    const googleDomains = ['gmail.com', 'googlemail.com'];
    const domain = email.split('@')[1];
    return googleDomains.includes(domain);
};

const register = async(data) =>{
    if (!isGoogleEmail(data.email)) {
        throw new Error("Only Google emails are allowed for registration");
    }
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }

    let user = await User.findOne({ email: data.email });
    
    // If the user was created as a placeholder for OTP verification, we update it.
    if (user && user.password === 'PENDING_VERIFICATION') {
        if (!user.isEmailVerified && !user.isPhoneVerified) {
            throw new Error("Account must be verified via Email or Phone before registration");
        }
        
        user.username = data.username;
        user.password = bcrypt.hashSync(data.password);
        user.roles = [Merchant];
        user.isVerified = true;
        await user.save();
        
        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
        };
    }

    if(user){
        throw new Error("User already exists");
    }

    const hashedPassword = bcrypt.hashSync(data.password);
    console.log('[REGISTER] Creating user:', data.email);
   
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
    if (!isGoogleEmail(data.email)) {
        throw new Error("Only Google emails are allowed for login");
    }
   if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const user = await User.findOne({email: data.email});
    console.log('[LOGIN] User found:', user ? 'Yes' : 'No', 'Email:', data.email);
    if(!user){
        throw new Error("User not found");
    }
    const isMatch = bcrypt.compareSync(data.password, user.password);
    console.log('[LOGIN] Password match:', isMatch);
    if(!isMatch){
        throw new Error("Invalid email or password");
    }
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
    };
};

const forgetPassword = async (identifier, method, redirectUrl) =>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    
    const query = method === 'email' ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query);
    if(!user)  throw{statusCode:404, message:"User not found"};
 
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit reset code
 
    await ResetPassword.create({
         userId: user._id,
         code,
     });
 
     if (method === 'phone') {
         throw { statusCode: 400, message: "SMS reset is currently disabled. Please use Email." };
     }

     const resetBaseUrl = redirectUrl || `${mainConfig.appUrl}/reset-password`;
     const resetLink = `${resetBaseUrl}?userId=${user._id}&identifier=${encodeURIComponent(identifier)}`; 
     
     await sendEmail(identifier, {
         subject:"Reset Password Code",
         body:`
         <div style="font-family: sans-serif; padding: 20px; color: #333;">
           <h2 style="color: #6d28d9;">Reset Your Password</h2>
           <p>Your password reset code is: <b style="font-size: 24px;">${code}</b></p>
           <p>Click the button below and enter the code into the form:</p>
           <div style="margin: 25px 0;">
             <a href="${resetLink}"
                style="padding: 12px 24px;
                       background-color: #6d28d9;
                       color: white;
                       text-decoration: none;
                       border-radius: 8px;
                       font-weight: bold;
                       display: inline-block;">
               Reset Password Page
             </a>
           </div>
           <p>If you did not request this, please ignore this email.</p>
         </div>
         `
     });
 
     return { message: `Reset code sent to your ${method}` };
};



const resetPassword = async(userId, code, newPassword) =>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const data = await ResetPassword.findOne({
        userId: userId,
        code: code,
        expiresAt:{$gt:Date.now()},
    }).sort({expiresAt:-1});
 
    if(!data){
        throw new Error("Invalid or expired reset code");
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
    const { email, name, picture, sub, email_verified } = ticket.getPayload();

    if (!email_verified) {
        throw new Error("Google email is not verified");
    }

    let user = await User.findOne({ email });

    if (!user) {
        // New user — create with Merchant role
        user = await User.create({
            username: name,
            email: email,
            profileImageUrl: picture,
            googleId: sub,
            password: bcrypt.hashSync(crypto.randomBytes(16).toString('hex')),
            roles: [Merchant],
            isVerified: true
        });
    } else {
        // Existing user — ensure Merchant role is assigned (auto-upgrade)
        let updated = false;
        if (!user.roles) {
            user.roles = [Merchant];
            updated = true;
        } else if (!user.roles.includes(Merchant)) {
            user.roles = [...user.roles, Merchant];
            updated = true;
        }
        // Also update googleId and picture if missing
        if (!user.googleId) { user.googleId = sub; updated = true; }
        if (!user.isVerified) { user.isVerified = true; updated = true; }
        if (updated) await user.save();
    }

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
    };
};

const requestOTP = async (contactInfo, method) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    let user = await User.findOne({ 
        $or: [{ email: contactInfo }, { phone: contactInfo }] 
    });

    if (!user) {
        // If user doesn't exist, we create a "pending" user or handle it pre-registration.
        // For simplicity, we'll store it in a way that can be retrieved during registration.
        // Or we could just return the OTP and let the frontend handle it, but that's insecure.
        // Let's create a placeholder user for verification.
        const userData = method === 'email' ? { email: contactInfo, username: contactInfo.split('@')[0], password: 'PENDING_VERIFICATION' } : { phone: contactInfo, username: contactInfo, password: 'PENDING_VERIFICATION' };
        user = await User.create(userData);
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.otpMethod = method;
    await user.save();

    if (method === 'phone') {
        throw new Error("SMS verification is currently disabled. Please use Email.");
    }

    await sendEmail(contactInfo, {
        subject: "Your Verification Code",
        body: `<p>Your verification code is: <b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`
    });

    return { message: `Verification code sent to ${contactInfo}` };
};

const verifyOTP = async (contactInfo, otp) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }

    const user = await User.findOne({
        $or: [{ email: contactInfo }, { phone: contactInfo }],
        otp: otp,
        otpExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error("Invalid or expired verification code");
    }

    if (user.otpMethod === 'email') {
        user.isEmailVerified = true;
    } else {
        user.isPhoneVerified = true;
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { message: "Verification successful" };
};

export default { register, login, forgetPassword, resetPassword, googleLogin, requestOTP, verifyOTP };
