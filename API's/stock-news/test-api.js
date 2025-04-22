// Save this as test-api.js and run with node test-api.js
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.NEWS_API_KEY;
console.log('Using API key:', apiKey ? `${apiKey.substring(0, 5)}...` : 'No key found');

async function testNewsAPI() {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'stock market',
        apiKey: apiKey
      }
    });
    
    console.log('API call successful!');
    console.log('Status:', response.status);
    console.log('Number of articles:', response.data.articles.length);
    console.log('First article title:', response.data.articles[0].title);
  } catch (error) {
    console.error('API call failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testNewsAPI();  