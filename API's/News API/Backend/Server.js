// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// NewsAPI endpoint
app.get('/api/news/general', async (req, res) => {
    try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'in',
                apiKey: process.env.NEWS_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stock news endpoint
app.get('/api/news/stocks', async (req, res) => {
    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'stock market OR finance',
                language: 'en',
                sortBy: 'publishedAt',
                apiKey: process.env.NEWS_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inshorts news endpoint
app.get('/api/news/inshorts', async (req, res) => {
    try {
        const response = await axios.get('https://inshortsapi.vercel.app/news?category=all');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});