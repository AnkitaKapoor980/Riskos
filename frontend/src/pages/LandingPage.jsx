import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="bg-white min-h-screen w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-4/5 flex flex-col md:flex-row mt-10 space-y-6 md:space-y-0 md:space-x-6">
        <div className="bg-teal-900 text-white p-6 flex flex-col justify-center w-full md:w-2/5">
          <h1 className="text-3xl font-bold">Make smart investments </h1>
          <ul className="mt-4 space-y-2">
            <li>➜ Feature 1</li>
            <li>➜ Feature 2</li>
            <li>➜ Feature 3</li>
          </ul>
          <div className="mt-6 flex space-x-4">
            <button className="bg-blue-800 text-white px-4 py-2 rounded">Sign Up</button>
            <button className="bg-white text-black px-4 py-2 rounded border">Log In</button>
          </div>
        </div>
        <div className="bg-gray-300 w-full md:w-3/5 h-60 flex items-center justify-center">
          <span>Image/Carousel</span>
        </div>
      </section>

      {/* Info Section */}
      <section className="w-4/5 mt-12 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
        <div className="w-full md:w-2/5">
          <h2 className="text-xl font-bold">Telling about all the company and what companies we include</h2>
          <p className="mt-2 text-gray-700">Consist real-time stock price data of all the Nifty-50 listed companies.</p>
          <button className="mt-4 bg-gray-200 px-4 py-2 rounded border">View our partners ➜</button>
        </div>
        <div className="bg-gray-300 w-full md:w-3/5 h-48 flex items-center justify-center">
          <span>Image</span>
        </div>
      </section>

      {/* Signup Section */}
      <section className="w-4/5 mt-12 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
        <div className="bg-gray-300 w-full md:w-3/5 h-48 flex items-center justify-center">
          <span>Image</span>
        </div>
        <div className="w-full md:w-2/5 bg-teal-900 text-white p-6">
          <h3 className="text-xl font-bold">No fuss, free sign up. No credit card needed</h3>
          <p className="mt-2">The only way to see performance is to see it in its context.</p>
          <button className="mt-4 bg-white text-black px-4 py-2 rounded">Sign up for free ➜</button>
        </div>
      </section>
    </div>
  );
}

export { LandingPage };