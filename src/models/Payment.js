import mongoose from "mongoose";
import { payment_STATUS_COMPLETED, payment_STATUS_FAILED, payment_STATUS_PENDING } from "../constants/paymentStatus.js";

const paymentSchema =new mongoose.Schema({
    amount:{
        type:Number,
        required:[true,"amount is required"]
    },
    method:{
        type:String,
        required:[true,"method is required"],
        enum:["cash","card","online"]
    },
    status:{
        type:String,
        required:[true," Payment status is required"],
        enum:[payment_STATUS_PENDING, payment_STATUS_COMPLETED, payment_STATUS_FAILED],
        default: payment_STATUS_PENDING
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    transactionId:{
        type:String
    }
});
const paymentModel = mongoose.model("Payment",paymentSchema);
export default paymentModel;
