const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const Portfolio = require("./routes/Porfolio");
const Auth = require("./routes/auth");

const app = express();

// Middleware
app.use(express.json());

// Allowed Origins
const allowedOrigins = [
  "http://localhost:8080",
  process.env.FRONTEND_URL,
];

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is alive!");
});

// Routes
app.use("/api/auth", Auth);
app.use("/Portfolio", Portfolio);

// Error Handler
app.use((err, req, res, next) => {
  const errStatus = err.status || 500;
  const errMessage = err.message || "Something went wrong!";

  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMessage,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;