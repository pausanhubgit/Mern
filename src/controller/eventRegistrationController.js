import EventRegistrationModel from "../models/EventRegistrationModel.js";
import EventModel from "../models/EventModel.js";

const registerForEvent = async (req, res, next) => {
    try {
        const { eventId, name, email, message } = req.body;
        const userId = req.user.userId || req.user._id || req.user.id;

        // Check if event exists
        const event = await EventModel.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // Check if already registered
        const existingRegistration = await EventRegistrationModel.findOne({ eventId, userId });
        if (existingRegistration) {
            return res.status(400).json({ message: "You are already registered for this event." });
        }

        const registration = await EventRegistrationModel.create({
            eventId,
            userId,
            name,
            email,
            message,
            status: "Pending"
        });

        res.status(201).json(registration);
    } catch (error) {
        next(error);
    }
};

const getEventRegistrations = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const registrations = await EventRegistrationModel.find({ eventId }).populate("userId", "name email");
        res.status(200).json(registrations);
    } catch (error) {
        next(error);
    }
};

const getMyRegistrations = async (req, res, next) => {
    try {
        const userId = req.user.userId || req.user._id || req.user.id;
        const registrations = await EventRegistrationModel.find({ userId }).populate("eventId", "title startDate eventType prizePool");
        res.status(200).json(registrations);
    } catch (error) {
        next(error);
    }
};

export default { registerForEvent, getEventRegistrations, getMyRegistrations };
