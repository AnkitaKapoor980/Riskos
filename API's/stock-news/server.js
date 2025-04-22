const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Mock data as a fallback if API fails
const mockIndianStockNews = {
  "feed": [
    {
      "title": "Sensex Breaks 75,000 Mark for First Time in History",
      "summary": "The BSE Sensex crossed the historic 75,000 level today, driven by strong performance in IT and banking sectors amid positive global cues.",
      "banner_image": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "url": "https://example.com/sensex-75000",
      "time_published": "20250418T093000",
      "source": "Economic Times"
    },
    {
      "title": "RBI Maintains Status Quo on Repo Rate, Focus on Inflation Control",
      "summary": "The Reserve Bank of India kept the repo rate unchanged at 5.25% in its latest monetary policy meeting, citing the need to ensure inflation remains within target range.",
      "banner_image": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "url": "https://example.com/rbi-repo-rate",
      "time_published": "20250417T141500",
      "source": "Business Standard"
    },
    {
      "title": "Reliance Industries Announces Major Expansion in Green Energy Sector",
      "summary": "Mukesh Ambani-led Reliance Industries has unveiled plans to invest ₹75,000 crore in renewable energy initiatives over the next three years.",
      "banner_image": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "url": "https://example.com/reliance-green-energy",
      "time_published": "20250416T114500",
      "source": "Financial Express"
    },
    {
      "title": "IT Stocks Rally as Major Companies Report Strong Quarterly Results",
      "summary": "Leading Indian IT firms saw their stocks surge after reporting better-than-expected quarterly earnings and providing positive guidance for the coming fiscal year.",
      "banner_image": "https://images.unsplash.com/photo-1599658880436-c61792e70672?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "url": "https://example.com/it-stocks-rally",
      "time_published": "20250415T162000",
      "source": "Mint"
    },
    {
      "title": "Government Announces New PLI Scheme for Electronics Manufacturing",
      "summary": "The Indian government has introduced an expanded Production Linked Incentive scheme worth ₹38,000 crore to boost domestic electronics manufacturing.",
      "banner_image": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "url": "https://example.com/pli-scheme",
      "time_published": "20250414T100000",
      "source": "Hindu Business Line"
    },
    {
      "title": "SEBI Introduces New Regulations for Small and Medium REITs",
      "summary": "The Securities and Exchange Board of India has released a new regulatory framework for small and medium-sized Real Estate Investment Trusts to increase retail investor participation.",
      "banner_image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "url": "https://example.com/sebi-reits",
      "time_published": "20250413T133000",
      "source": "Economic Times"
    }
  ]
};

// Middleware
app.use(express.json());
app.use(cors());

// 1. Primary Source: NewsAPI
async function fetchFromNewsAPI() {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: '(Indian AND stock AND market) OR Sensex OR Nifty OR BSE OR NSE',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: process.env.NEWS_API_KEY
      },
      timeout: 8000
    });

    return response.data.articles.map(article => ({
      title: article.title,
      summary: article.description || 'No description available',
      banner_image: article.urlToImage || 'https://via.placeholder.com/600x400?text=Market+News',
      url: article.url,
      time_published: article.publishedAt,
      source: article.source?.name || 'Unknown Source'
    }));
  } catch (error) {
    console.error('NewsAPI Error:', error.message);
    return null;
  }
}

// 2. Fallback: Yahoo Finance Scraper
async function fetchFromYahooFinance() {
  try {
    const response = await axios.get('https://finance.yahoo.com/topic/stock-market-news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const articles = [];

    $('article.js-stream-content').slice(0, 8).each((i, el) => {
      const $el = $(el);
      articles.push({
        title: $el.find('h3').text().trim(),
        summary: $el.find('p').text().trim() || 'Click to read full story',
        banner_image: $el.find('img').attr('src') || 'https://via.placeholder.com/600x400?text=Yahoo+Finance',
        url: `https://finance.yahoo.com${$el.find('a').attr('href')}`,
        time_published: new Date().toISOString(), // Yahoo doesn't expose dates easily
        source: 'Yahoo Finance'
      });
    });

    return articles;
  } catch (error) {
    console.error('Yahoo Finance Scraping Error:', error.message);
    return null;
  }
}

// Main API Endpoint
app.get('/api/stock-news', async (req, res) => {
  console.log('Fetching latest market news...');
  
  let articles = null;
  
  // Try NewsAPI first
  if (process.env.NEWS_API_KEY) {
    articles = await fetchFromNewsAPI();
  }
  
  // If NewsAPI fails or isn't configured, try Yahoo
  if ((!articles || articles.length === 0) && !req.query.skipFallback) {
    articles = await fetchFromYahooFinance();
  }
  
  // If all else fails, use mock data
  if (!articles || articles.length === 0) {
    console.log('Using mock data as final fallback');
    articles = mockIndianStockNews.feed;
  }

  res.json({ 
    feed: articles.slice(0, 6), // Limit to 6 articles
    source: articles === mockIndianStockNews.feed ? 'mock' : 
            articles.some(a => a.source === 'Yahoo Finance') ? 'yahoo' : 'newsapi'
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    services: {
      newsapi: !!process.env.NEWS_API_KEY,
      yahoo: true, // Always available
      mock: true
    }
  });
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Available routes:`);
  console.log(`- GET /api/stock-news`);
  console.log(`- GET /api/health`);
});