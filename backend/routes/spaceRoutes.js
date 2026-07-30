import express from "express";
import Space from "../models/Space.js";
import Booking from "../models/Booking.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Attaches `availableNow` / `bookedUntil` to each space, based on whether
// there's a confirmed booking covering the current moment today.
const attachAvailability = async (spaces) => {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5); // "HH:MM" in server-local time

  const activeBookings = await Booking.find({
    date: today,
    status: "confirmed",
    startTime: { $lte: now },
    endTime: { $gt: now },
  }).select("space endTime");

  const bookedUntilBySpace = new Map();
  activeBookings.forEach((b) => bookedUntilBySpace.set(b.space.toString(), b.endTime));

  return spaces.map((space) => {
    const plain = space.toObject ? space.toObject() : space;
    const bookedUntil = bookedUntilBySpace.get(plain._id.toString()) || null;
    return { ...plain, availableNow: !bookedUntil, bookedUntil };
  });
};

// @route   GET /api/spaces
// @desc    List spaces with search, filtering, and sorting
// Query params: search, type, building, minCapacity, sort
router.get("/", async (req, res) => {
  try {
    const { search, type, building, minCapacity, sort } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (type) {
      query.type = type;
    }
    if (building) {
      query.building = building;
    }
    if (minCapacity) {
      query.capacity = { $gte: Number(minCapacity) };
    }

    let sortOption = { name: 1 }; // default: alphabetical
    if (sort === "capacity_desc") sortOption = { capacity: -1 };
    if (sort === "capacity_asc") sortOption = { capacity: 1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const spaces = await Space.find(query).sort(sortOption);
    const withAvailability = await attachAvailability(spaces);
    res.json(withAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/spaces/:id
router.get("/:id", async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Space not found" });
    const [withAvailability] = await attachAvailability([space]);
    res.json(withAvailability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/spaces  (admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const space = await Space.create(req.body);
    res.status(201).json(space);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/spaces/:id  (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const space = await Space.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!space) return res.status(404).json({ message: "Space not found" });
    res.json(space);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/spaces/:id  (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const space = await Space.findByIdAndDelete(req.params.id);
    if (!space) return res.status(404).json({ message: "Space not found" });
    res.json({ message: "Space deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
