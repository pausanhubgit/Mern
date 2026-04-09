import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["follow", "follow_back", "like", "comment", "event"],
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ recipient: 1, createdAt: -1 });

const NotificationModel = mongoose.model("Notification", NotificationSchema);
export default NotificationModel;
