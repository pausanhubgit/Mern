import mongoose from "mongoose";

const resetPasswordSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true,"Reset password code is required."],
    },

    expiresAt:{
        type:Date,
        default:()=>{
            const now = new Date();
            now.setHours(now.getHours() + 1);
            return now;
        }
    },
    isUsed:{
        type:Boolean,
        default:false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
      },

});

const model = mongoose.model("ResetPassword", resetPasswordSchema);
export default model;