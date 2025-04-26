import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from "react-router-dom";
import Img1 from '../assets/img1.jpg';
import Img2 from '../assets/img2.jpg';
import Img3 from '../assets/img3.jpg';


function LandingPage() {
  return (
    <div className="bg-[#ffffff] min-h-screen text-black font-sans">
      
      {/* Hero Section */}
      <section className="relative w-full h-[500px] overflow-hidden">
        
        {/* Carousel as background */}
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={2000}
          className="h-full"
        >
          <div>
            <img src={Img1} alt="Stock Market" className="object-cover w-full h-[500px]" />
          </div>
          <div>
            <img src={Img2} alt="Skyscrapers" className="object-cover w-full h-[500px]" />
          </div>
          <div>
            <img src={Img3} alt="Digital Documents" className="object-cover w-full h-[500px]" />
          </div>
        </Carousel>

        {/* Teal content overlay */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center">
          <div className="bg-teal-900 bg-opacity-70 relative w-full h-[500px] overflow-hidden flex items-center justify-center">
            <div className="flex flex-col items-center text-center text-white">
              <h1 className="text-6xl font-extrabold leading-tight mb-4">
              RISKOS<br />Do Better.
              </h1>
              <ul className="space-y-2 text-lg mb-10">
                <li>Better Investments for a better future</li>
              </ul>
            </div>
          </div>
        </div>  

      </section>

      {/* Info Section */}
      <section className="w-11/12 max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-lg font-bold">
            Making investements easy<br />Easier and Smarter.
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Consist real-time stock price data of all the Nifty-50 listed companies.
          </p>
          <button className="mt-4 bg-gray-200 text-sm px-4 py-2 rounded border">Learn More ➜</button>
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
