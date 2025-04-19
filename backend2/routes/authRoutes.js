const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Route
router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });
  
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  });
  

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.usernamename } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    // On the server side, there is nothing we need to do to log the user out since JWT is stateless.
    // But you can handle blacklisting here if desired.

    res.json({ msg: "User logged out successfully" });
});

// Exporting the router at the end
module.exports = router;
