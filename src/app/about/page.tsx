'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { Heart, Users, Award, Zap, Target, Shield, TrendingUp, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              About <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">FoodExpress</span>
            </h1>
            <p className="text-2xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing food delivery in tier 2 & 3 cities across India
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-orange-600">Story</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6"></div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              FoodExpress was born from a simple observation: While metropolitan cities enjoyed the convenience of food delivery apps, tier 2 and 3 cities were largely underserved. We saw an opportunity to bridge this gap and bring the same level of convenience to smaller cities across India.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Founded with a mission to support local restaurants and empower communities, FoodExpress has grown from a small startup to a platform serving thousands of customers and hundreds of restaurant partners. We believe that everyone deserves access to quality food delivery services, regardless of where they live.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              Today, we're proud to be making a real difference in the lives of restaurant owners, delivery partners, and food lovers in cities that were previously overlooked by major food delivery platforms.
            </p>
          </div>
        </div>

        {/* Our Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              To democratize food delivery by bringing restaurant-quality meals to every doorstep in tier 2 and 3 cities, while supporting local businesses and creating economic opportunities for our communities.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              To become India's most trusted food delivery platform for smaller cities, known for our commitment to quality, speed, and support for local businesses. We envision a future where every city has access to world-class food delivery services.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-orange-600">Values</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do at FoodExpress
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white fill-current" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Customer First</h4>
              <p className="text-gray-600">
                Every decision we make is centered around delivering the best experience for our customers.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Quality & Safety</h4>
              <p className="text-gray-600">
                We maintain strict quality standards and ensure the safety of every order.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Community Support</h4>
              <p className="text-gray-600">
                We're committed to supporting local businesses and creating jobs in our communities.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Innovation</h4>
              <p className="text-gray-600">
                We continuously innovate to make food delivery faster, easier, and more convenient.
              </p>
            </div>
          </div>
        </div>

        {/* Our Impact */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-orange-600">Impact</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">50+</div>
              <p className="text-gray-600 font-medium">Partner Restaurants</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">1000+</div>
              <p className="text-gray-600 font-medium">Happy Customers</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">5000+</div>
              <p className="text-gray-600 font-medium">Orders Delivered</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">4.8★</div>
              <p className="text-gray-600 font-medium">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-orange-600">FoodExpress?</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h4>
              <p className="text-gray-600 leading-relaxed">
                Average delivery time of just 30-45 minutes with real-time tracking from kitchen to your door.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Quality Assured</h4>
              <p className="text-gray-600 leading-relaxed">
                Curated restaurants with high-quality food and strict hygiene standards. Your safety is our priority.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Local Heroes</h4>
              <p className="text-gray-600 leading-relaxed">
                Supporting local restaurants and communities. Every order you place helps a local business thrive.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Journey</h2>
          <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Whether you're a customer looking for great food, a restaurant owner wanting to grow your business, or someone passionate about making a difference in local communities, we'd love to have you on board.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sign Up as Customer
            </a>
            <a
              href="/auth/register?role=shopkeeper"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              Partner with Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
