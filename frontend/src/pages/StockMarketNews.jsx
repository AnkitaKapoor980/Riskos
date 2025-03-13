import { useState, useEffect } from 'react';
import { NewsCard } from '../components/NewsCard';

// This will be replaced with actual API data
const mockNews = [
  {
    title: 'Market Update: Tech Stocks Rally',
    summary: 'Major tech companies lead market gains as investor confidence grows.',
    source: 'StockStory',
    time: '10 minutes ago',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800',
  },
  // Placeholder for more news items
];

export function StockMarketNews() {
  const [news, setNews] = useState(mockNews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This useEffect will be used for Yahoo Finance API integration
  useEffect(() => {
    // Placeholder for Yahoo Finance API call
    // async function fetchNews() {
    //   try {
    //     setLoading(true);
    //     // const response = await fetch('YAHOO_FINANCE_API_ENDPOINT', {
    //     //   headers: {
    //     //     'x-api-key': process.env.YAHOO_FINANCE_API_KEY,
    //     //   }
    //     // });
    //     // const data = await response.json();
    //     // setNews(data);
    //   } catch (err) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchNews();
  }, []);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 text-lg font-semibold">Error loading news</h2>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock Market News</h1>
      <div className="grid gap-6">
        {news.map((item, index) => (
          <NewsCard key={index} {...item} />
        ))}
      </div>
    </main>
  );
}