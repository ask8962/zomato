'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { House, Search, Heart, MapPin } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated 404 */}
          <div className="mb-8">
            <div className="relative">
              {/* Large 404 Text */}
              <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text animate-pulse">
                404
              </h1>
              
              {/* Floating Food Elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-float" style={{ animationDelay: '0s' }}>
                  <div className="text-6xl absolute -top-8 -left-16">🍕</div>
                </div>
                <div className="animate-float" style={{ animationDelay: '1s' }}>
                  <div className="text-5xl absolute -top-12 right-8">🍔</div>
                </div>
                <div className="animate-float" style={{ animationDelay: '2s' }}>
                  <div className="text-4xl absolute bottom-4 -left-8">🍜</div>
                </div>
                <div className="animate-float" style={{ animationDelay: '1.5s' }}>
                  <div className="text-5xl absolute bottom-8 right-12">🍰</div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-12 animate-slide-in-up">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Oops! Page Not <span className="gradient-text">Found</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed">
              Looks like this page went out for delivery and got lost! 
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Don't worry, there's plenty of delicious food waiting for you on our homepage. 
              Let's get you back to browsing amazing restaurants!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in-scale">
            <Link
              href="/"
              className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center font-semibold text-lg"
            >
              <House className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Back to Home
            </Link>
            
            <Link
              href="/restaurants"
              className="group bg-white text-orange-600 border-2 border-orange-500 px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center font-semibold text-lg"
            >
              <Search className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Browse Restaurants
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-in-up">
            <div className="card-beautiful p-6 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Find Restaurants</h3>
              <p className="text-gray-600 mb-4">Discover amazing local restaurants in your area</p>
              <Link 
                href="/restaurants" 
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Explore Now →
              </Link>
            </div>

            <div className="card-beautiful p-6 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">Get support from our friendly team</p>
              <Link 
                href="/help" 
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                Get Help →
              </Link>
            </div>

            <div className="card-beautiful p-6 text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">About Us</h3>
              <p className="text-gray-600 mb-4">Learn more about our mission and story</p>
              <Link 
                href="/about" 
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Learn More →
              </Link>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="mt-16 p-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl border border-orange-200 animate-fade-in-scale">
            <div className="flex items-center justify-center mb-4">
              <div className="text-4xl animate-bounce">🍽️</div>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Did you know?</h4>
            <p className="text-gray-700">
              While you're here, over 1000+ customers are enjoying delicious meals delivered by FoodExpress! 
              Join them and discover your next favorite restaurant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 