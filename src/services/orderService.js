import Order from "../models/OrderModel.js";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import paymentUtil from "../utils/payment.js";
import { ORDER_STATUS_CONFIRMED, ORDER_STATUS_CANCELLED, ORDER_STATUS_PENDING } from "../constants/orderStatus.js";
import { payment_STATUS_COMPLETED, payment_STATUS_FAILED } from "../constants/paymentStatus.js";
import mongoose from 'mongoose';
import connectToDatabase from '../config/database.js';

const getOrders = async () => {
    const orders = await Order.find()
        .populate('orderItems.artId')
        .populate("userid", [ "username", "email", "phone", "address"]);
    return orders;
};
const getOrderByUser = async (userId) => {
    const orders = await Order.find({ userid: userId })
        .populate('orderItems.artId')
        .populate("userid", [ "username", "email", "phone", "address"])
        .populate("payment");
    return orders;
};
const getOrderById = async(id)=>{
    const order = await Order.findById(id)
    .populate("orderItems.artId")
    .populate("userid",["username","email","phone","address"])
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
    if(order.userid != user._id){
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
        amount: order.totalPrice,
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


export default {getOrders,getOrderById, getOrdersOfMerchant,createOrder, deleteOrder,getOrderByUser,updateOrder,orderPaymentViaKhalti,confirmOrderPayment};