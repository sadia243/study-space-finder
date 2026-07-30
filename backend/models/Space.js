import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    building: { type: String, required: true, trim: true },
    floor: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["individual_desk", "group_room", "quiet_zone", "computer_pod"],
      required: true,
    },
    capacity: { type: Number, required: true, min: 1 },
    amenities: [{ type: String, trim: true }], // e.g. ["power outlet", "whiteboard", "monitor"]
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true }, // lets admin retire a space without deleting history
  },
  { timestamps: true }
);

// Supports text search on name/building/description
spaceSchema.index({ name: "text", building: "text", description: "text" });

export default mongoose.model("Space", spaceSchema);
