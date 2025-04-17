const mongoose = require("mongoose");
require('dotenv').config;

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/RISKOS";

const connectDB = async () => {
    try{
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected");
    }
    catch(err) {
        console.error("MongoDB connection Error", err);
        process.exit(1);
    }
};

module.exports = connectDB