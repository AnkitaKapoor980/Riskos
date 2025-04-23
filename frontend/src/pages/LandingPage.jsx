import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="bg-[#f5f5ec] min-h-screen text-black font-sans">
      {/* Navbar */}
      <nav className="bg-black text-white px-6 py-3 flex justify-between items-center">
        <div className="font-bold">LOGO</div>
        <div className="hidden md:flex gap-6 text-sm">
          <Link to="#">News</Link>
          <Link to="#">Live Market Data</Link>
          <Link to="#">Assessment</Link>
          <Link to="#">Learn</Link>
          <Link to="#">About Us</Link>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-black px-3 py-1 rounded text-sm">Log In</button>
          <button className="bg-[#3e5745] text-white px-3 py-1 rounded text-sm">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-11/12 max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-teal-900 text-white p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight">HEAD SECTION<br />TAG LINE</h1>
            <ul className="mt-4 space-y-1 text-sm">
              <li>➜ Feature 1</li>
              <li>➜ Feature 2</li>
              <li>➜ Feature 3</li>
            </ul>
          </div>
          <div className="mt-6 text-sm">
            <p>Want to know more ?</p>
            <div className="flex gap-3 mt-3">
              <button className="bg-indigo-900 text-white px-4 py-2 rounded">Sign Up</button>
              <button className="bg-white text-black px-4 py-2 rounded border">Log In</button>
            </div>
          </div>
        </div>
        <div className="bg-gray-300 h-64 flex items-center justify-center">
          <span className="text-gray-600">Image/Carousel</span>
        </div>
      </section>

      {/* Info Section */}
      <section className="w-11/12 max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-lg font-bold">
            Telling about all the company<br />and what companies we include
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Consist real-time stock price data of all the Nifty-50 listed companies. Includes text text text text.
          </p>
          <button className="mt-4 bg-gray-200 text-sm px-4 py-2 rounded border">View our partners ➜</button>
        </div>
        <div className="bg-gray-300 h-48 flex items-center justify-center">
          <span className="text-gray-600">Image</span>
        </div>
      </section>

      {/* Signup Section */}
      <section className="w-full mt-16 grid grid-cols-1 md:grid-cols-2">
        <div className="bg-gray-400 h-64 flex items-center justify-center">
          <span className="text-gray-700">Image</span>
        </div>
        <div className="bg-teal-900 text-white p-6 flex flex-col justify-center">
          <h3 className="text-lg font-bold">No fuss, free sign up.<br />No credit card needed</h3>
          <p className="mt-2 text-sm">
            The only way to see performance is to see it in its context.
          </p>
          <button className="mt-4 bg-white text-black text-sm px-4 py-2 rounded">Sign up for free ➜</button>
        </div>
      </section>

      
    </div>
  );
}

export { LandingPage };
