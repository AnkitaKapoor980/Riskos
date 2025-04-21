import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { StockMarketNews } from './pages/StockMarketNews';
import { LiveMarketData } from './pages/LiveMarketData';
import { LandingPage } from './pages/LandingPage'
import { PortfolioDashboard } from './pages/PortfolioDashboard';
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/news" element={<StockMarketNews />} />
        <Route path="/market-data" element={<LiveMarketData />} />
        <Route path="/portfolio" element={<PortfolioDashboard />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Features</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Text</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Text</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Text</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;