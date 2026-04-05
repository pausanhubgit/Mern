import EventModel from "../models/EventModel.js";
import UserModel from "../models/UserModel.js";
import EventRegistrationModel from "../models/EventRegistrationModel.js";

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
        const events = await EventModel.find().populate("creatorUserId", "name email").lean();
        
        // Attach registrations count or details
        const enrichedEvents = await Promise.all(events.map(async (event) => {
            const registrations = await EventRegistrationModel.find({ eventId: event._id });
            return { ...event, registrations };
        }));

        res.status(200).json(enrichedEvents);
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

const getEventById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const event = await EventModel.findById(id).populate("creatorUserId", "name username email profileImageUrl").lean();
        if (!event) return res.status(404).json({ message: "Event not found" });

        const registrations = await EventRegistrationModel.find({ eventId: id }).populate("userId", "name username email profileImageUrl").lean();
        event.registrations = registrations;

        res.status(200).json(event);
    } catch (error) {
        next(error);
    }
};

const updateEvent = async (req, res, next) => {
    try {
        const id = req.params.id;
        const updated = await EventModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Event not found" });
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export default { createEvent, getEvents, getEventById, updateEvent, deleteEvent, getEventCount };
