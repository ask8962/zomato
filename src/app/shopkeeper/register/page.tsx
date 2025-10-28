'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Store, MapPin, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

const ShopkeeperRegister = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    cuisineTypes: '',
    deliveryTime: '',
    minimumOrder: '',
    deliveryFee: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'shopkeeper') {
      toast.error('Access denied. Only shopkeepers can register restaurants.');
      router.push('/');
      return;
    }

    // Check if user already has a restaurant
    checkExistingRestaurant();
  }, [user, router]);

  const checkExistingRestaurant = async () => {
    if (!user) return;

    try {
      const restaurantQuery = query(
        collection(db, 'restaurants'),
        where('ownerId', '==', user.id)
      );
      
      const snapshot = await getDocs(restaurantQuery);
      
      if (!snapshot.empty) {
        toast.success('You already have a registered restaurant');
        router.push('/shopkeeper');
        return;
      }
    } catch (error) {
      console.error('Error checking existing restaurant:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRestaurantForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!restaurantForm.name || !restaurantForm.description || !restaurantForm.address || 
        !restaurantForm.phone || !restaurantForm.cuisineTypes || !restaurantForm.deliveryTime ||
        !restaurantForm.minimumOrder || !restaurantForm.deliveryFee) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(restaurantForm.minimumOrder)) || Number(restaurantForm.minimumOrder) < 0) {
      toast.error('Please enter a valid minimum order amount');
      return;
    }

    if (isNaN(Number(restaurantForm.deliveryFee)) || Number(restaurantForm.deliveryFee) < 0) {
      toast.error('Please enter a valid delivery fee');
      return;
    }

    setLoading(true);

    try {
      const restaurantData = {
        name: restaurantForm.name.trim(),
        description: restaurantForm.description.trim(),
        address: restaurantForm.address.trim(),
        phone: restaurantForm.phone.trim(),
        email: user.email,
        ownerId: user.id,
        isApproved: false,
        isActive: true,
        rating: 0,
        totalRatings: 0,
        cuisineTypes: restaurantForm.cuisineTypes.split(',').map(type => type.trim()).filter(Boolean),
        deliveryTime: restaurantForm.deliveryTime.trim(),
        minimumOrder: Number(restaurantForm.minimumOrder),
        deliveryFee: Number(restaurantForm.deliveryFee),
        image: '', // Will be added later
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'restaurants'), restaurantData);
      
      toast.success('Restaurant registered successfully! Waiting for admin approval.');
      router.push('/shopkeeper');
      
    } catch (error) {
      console.error('Error registering restaurant:', error);
      toast.error('Failed to register restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Store className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Restaurant</h1>
            <p className="text-gray-600">
              Join FoodExpress and start serving customers in your area
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={restaurantForm.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your restaurant name"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={restaurantForm.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe your restaurant and what makes it special"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Complete Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  value={restaurantForm.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter complete address with landmarks"
                />
              </div>
            </div>

            {/* Phone and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={restaurantForm.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Restaurant contact number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Cuisine Types */}
            <div>
              <label htmlFor="cuisineTypes" className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Types *
              </label>
              <input
                type="text"
                id="cuisineTypes"
                name="cuisineTypes"
                required
                value={restaurantForm.cuisineTypes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Indian, Chinese, Italian, Fast Food (comma separated)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter multiple cuisines separated by commas
              </p>
            </div>

            {/* Delivery Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="deliveryTime"
                    name="deliveryTime"
                    required
                    value={restaurantForm.deliveryTime}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="30-45 mins"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="minimumOrder" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    id="minimumOrder"
                    name="minimumOrder"
                    required
                    min="0"
                    step="10"
                    value={restaurantForm.minimumOrder}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Fee (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    id="deliveryFee"
                    name="deliveryFee"
                    required
                    min="0"
                    step="5"
                    value={restaurantForm.deliveryFee}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Important Information:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your restaurant will be reviewed by our admin team before approval</li>
                <li>• You'll be notified via email once your restaurant is approved</li>
                <li>• You can add menu items and manage orders after approval</li>
                <li>• All information provided should be accurate and up-to-date</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering Restaurant...' : 'Register Restaurant'}
            </button>
          </form>

          {/* Back to Dashboard */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/shopkeeper')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperRegister; 