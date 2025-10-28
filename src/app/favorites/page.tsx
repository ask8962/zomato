'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Star, Clock, MapPin, Trash2, Search, Filter, ChefHat } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant } from '@/types';
import toast from 'react-hot-toast';

interface Favorite {
  id: string;
  customerId: string;
  restaurantId: string;
  createdAt: Date;
  restaurant?: Restaurant;
}

const FavoritesPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'customer') {
      toast.error('Only customers can view favorites');
      router.push('/');
      return;
    }

    if (user) {
      setupRealTimeListener();
    }
  }, [user, loading, router]);

  const setupRealTimeListener = () => {
    if (!user) return;

    const favoritesQuery = query(
      collection(db, 'favorites'),
      where('customerId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(favoritesQuery, async (snapshot) => {
      const favoritesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Favorite));

      // Fetch restaurant details for each favorite
      const favoritesWithRestaurants = await Promise.all(
        favoritesData.map(async (favorite) => {
          try {
            const restaurantDoc = await getDoc(doc(db, 'restaurants', favorite.restaurantId));
            if (restaurantDoc.exists()) {
              return {
                ...favorite,
                restaurant: { id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant
              };
            }
            return favorite;
          } catch (error) {
            console.error('Error fetching restaurant:', error);
            return favorite;
          }
        })
      );

      setFavorites(favoritesWithRestaurants.filter(f => f.restaurant));
      setLoadingFavorites(false);
    }, (error) => {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
      setLoadingFavorites(false);
    });

    return () => unsubscribe();
  };

  const handleRemoveFavorite = async (favoriteId: string, restaurantName: string) => {
    setRemovingId(favoriteId);

    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      toast.success(`${restaurantName} removed from favorites`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    if (!searchTerm) return true;
    const restaurant = favorite.restaurant;
    if (!restaurant) return false;
    
    return (
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisineTypes.some(cuisine => 
        cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

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

  if (loading || loadingFavorites) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm">
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Your Favorite Places
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              My <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Favorites</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              {favorites.length > 0 
                ? `You have ${favorites.length} favorite restaurant${favorites.length !== 1 ? 's' : ''}`
                : 'Start adding restaurants to your favorites!'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        {favorites.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your favorite restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm ? 'No results found' : 'No Favorites Yet'}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {searchTerm 
                  ? 'Try adjusting your search to find your favorite restaurants'
                  : "You haven't added any restaurants to your favorites. Start exploring and add your favorite restaurants!"
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/restaurants')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                >
                  Browse Restaurants
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFavorites.map((favorite) => {
              const restaurant = favorite.restaurant!;
              return (
                <div
                  key={favorite.id}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                >
                  {/* Restaurant Image */}
                  <div className="relative h-56 bg-gradient-to-br from-orange-200 to-red-200 overflow-hidden">
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
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id, restaurant.name)}
                      disabled={removingId === favorite.id}
                      className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from favorites"
                    >
                      {removingId === favorite.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <Heart className="w-6 h-6 text-red-500 fill-current group-hover/btn:scale-110 transition-transform" />
                      )}
                    </button>

                    {/* Delivery Time Badge */}
                    <div className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm px-3 py-2 rounded-2xl shadow-lg">
                      <div className="flex items-center text-sm text-gray-700 font-medium">
                        <Clock className="w-4 h-4 mr-1 text-orange-500" />
                        {restaurant.deliveryTime}
                      </div>
                    </div>

                    {/* Rating Badge */}
                    {restaurant.rating >= 4.5 && (
                      <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-2xl shadow-lg text-xs font-bold">
                        TOP RATED
                      </div>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Link href={`/restaurants/${restaurant.id}`}>
                        <h3 className="text-xl font-bold text-gray-900 truncate hover:text-orange-600 transition-colors cursor-pointer">
                          {restaurant.name}
                        </h3>
                      </Link>
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

                    {/* Cuisine Types */}
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
                          +{restaurant.cuisineTypes.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Restaurant Details */}
                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="truncate">
                            {restaurant.address.split(',')[0]}
                          </span>
                        </div>
                        <div className="text-green-600 font-semibold">
                          ₹{restaurant.deliveryFee} delivery
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

                    {/* Added Date */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Added on {new Date(favorite.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Order Now Button */}
                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className="mt-4 block bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Order Now →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {favorites.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{favorites.length}</h3>
              <p className="text-gray-600">Favorite Restaurants</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {new Set(favorites.flatMap(f => f.restaurant?.cuisineTypes || [])).size}
              </h3>
              <p className="text-gray-600">Cuisine Types</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {favorites.length > 0 
                  ? (favorites.reduce((sum, f) => sum + (f.restaurant?.rating || 0), 0) / favorites.length).toFixed(1)
                  : '0.0'
                }
              </h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
