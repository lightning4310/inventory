import mongoose from "mongoose";

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB", error);
    process.exit(1);
  }
};

// Ensure you export the function if needed
export default connectDB;
