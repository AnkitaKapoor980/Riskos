const express = require("express");
const router = express.Router();
const {registerUser, loginUser, getUser} = require("../controllers/authController");
const {protect} = require("../middleware/authMidlleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/me", protect, getUser);

module.exports = router;
