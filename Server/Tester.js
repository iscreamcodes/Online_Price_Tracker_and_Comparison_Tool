import mongoose from "mongoose";
import Users from "./Model/users.js";

async function addUserCodes() {
  await mongoose.connect("mongodb://localhost:27017/price_tracker_db");

  const users = await Users.find({ User_code: { $exists: false } });

  for (const user of users) {
    user.User_code = "USR-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    await user.save();
  }

  console.log("All users updated with User_code.");
  process.exit();
}

addUserCodes();
