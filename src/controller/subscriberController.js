import Subscriber from '../models/SubscriberModel.js';
import connectToDatabase from '../config/database.js';
import mongoose from 'mongoose';

const subscribe = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email is already subscribed" });
        }
        const subscriber = await Subscriber.create({ email });
        res.status(201).json({ message: "Subscribed successfully", subscriber });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSubscribers = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectToDatabase();
        }
        const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
        res.status(200).json(subscribers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { subscribe, getSubscribers };
