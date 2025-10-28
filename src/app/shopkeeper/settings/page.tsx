'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  DollarSign,
  Save,
  Edit2,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import toast from 'react-hot-toast';

const RestaurantSettingsPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    cuisineTypes: '',
    deliveryTime: '',
    minimumOrder: '',
    deliveryFee: '',
    openingHours: '',
    closingHours: '',
    image: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'shopkeeper') {
      toast.error('Access denied. Only shopkeepers can access this page.');
      router.push('/');
      return;
    }

    if (user) {
      fetchRestaurant();
    }
  }, [user, loading, router]);

  const fetchRestaurant = async () => {
    if (!user) return;

    try {
      setLoadingRestaurant(true);
      const restaurantQuery = query(
        collection(db, 'restaurants'),
        where('ownerId', '==', user.id)
      );
      
      const snapshot = await getDocs(restaurantQuery);
      
      if (!snapshot.empty) {
        const restaurantData = { 
          id: snapshot.docs[0].id, 
          ...snapshot.docs[0].data() 
        } as Restaurant;
        
        setRestaurant(restaurantData);
        setRestaurantForm({
          name: restaurantData.name,
          description: restaurantData.description,
          address: restaurantData.address,
          phone: restaurantData.phone,
          cuisineTypes: restaurantData.cuisineTypes.join(', '),
          deliveryTime: restaurantData.deliveryTime,
          minimumOrder: restaurantData.minimumOrder.toString(),
          deliveryFee: restaurantData.deliveryFee.toString(),
          openingHours: restaurantData.openingHours || '09:00',
          closingHours: restaurantData.closingHours || '22:00',
          image: restaurantData.image || ''
        });
      } else {
        toast.error('No restaurant found. Please register your restaurant first.');
        router.push('/shopkeeper/register');
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant data');
    } finally {
      setLoadingRestaurant(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRestaurantForm(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleActive = async () => {
    if (!restaurant) return;

    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id), {
        isActive: !restaurant.isActive,
        updatedAt: new Date()
      });

      setRestaurant({ ...restaurant, isActive: !restaurant.isActive });
      toast.success(`Restaurant is now ${!restaurant.isActive ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
      toast.error('Failed to update restaurant status');
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    // Validation
    if (!restaurantForm.name || !restaurantForm.description || !restaurantForm.address || 
        !restaurantForm.phone || !restaurantForm.cuisineTypes || !restaurantForm.deliveryTime ||
        !restaurantForm.minimumOrder || !restaurantForm.deliveryFee) {
      toast.error('Please fill in all required fields');
      return;
    }

    const minimumOrder = parseFloat(restaurantForm.minimumOrder);
    const deliveryFee = parseFloat(restaurantForm.deliveryFee);

    if (isNaN(minimumOrder) || minimumOrder < 0) {
      toast.error('Please enter a valid minimum order amount');
      return;
    }

    if (isNaN(deliveryFee) || deliveryFee < 0) {
      toast.error('Please enter a valid delivery fee');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        name: restaurantForm.name.trim(),
        description: restaurantForm.description.trim(),
        address: restaurantForm.address.trim(),
        phone: restaurantForm.phone.trim(),
        cuisineTypes: restaurantForm.cuisineTypes.split(',').map(type => type.trim()).filter(Boolean),
        deliveryTime: restaurantForm.deliveryTime.trim(),
        minimumOrder: minimumOrder,
        deliveryFee: deliveryFee,
        openingHours: restaurantForm.openingHours || '09:00',
        closingHours: restaurantForm.closingHours || '22:00',
        image: restaurantForm.image || '',
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'restaurants', restaurant.id), updateData);
      
      setRestaurant({ ...restaurant, ...updateData });
      toast.success('Restaurant settings updated successfully!');
      setEditing(false);

      // Reload to get fresh data
      fetchRestaurant();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error('Failed to update restaurant settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Settings</h1>
              <p className="text-gray-600">Manage your restaurant information and settings</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Settings
              </button>
            )}
          </div>
        </div>

        {/* Approval Status Banner */}
        {!restaurant.isApproved && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 mb-8 flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Restaurant Pending Approval</h3>
              <p className="text-yellow-800">
                Your restaurant is currently under review by our admin team. You'll be notified once it's approved. 
                In the meantime, you can update your information.
              </p>
            </div>
          </div>
        )}

        {/* Restaurant Status Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Restaurant Status</h3>
              <p className="text-gray-600">
                Your restaurant is currently {restaurant.isActive ? 'accepting' : 'not accepting'} orders
              </p>
            </div>
            <button
              onClick={handleToggleActive}
              className="flex items-center"
              title={restaurant.isActive ? 'Click to deactivate' : 'Click to activate'}
            >
              {restaurant.isActive ? (
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-semibold">Active</span>
                  <ToggleRight className="w-16 h-16 text-green-500" />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600 font-semibold">Inactive</span>
                  <ToggleLeft className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Restaurant Information Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Information</h3>
          
          <form onSubmit={handleSaveChanges}>
            <div className="space-y-6">
              {/* Restaurant Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Image
                </label>
                <ImageUpload
                  currentImageUrl={restaurantForm.image}
                  onImageUploaded={(url) => setRestaurantForm(prev => ({ ...prev, image: url }))}
                  folder="restaurants"
                  maxSizeMB={5}
                  aspectRatio="16/9"
                />
                <p className="text-sm text-gray-500 mt-2">
                  A high-quality image of your restaurant will attract more customers
                </p>
              </div>

              {/* Restaurant Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    disabled={!editing}
                    value={restaurantForm.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  disabled={!editing}
                  value={restaurantForm.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                  <textarea
                    id="address"
                    name="address"
                    required
                    rows={2}
                    disabled={!editing}
                    value={restaurantForm.address}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      disabled={!editing}
                      value={restaurantForm.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      value={restaurant.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Cuisine Types */}
              <div>
                <label htmlFor="cuisineTypes" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Types *
                </label>
                <input
                  type="text"
                  id="cuisineTypes"
                  name="cuisineTypes"
                  required
                  disabled={!editing}
                  value={restaurantForm.cuisineTypes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                  placeholder="Indian, Chinese, Fast Food"
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple cuisines with commas</p>
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      id="openingHours"
                      name="openingHours"
                      disabled={!editing}
                      value={restaurantForm.openingHours}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="closingHours" className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      id="closingHours"
                      name="closingHours"
                      disabled={!editing}
                      value={restaurantForm.closingHours}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Time *
                  </label>
                  <input
                    type="text"
                    id="deliveryTime"
                    name="deliveryTime"
                    required
                    disabled={!editing}
                    value={restaurantForm.deliveryTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                    placeholder="30-45 mins"
                  />
                </div>

                <div>
                  <label htmlFor="minimumOrder" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order (₹) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="minimumOrder"
                      name="minimumOrder"
                      required
                      min="0"
                      step="10"
                      disabled={!editing}
                      value={restaurantForm.minimumOrder}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Fee (₹) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="deliveryFee"
                      name="deliveryFee"
                      required
                      min="0"
                      step="5"
                      disabled={!editing}
                      value={restaurantForm.deliveryFee}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex space-x-4 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      // Reset form to original values
                      if (restaurant) {
                        setRestaurantForm({
                          name: restaurant.name,
                          description: restaurant.description,
                          address: restaurant.address,
                          phone: restaurant.phone,
                          cuisineTypes: restaurant.cuisineTypes.join(', '),
                          deliveryTime: restaurant.deliveryTime,
                          minimumOrder: restaurant.minimumOrder.toString(),
                          deliveryFee: restaurant.deliveryFee.toString(),
                          openingHours: restaurant.openingHours || '09:00',
                          closingHours: restaurant.closingHours || '22:00',
                          image: restaurant.image || ''
                        });
                      }
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Restaurant ID</p>
              <p className="text-gray-900 font-mono text-sm">{restaurant.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Owner ID</p>
              <p className="text-gray-900 font-mono text-sm">{restaurant.ownerId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Approval Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                restaurant.isApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {restaurant.isApproved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Rating</p>
              <p className="text-gray-900 font-semibold">
                {restaurant.rating.toFixed(1)} ⭐ ({restaurant.totalRatings} reviews)
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Created At</p>
              <p className="text-gray-900">
                {new Date(restaurant.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
              <p className="text-gray-900">
                {new Date(restaurant.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;
