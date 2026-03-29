import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventType: { type: String, enum: ["Art", "Music", "Video"], required: true },
    prizePool: { type: String }, // e.g., "$500", "Top placement"
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ["Upcoming", "Active", "Completed"], default: "Active" },
    creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const EventModel = mongoose.models.Event || mongoose.model("Event", eventSchema);
export default EventModel;
