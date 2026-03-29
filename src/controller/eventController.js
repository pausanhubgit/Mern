import EventModel from "../models/EventModel.js";
import UserModel from "../models/UserModel.js";

const createEvent = async (req, res, next) => {
    try {
        const userId = req.user.userId || req.user._id || req.user.id;
        const newEvent = await EventModel.create({
            ...req.body,
            creatorUserId: userId
        });
        
        // Increment user's total events count
        await UserModel.findByIdAndUpdate(userId, { $inc: { totalEvents: 1 } });
        
        res.status(201).json(newEvent);
    } catch (error) {
        next(error);
    }
};

const getEvents = async (req, res, next) => {
    try {
        const events = await EventModel.find().populate("creatorUserId", "name email");
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

const deleteEvent = async (req, res, next) => {
    try {
        const id = req.params.id;
        const event = await EventModel.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const userId = event.creatorUserId;
        await EventModel.findByIdAndDelete(id);
        
        // Decrement user's total events count
        await UserModel.findByIdAndUpdate(userId, { $inc: { totalEvents: -1 } });

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const getEventCount = async (req, res, next) => {
    try {
        const count = await EventModel.countDocuments();
        res.status(200).json(count);
    } catch (error) {
        next(error);
    }
};

export default { createEvent, getEvents, deleteEvent, getEventCount };
