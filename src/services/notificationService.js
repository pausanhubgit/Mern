import NotificationModel from "../models/NotificationModel.js";
import connectToDatabase from "../config/database.js";
import mongoose from "mongoose";

const getNotifications = async (userId) => {
    if (mongoose.connection.readyState !== 1) await connectToDatabase();
    return await NotificationModel.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .populate('sender', 'username name profileImageUrl');
};

const markAsRead = async (notifId, userId) => {
    if (mongoose.connection.readyState !== 1) await connectToDatabase();
    return await NotificationModel.findOneAndUpdate(
        { _id: notifId, recipient: userId },
        { read: true },
        { new: true }
    );
};

const deleteNotification = async (notifId, userId) => {
    if (mongoose.connection.readyState !== 1) await connectToDatabase();
    return await NotificationModel.findOneAndDelete({ _id: notifId, recipient: userId });
};

const createNotification = async (data) => {
    if (mongoose.connection.readyState !== 1) await connectToDatabase();
    return await NotificationModel.create(data);
};

const markAllRead = async (userId) => {
    if (mongoose.connection.readyState !== 1) await connectToDatabase();
    return await NotificationModel.updateMany(
        { recipient: userId, read: false },
        { read: true }
    );
};

const deleteAll = async (userId) => {
    if (mongoose.connection.readyState !== 1) await connectToDatabase();
    return await NotificationModel.deleteMany({ recipient: userId });
};

export default { getNotifications, markAsRead, createNotification, deleteNotification, markAllRead, deleteAll };
