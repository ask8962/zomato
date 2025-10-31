'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Clock, MapPin, Star, Truck, Heart, Shield, Users, Zap, ChefHat, Award, Store, Bike } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar />
      
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm">
                <Zap className="w-4 h-4 mr-2" />
                Fast • Fresh • Local
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="block">Delicious Food</span>
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Delivered Fast
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-orange-50">
              Experience the best food delivery service for tier 2 and 3 cities. 
              Supporting local restaurants and bringing restaurant-quality meals to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/restaurants"
                className="group bg-white text-orange-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                <span className="flex items-center">
                  Order Now
                  <ChefHat className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </span>
              </Link>
              <Link
                href="/auth/register?role=shopkeeper"
                className="group border-3 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <span className="flex items-center">
                  Partner with Us
                  <Heart className="w-5 h-5 ml-2 group-hover:text-red-500 transition-colors" />
                </span>
              </Link>
              <Link
                href="/auth/register-delivery"
                className="group border-3 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <span className="flex items-center">
                  Become Delivery Partner
                  <Bike className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-orange-200 text-sm">Partner Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-orange-200 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">30min</div>
                <div className="text-orange-200 text-sm">Avg Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-orange-200 text-sm">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            🍕
          </div>
        </div>
        <div className="absolute top-32 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            🍔
          </div>
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce" style={{ animationDelay: '2s' }}>
          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            🍜
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium mb-4">
              <Award className="w-4 h-4 mr-2" />
              Why Choose FoodExpress?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Experience the <span className="text-orange-600">Difference</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing food delivery in smaller cities with cutting-edge technology and local partnerships
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">Quick delivery within 30-45 minutes with real-time tracking to your doorstep</p>
            </div>

            <div className="group text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Local Heroes</h3>
              <p className="text-gray-600 leading-relaxed">Supporting local restaurants and communities in tier 2 & 3 cities across India</p>
            </div>

            <div className="group text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Quality Assured</h3>
              <p className="text-gray-600 leading-relaxed">Curated restaurants with high-quality, fresh food and strict hygiene standards</p>
            </div>

            <div className="group text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Smart Tracking</h3>
              <p className="text-gray-600 leading-relaxed">Advanced real-time tracking from kitchen to your door with live updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Popular Categories */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium mb-4">
              <ChefHat className="w-4 h-4 mr-2" />
              Popular Categories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Craving Something <span className="text-orange-600">Delicious?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing food from various cuisines, all delivered fresh to your door
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Pizza', emoji: '🍕', color: 'from-red-400 to-red-600' },
              { name: 'Burger', emoji: '🍔', color: 'from-yellow-400 to-orange-500' },
              { name: 'Indian', emoji: '🍛', color: 'from-orange-400 to-red-500' },
              { name: 'Chinese', emoji: '🥡', color: 'from-green-400 to-blue-500' },
              { name: 'Desserts', emoji: '🍰', color: 'from-pink-400 to-purple-500' },
              { name: 'Beverages', emoji: '🥤', color: 'from-blue-400 to-indigo-500' },
            ].map((category) => (
              <div
                key={category.name}
                className="group text-center p-6 bg-white rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 cursor-pointer border border-gray-100"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="text-3xl">{category.emoji}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Explore now</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium mb-4">
              <Users className="w-4 h-4 mr-2" />
              Customer Love
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="text-orange-600">Customers Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                location: "Nashik",
                rating: 5,
                comment: "Amazing service! Food arrives hot and fresh every time. The app is so easy to use.",
                avatar: "👩‍💼"
              },
              {
                name: "Rahul Patel",
                location: "Rajkot",
                rating: 5,
                comment: "Finally, a reliable food delivery service in our city. Great variety of restaurants!",
                avatar: "👨‍💻"
              },
              {
                name: "Anjali Singh",
                location: "Kanpur",
                rating: 5,
                comment: "Love the real-time tracking feature. I always know exactly when my food will arrive.",
                avatar: "👩‍🎓"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-orange-50 p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              Join the Revolution
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Get <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Started?</span>
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto text-orange-50">
            Join thousands of satisfied customers and restaurant partners in your city. 
            Experience the future of food delivery today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/register"
              className="group bg-white text-orange-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <span className="flex items-center">
                Sign Up as Customer
                <Users className="w-5 h-5 ml-2 group-hover:text-blue-500 transition-colors" />
              </span>
            </Link>
            <Link
              href="/auth/register?role=shopkeeper"
              className="group border-3 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              <span className="flex items-center">
                Register Your Restaurant
                <Store className="w-5 h-5 ml-2 group-hover:text-green-500 transition-colors" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-3xl font-bold text-orange-600 mb-6">FoodExpress</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Revolutionizing food delivery in tier 2 and 3 cities across India. 
                Fresh food, fast delivery, local support.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors cursor-pointer">
                  📱
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  📘
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                  📷
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-orange-400">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/restaurants" className="hover:text-white transition-colors flex items-center"><ChefHat className="w-4 h-4 mr-2" />Restaurants</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors flex items-center"><Users className="w-4 h-4 mr-2" />About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors flex items-center"><MapPin className="w-4 h-4 mr-2" />Contact</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors flex items-center"><Shield className="w-4 h-4 mr-2" />Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-orange-400">For Partners</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/auth/register?role=shopkeeper" className="hover:text-white transition-colors flex items-center"><Store className="w-4 h-4 mr-2" />Partner with Us</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors flex items-center"><Heart className="w-4 h-4 mr-2" />Support</Link></li>
                <li><Link href="/guidelines" className="hover:text-white transition-colors flex items-center"><Award className="w-4 h-4 mr-2" />Guidelines</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 text-orange-400">Contact Info</h4>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-center">
                  <span className="mr-2">📧</span>
                  ganukalp70@gmail.com
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📞</span>
                  +91 8962393954
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📍</span>
                  Porsa, Morena, Madhya Pradesh, India
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 FoodExpress. All rights reserved. Made with ❤️ for local communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
