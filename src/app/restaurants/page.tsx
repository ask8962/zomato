'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Search, Star, Clock, MapPin, Filter, Heart, ChefHat, Zap, Award, TrendingUp } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant } from '@/types';
import toast from 'react-hot-toast';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    filterAndSortRestaurants();
  }, [restaurants, searchTerm, selectedCuisine, sortBy]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      // Fetch only approved and active restaurants
      const restaurantsQuery = query(
        collection(db, 'restaurants'),
        where('isApproved', '==', true),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(restaurantsQuery);
      const restaurantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Restaurant));

      setRestaurants(restaurantsData);

      // Extract unique cuisine types
      const allCuisines = restaurantsData.flatMap(restaurant => restaurant.cuisineTypes);
      const uniqueCuisines = [...new Set(allCuisines)];
      setCuisineTypes(uniqueCuisines);

    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRestaurants = () => {
    let filtered = [...restaurants];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisineTypes.some(cuisine => 
          cuisine.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by cuisine type
    if (selectedCuisine) {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisineTypes.includes(selectedCuisine)
      );
    }

    // Sort restaurants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'deliveryTime':
          return a.deliveryTime.localeCompare(b.deliveryTime);
        case 'deliveryFee':
          return a.deliveryFee - b.deliveryFee;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredRestaurants(filtered);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Finding delicious restaurants for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm">
                <ChefHat className="w-4 h-4 mr-2" />
                Discover Amazing Food
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Local <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Restaurants</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Explore the best restaurants in your city and order your favorite meals
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Enhanced Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Enhanced Cuisine Filter */}
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none transition-all duration-300 bg-gray-50 focus:bg-white"
              >
                <option value="">All Cuisines</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Enhanced Sort By */}
            <div className="relative group">
              <TrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none transition-all duration-300 bg-gray-50 focus:bg-white"
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="deliveryTime">⚡ Fastest Delivery</option>
                <option value="deliveryFee">💰 Lowest Delivery Fee</option>
                <option value="name">📝 Name (A-Z)</option>
              </select>
            </div>

            {/* Enhanced Results Count */}
            <div className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-6 py-3">
              <Award className="w-5 h-5 mr-2" />
              <span className="font-semibold">
                {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="text-gray-600 font-medium">Quick filters:</span>
          {['Fast Delivery', 'Top Rated', 'Free Delivery', 'New'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 bg-white border-2 border-orange-200 text-orange-600 rounded-full hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 text-sm font-medium"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Enhanced Restaurants Grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-md mx-auto">
              <div className="text-gray-400 mb-6">
                <Search className="w-20 h-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No restaurants found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters to find more options</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCuisine('');
                }}
                className="bg-orange-600 text-white px-6 py-3 rounded-2xl hover:bg-orange-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                {/* Enhanced Restaurant Image */}
                <div className="h-56 bg-gradient-to-br from-orange-200 to-red-200 relative overflow-hidden">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-orange-100 to-red-100">
                      <div className="text-center">
                        <div className="text-6xl mb-3">🍽️</div>
                        <p className="text-sm font-medium">No image available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm px-3 py-2 rounded-2xl shadow-lg">
                      <div className="flex items-center text-sm text-gray-700 font-medium">
                        <Clock className="w-4 h-4 mr-1 text-orange-500" />
                        {restaurant.deliveryTime}
                      </div>
                    </div>
                    {restaurant.rating >= 4.5 && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-2xl shadow-lg text-xs font-bold">
                        <Zap className="w-3 h-3 inline mr-1" />
                        TOP RATED
                      </div>
                    )}
                  </div>

                  {/* Heart Icon */}
                  <div className="absolute top-4 left-4">
                    <button className="w-10 h-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors group">
                      <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>

                {/* Enhanced Restaurant Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center ml-3 bg-green-50 px-2 py-1 rounded-lg">
                      {renderStars(restaurant.rating)}
                      <span className="ml-1 text-sm font-semibold text-green-700">
                        {restaurant.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {restaurant.description}
                  </p>

                  {/* Enhanced Cuisine Types */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisineTypes.slice(0, 3).map((cuisine, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 text-xs rounded-full font-medium border border-orange-200"
                      >
                        {cuisine}
                      </span>
                    ))}
                    {restaurant.cuisineTypes.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        +{restaurant.cuisineTypes.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Enhanced Restaurant Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="truncate">
                          {restaurant.address.split(',')[0]}
                        </span>
                      </div>
                      <div className="flex items-center text-green-600 font-semibold">
                        <span>₹{restaurant.deliveryFee} delivery</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-600">
                        Min order: <span className="font-semibold text-gray-900">₹{restaurant.minimumOrder}</span>
                      </div>
                      <div className="text-orange-600 font-medium">
                        {restaurant.totalRatings} reviews
                      </div>
                    </div>
                  </div>

                  {/* Order Now Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-3 rounded-2xl font-semibold group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300">
                      Order Now →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredRestaurants.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white border-2 border-orange-500 text-orange-600 px-8 py-4 rounded-2xl font-semibold hover:bg-orange-50 transition-all duration-300 shadow-lg">
              Load More Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage; 