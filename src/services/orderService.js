import Order from "../models/OrderModel.js";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import paymentUtil from "../utils/payment.js";
import { ORDER_STATUS_CONFIRMED, ORDER_STATUS_CANCELLED, ORDER_STATUS_PENDING } from "../constants/orderStatus.js";
import { payment_STATUS_COMPLETED, payment_STATUS_FAILED } from "../constants/paymentStatus.js";
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';

const getOrders = async () => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const orders = await Order.find()
        .populate('orderItems.artId')
        .populate("userid", [ "username", "email", "phone", "address"]);
    return orders;
};
const getOrderByUser = async (query,userId) => {
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const orders = await Order.find({ status:query?.status||ORDER_STATUS_PENDING, userid:userId })
    .sort({createdAt:-1})
        .populate('orderItems.artId')
        .populate("userid", [ "username", "email", "phone", "address"])
        .populate("payment");
    return orders;
};
const getOrderById = async(id)=>{
    if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
    }
    const order = await Order.findById(id)
    .populate("orderItems.artId")
    .populate("userid",["_id","username","email","phone","address"])
    .populate("payment");
    if(!order){
        throw{
            statusCode:404,
            message:"order not found",
        };

    }
    return order;
};

const createOrder = async (data, userid) => {
    const orderNumber = crypto.randomUUID();
    return await Order.create({ ...data, userid:userid, orderNumber });
};
const updateOrder = async (id,data,user)=>{
    const order = await getOrderById(id);
    if(order.user._id != user._id){
        throw{
            statusCode:403,
            message:"Unauthorized to update this order",
        };
    }
    return await Order.findByIdAndUpdate(id,{
        status:data.status,
    },{new:true});
}
 
const deleteOrder = async (id,user) => {
        const order = await getOrderById(id);
    if(order.userid._id != user._id && !user.roles.includes("Admin")){
        throw{
            statusCode:403,
            message:"Unauthorized to update this order",
        };
    }
    return await Order.findByIdAndDelete(id);
};

const orderPaymentViaKhalti = async(id,user)=>{
    const order = await getOrderById(id);
    if(order.userid._id != user._id){
        throw{
            statusCode:403,
            message:"Unauthorized to update this order",
        };
    }
    const transactionId = crypto.randomUUID();
    const orderPayment = await Payment.create({
        amount: order.totalPrice,
        method: 'online',
        transactionId,
        status: 'pending'
    });
    await Order.findByIdAndUpdate(id,{
        payment: orderPayment._id,
        status: ORDER_STATUS_PENDING,
    });
    return await paymentUtil.payViaKhalti({
        amount: Math.round(order.totalPrice * 100),
        purchaseOrderId: order.id,
        purchaseOrderName: order.orderNumber,
        customer: order.userid,
    });
};

const confirmOrderPayment = async(id,status,user)=>{
    const order = await getOrderById(id);
    if(order.userid._id != user._id){
        throw{
            statusCode:403,
            message:"Unauthorized to update this order",
        };
    }
    const s = (status || "").toString().toLowerCase();
    const paymentId = order.payment && order.payment._id ? order.payment._id : order.payment;
    if(!paymentId) throw { statusCode: 400, message: "No payment associated with this order" };

    if(s === "success" || s === payment_STATUS_COMPLETED){
        await Payment.findByIdAndUpdate(paymentId, { $set: { status: payment_STATUS_COMPLETED } });
        await Order.findByIdAndUpdate(id, { $set: { status: ORDER_STATUS_CONFIRMED } });
        
        // 40% Profit to Admin
        const profit = (order.totalPrice || 0) * 0.40;
        await UserModel.findOneAndUpdate(
            { roles: "Admin" }, 
            { $inc: { revenue: profit } }
        );
    } else {
        await Payment.findByIdAndUpdate(paymentId, { $set: { status: payment_STATUS_FAILED } });
        await Order.findByIdAndUpdate(id, { $set: { status: ORDER_STATUS_CANCELLED } });
    }
    return await getOrderById(id);
};
const getOrdersOfMerchant = async (merchantId) => {

const orders = await Order.aggregate([
    {
        $lookup: {
            from: "arts",
            localField: "orderItems.artId",
            foreignField: "_id",
            as: "artItems",
        },
    },
    {
        $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "user",
        },
    },
    {
$unwind: "$user",
    },
    {
     $project:{
        "user.username":1,
        "user.email":1,
        "user.phone":1,
        "user.address":1,
          artItems:1,
        orderItems:1,
        totalPrice:1,
        status:1,
        createdAt:1,
        payment:1,
     }
    },
]);

return orders
.map((order) => {
    const filteredItems = order.artItems.filter(
        (item)=>item.createdBy == merchantId
    );
    return {
        ...order,
        orderItems:filteredItems,
    };
}).filter((order)=>order.orderItems.length > 0);

};


const markAsCOD = async(id, user, data = {})=>{
    const order = await getOrderById(id);
    if(order.userid._id != user._id){
        throw{
            statusCode:403,
            message:"Unauthorized to update this order",
        };
    }
    const transactionId = crypto.randomUUID();
    const orderPayment = await Payment.create({
        amount: order.totalPrice,
        method: 'cod',
        transactionId,
        status: 'pending'
    });
    
    // Update the shipping address and optionally the user's phone/email
    const updatePayload = {
        payment: orderPayment._id,
        status: "shipped",
    };
    if (data.address || data.city || data.Province || data.country) {
        updatePayload.shippingAddress = {
             street: data.address || order.shippingAddress?.street,
             city: data.city || order.shippingAddress?.city || "Unknown",
             Province: data.Province || order.shippingAddress?.Province || "Unknown",
             country: data.country || order.shippingAddress?.country || "Nepal"
        };
    }
    
    // Also optionally update User profile if new phone/email is provided
    if (data.phone || data.email) {
        await mongoose.model('User').findByIdAndUpdate(user._id, {
            $set: { 
               ...(data.phone && { phone: data.phone }),
               ...(data.email && { email: data.email })
            }
        });
    }

    return await Order.findByIdAndUpdate(id, updatePayload, { new: true });
};

const cancelOrder = async(id, user)=>{
    const order = await getOrderById(id);
    if(order.userid._id != user._id && !user.roles?.includes("Admin")){
        throw{
            statusCode:403,
            message:"Unauthorized to update this order",
        };
    }
    return await Order.findByIdAndUpdate(id,{
        status: ORDER_STATUS_CANCELLED,
    }, { new: true });
};

export default {getOrders,getOrderById, getOrdersOfMerchant,createOrder, deleteOrder,getOrderByUser,updateOrder,orderPaymentViaKhalti,confirmOrderPayment,markAsCOD,cancelOrder};