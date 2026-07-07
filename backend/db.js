const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(url);

    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Error connecting to the database:");
    console.error(err);
    process.exit(1);
  }
};

// Connection Events
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB Connected");
});

mongoose.connection.on("disconnected", () => {
  console.log("🔴 MongoDB Disconnected");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB Error:", err);
});

module.exports = connectDB;