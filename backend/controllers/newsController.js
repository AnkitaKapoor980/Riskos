const axios = require("axios");

const getLatestNews = async (req, res) => {
    try {
        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
            params: {
                country: "in",
                category: "business",
                apiKey: process.env.NEWS_API_KEY
            }
        });

        const articles = response.data.articles.map(article => ({
            title: article.title,
            summary: article.description,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt
        }));

        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch live news", error: error.message });
    }
};

module.exports = { getLatestNews };
