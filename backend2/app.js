const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');  // Only this import is needed

// Initialize dotenv for environment variables
dotenv.config();

// Create an instance of express
const app = express();

// Connect to the database
connectDB();

// Middleware setup
app.use(express.json());  // Parses incoming JSON requests
app.use(cookieParser());  // Parses cookies attached to the request
app.use(cors({
    origin: 'http://localhost:3000',  // Allow the front-end to access the API
    credentials: true  // Allow sending cookies with requests
}));

// Routes setup
app.use('/api/auth', authRoutes);  // Define the route for authentication

// Set the server to listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
