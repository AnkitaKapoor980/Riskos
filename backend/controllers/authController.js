const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        let user = await User.findOne({email});
        if(user) {
            return res.status(400).json({message: "User already exsists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser =  new User({
            name,
            email,
            password: hashedPassword
        });
        const savedUser = await new User(newUser).save();

        const token = generateToken(savedUser._id);
        
        res.status(201).json({
            _id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            token
        });
    }
    catch(error) {
        res.status(500).json({message: "Error in registering user", erro:error.message});
    }
};

const loginUser = async(req,res) => {
    try{
        const{email,password} = req.body;

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: "Invalid Credentials"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({message: "Invalid email or password"});
        }

        const token = generateToken(user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        });
    }
    catch(error) {
        res.status(500).json({message: "Sevrer Error", error:error.message});
    }
};

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"});
};

module.exports = {registerUser, loginUser};
