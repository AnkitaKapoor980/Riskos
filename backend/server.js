require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./db"); // MongoDB connection file
const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");
const riskAnalysisRoutes = require("./routes/RiskAnalysisRoutes");
const app = express();

// Middleware
app.use(express.json());

// CORS configuration (adjust based on your frontend port)
app.use(
  cors({
    origin: "http://localhost:5001",  // React frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// MongoDB connection
connectDB(); // Connect to MongoDB

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api", riskAnalysisRoutes);

// Example of getting current user (authentication should be handled properly)
app.get("/api/auth/current-user", (req, res) => {
  const user = req.user; // Assuming user info is attached to the request (JWT or session)
  if (user) {
    res.json(user);  // If user exists, return user data
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Base route (optional)
app.get("/", (req, res) => {
  res.send("RISKOS Backend is Running!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

