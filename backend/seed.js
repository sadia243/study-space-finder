// Populates the database with demo data so you have something to show immediately.
// Run with: npm run seed
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Space from "./models/Space.js";
import Booking from "./models/Booking.js";

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany(), Space.deleteMany(), Booking.deleteMany()]);

  const admin = await User.create({
    name: "Library Admin",
    email: "admin@uni.ac.uk",
    password: "password123",
    role: "admin",
  });

  const student = await User.create({
    name: "Sam Student",
    email: "sam@uni.ac.uk",
    password: "password123",
    role: "student",
  });

  const spaces = await Space.insertMany([
    {
      name: "Desk A1",
      building: "Main Library",
      floor: "Ground Floor",
      type: "individual_desk",
      capacity: 1,
      amenities: ["power outlet"],
      description: "Quiet individual desk near the window.",
    },
    {
      name: "Group Room 2",
      building: "Main Library",
      floor: "1st Floor",
      type: "group_room",
      capacity: 6,
      amenities: ["whiteboard", "monitor", "power outlet"],
      description: "Bookable group room with a wall-mounted screen.",
    },
    {
      name: "Quiet Zone B",
      building: "Main Library",
      floor: "2nd Floor",
      type: "quiet_zone",
      capacity: 20,
      amenities: ["power outlet"],
      description: "Silent study area, laptops only.",
    },
    {
      name: "Computer Pod 5",
      building: "Science Library",
      floor: "Ground Floor",
      type: "computer_pod",
      capacity: 1,
      amenities: ["desktop PC", "power outlet"],
      description: "Fixed desktop workstation with design software installed.",
    },
    {
      name: "Group Room 7",
      building: "Science Library",
      floor: "1st Floor",
      type: "group_room",
      capacity: 4,
      amenities: ["whiteboard"],
      description: "Small group room, good for project meetings.",
    },
  ]);

  await Booking.create({
    user: student._id,
    space: spaces[1]._id,
    date: new Date().toISOString().slice(0, 10),
    startTime: "14:00",
    endTime: "15:00",
  });

  console.log("Seed complete:");
  console.log(`  Admin login:   admin@uni.ac.uk / password123`);
  console.log(`  Student login: sam@uni.ac.uk / password123`);
  console.log(`  Spaces created: ${spaces.length}`);
  process.exit();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
