import express from "express";
import Booking from "../models/Booking.js";
import Space from "../models/Space.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/bookings/mine
router.get("/mine", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("space", "name building floor type")
      .sort({ date: 1, startTime: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/bookings
// @desc    Create a booking, rejecting overlapping time slots for the same space
router.post("/", protect, async (req, res) => {
  try {
    const { space, date, startTime, endTime } = req.body;

    if (!space || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "space, date, startTime, and endTime are required" });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ message: "startTime must be before endTime" });
    }

    const spaceDoc = await Space.findById(space);
    if (!spaceDoc || !spaceDoc.isActive) {
      return res.status(404).json({ message: "Space not found" });
    }

    // Check for an overlapping, still-confirmed booking on the same space/date
    const overlap = await Booking.findOne({
      space,
      date,
      status: "confirmed",
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (overlap) {
      return res.status(409).json({ message: "This space is already booked for that time slot" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      space,
      date,
      startTime,
      endTime,
    });

    const populated = await booking.populate("space", "name building floor type");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/bookings/:id  (cancel a booking - owner or admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/admin/all  (admin only)
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("space", "name building")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/admin/stats  (admin only)
// @desc    Basic reporting: bookings per space, bookings per day, totals
router.get("/admin/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ status: "confirmed" });
    const totalSpaces = await Space.countDocuments({ isActive: true });
    const totalUsers = await Booking.distinct("user").then((ids) => ids.length);

    const bySpace = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: "$space", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "spaces",
          localField: "_id",
          foreignField: "_id",
          as: "space",
        },
      },
      { $unwind: "$space" },
      { $project: { _id: 0, name: "$space.name", count: 1 } },
    ]);

    const byDay = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: "$date", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ totalBookings, totalSpaces, totalUsers, bySpace, byDay });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
