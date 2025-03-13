import { Link } from 'react-router-dom';
import clsx from 'clsx';
import logo from '../assets/riskosalt.png'; // Import the logo

const NavLink = ({ children, to, active }) => (
  <Link
    to={to}
    className={clsx(
      'px-4 py-2 text-sm font-medium rounded-md',
      active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
    )}
  >
    {children}
  </Link>
);

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img className="h-10 w-auto" src={logo} alt="Riskos Logo" />
            </Link>
            <div className="hidden sm:flex sm:space-x-6">
              <NavLink to="/news">News</NavLink>
              <NavLink to="/market-data">Live Market Data</NavLink>
              <NavLink to="/assessment">Assessment</NavLink>
              <NavLink to="/learn">Learn</NavLink>
              <NavLink to="/about">About Us</NavLink>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Log In
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
