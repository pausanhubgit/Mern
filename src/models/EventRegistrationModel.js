import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String }, // Optional message/introduction from registrant
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

const EventRegistrationModel = mongoose.models.EventRegistration || mongoose.model("EventRegistration", eventRegistrationSchema);
export default EventRegistrationModel;
