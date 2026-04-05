import mongoose from "mongoose";
import { Admin, Merchant,User } from "../constants/roles.js";

const UserSchema = new mongoose.Schema({
    username: { type: String,required: true},
    email: { type: String, required: false, lowercase: true, unique: true, sparse: true, validate: {
        validator: function(value) {
            if (!value) return true; // Allow null/empty for phone-only users
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }
    }},
    isVerified: { type: Boolean, default: false },
    phone: { 
        type: String, 
        unique: true, 
        sparse: true,
            validator: function(v) {
                if (!v) return true;
                // Generic international mobile number regex
                return /^\+[1-9]\d{1,14}$/.test(v);
            },
            message: props => `${props.value} is not a valid international phone number!`
    },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    otpMethod: { type: String, enum: ['email', 'phone'] },


    
    password: { type: String, required: [true, "Password is required"] },
    profileImageUrl: { type: String },
    bio: { type: String, default: "" },
    city: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now, immutable: true },
    roles: { type: [String], default: [User] , enum: [User, Admin, Merchant]},
    badges: { type: [String], default: [] },
    totalArts: { type: Number, default: 0 },
    totalMusics: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
    totalReactions: { type: Number, default: 0 },
    coverImageUrl: { type: String, default: "" },
    revenue: { type: Number, default: 0 },
    cart: [
        {
            artId: { type: mongoose.Schema.Types.ObjectId, ref: "Art" },
            quantity: { type: Number, default: 1 },
        },
    ],
});
const UserModel = mongoose.model("User", UserSchema);
export default UserModel; 