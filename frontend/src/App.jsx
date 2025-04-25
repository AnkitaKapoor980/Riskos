import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { StockMarketNews } from './pages/StockMarketNews';
import { LiveMarketData } from './pages/LiveMarketData';
import { LandingPage } from './pages/LandingPage'
import { PortfolioDashboard } from './pages/PortfolioDashboard';
import { Assessment } from './pages/Assessment';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow"> {/* Add this wrapper with flex-grow */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/news" element={<StockMarketNews />} />
            <Route path="/market-data" element={<LiveMarketData />} />
            <Route path="/portfolio" element={<PortfolioDashboard />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>

        {/* Footer - now stays at bottom */}
        <footer className="bg-black text-white py-10 text-sm w-full">
          <div className="w-11/12 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <ul className="space-y-1">
                <li>Text</li>
                <li>Text</li>
                <li>Text</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For business</h4>
              <ul className="space-y-1">
                <li>Text</li>
                <li>Text</li>
                <li>Text</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Pricing</h4>
              <ul className="space-y-1">
                <li>Text</li>
                <li>Text</li>
                <li>Text</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Help</h4>
              <ul className="space-y-1">
                <li>Text</li>
                <li>Text</li>
                <li>Text</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">About Us</h4>
              <ul className="space-y-1">
                <li>Text</li>
                <li>Text</li>
                <li>Text</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-gray-400">
            <p>2025 Company Ltd. All rights reserved. <a href="#">Privacy Policy</a> <a href="#">Terms of Use</a> <a href="#">Cookie Policy</a> <a href="#">Manage Cookies</a></p>
            <div className="mt-4 flex justify-center gap-3">
              <i className="fab fa-instagram" />
              <i className="fab fa-linkedin" />
              <i className="fab fa-facebook" />
              <i className="fab fa-x-twitter" />
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
