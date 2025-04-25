require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5001", // React frontend port
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }));

connectDB();

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/risk", require("./routes/riskRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/market", require("./routes/marketRoutes"));

app.get("/", (req,res) => {
    res.send("RISKOS Backend is Running!")  
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});