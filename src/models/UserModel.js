import mongoose from "mongoose";
import { Admin, Merchant,User } from "../constants/roles.js";

const UserSchema = new mongoose.Schema({
    username: { type: String,required: true},
    email: { type: String, required: true, lowercase: true, unique: true, validate: {
        validator: function(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }
    }},
    
    password: { type: String, required: [true, "Password is required"] },
    profileImageUrl: { type: String },
    createdAt: { type: Date, default: Date.now, immutable: true },
    roles: { type: [String], default: [User] , enum: [User, Admin, Merchant]},
    badges: { type: [String], default: [] },
    totalArts: { type: Number, default: 0 },
    totalMusics: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    totalReactions: { type: Number, default: 0 },
});
const UserModel = mongoose.model("User", UserSchema);
export default UserModel; 