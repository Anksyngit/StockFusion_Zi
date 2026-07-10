const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const Portfolio = require("./routes/Porfolio");
const Auth = require("./routes/auth");

const app = express();

app.use(express.json());

// ============================
// CORS
// ============================

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming Origin:", origin);

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// ============================
// Routes
// ============================

app.get("/", (req, res) => {
  res.send("Backend is alive!");
});

app.use("/api/auth", Auth);
app.use("/Portfolio", Portfolio);

// ============================
// Error Handler
// ============================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

// ============================
// Start Server
// ============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;