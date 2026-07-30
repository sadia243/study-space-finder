import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    space: { type: mongoose.Schema.Types.ObjectId, ref: "Space", required: true },
    date: { type: String, required: true }, // stored as "YYYY-MM-DD" for simple querying
    startTime: { type: String, required: true }, // "HH:MM" 24hr
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

bookingSchema.index({ space: 1, date: 1 });

export default mongoose.model("Booking", bookingSchema);
