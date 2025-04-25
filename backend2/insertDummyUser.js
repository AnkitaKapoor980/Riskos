// insertDummyUser.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user'); // Adjust this path based on your project

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('✅ Connected to MongoDB');

    const newUser = new User({
        username: 'trail1',
        email: 'trail@gmail.com',
        password: 'abcde'  // Normally this should be hashed
    });

    const savedUser = await newUser.save();
    console.log('🆕 Dummy user inserted:', savedUser);
    console.log('🆔 Use this user ID for portfolio creation:', savedUser._id);

    mongoose.disconnect();
})
.catch(err => {
    console.error('❌ Error:', err.message);
});
