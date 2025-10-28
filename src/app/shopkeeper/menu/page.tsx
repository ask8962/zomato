'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  ChefHat,
  DollarSign,
  Clock,
  ToggleLeft,
  ToggleRight,
  X,
  Save
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MenuItem, Restaurant } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import toast from 'react-hot-toast';

const MenuManagementPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVeg: true,
    isAvailable: true,
    preparationTime: '',
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

  useEffect(() => {
    if (restaurant) {
      setupRealTimeListener();
    }
  }, [restaurant]);

  const fetchRestaurant = async () => {
    if (!user) return;

    try {
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
        
        if (!restaurantData.isApproved) {
          toast.error('Your restaurant needs to be approved before you can manage menu items');
        }
      } else {
        toast.error('No restaurant found. Please register your restaurant first.');
        router.push('/shopkeeper/register');
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant data');
    }
  };

  const setupRealTimeListener = () => {
    if (!restaurant) return;

    const menuQuery = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurant.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuItem));

      setMenuItems(items);
      setLoadingItems(false);
    }, (error) => {
      console.error('Error in menu items listener:', error);
      toast.error('Failed to load menu items');
      setLoadingItems(false);
    });

    return () => unsubscribe();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setItemForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setItemForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      category: '',
      isVeg: true,
      isAvailable: true,
      preparationTime: '',
      image: ''
    });
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime.toString(),
      image: item.image || ''
    });
    setShowModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    // Validation
    if (!itemForm.name || !itemForm.description || !itemForm.price || !itemForm.category || !itemForm.preparationTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = parseFloat(itemForm.price);
    const prepTime = parseInt(itemForm.preparationTime);

    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (isNaN(prepTime) || prepTime <= 0) {
      toast.error('Please enter a valid preparation time');
      return;
    }

    setSaving(true);

    try {
      const itemData = {
        restaurantId: restaurant.id,
        name: itemForm.name.trim(),
        description: itemForm.description.trim(),
        price: price,
        category: itemForm.category.trim(),
        isVeg: itemForm.isVeg,
        isAvailable: itemForm.isAvailable,
        preparationTime: prepTime,
        image: itemForm.image || '',
        updatedAt: new Date()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'menuItems', editingItem.id), itemData);
        toast.success('Menu item updated successfully!');
      } else {
        await addDoc(collection(db, 'menuItems'), {
          ...itemData,
          createdAt: new Date()
        });
        toast.success('Menu item added successfully!');
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'menuItems', itemId));
      toast.success('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateDoc(doc(db, 'menuItems', item.id), {
        isAvailable: !item.isAvailable,
        updatedAt: new Date()
      });
      toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  if (loading || loadingItems) {
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

  if (!restaurant.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ChefHat className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Pending Approval</h1>
            <p className="text-gray-600">
              Your restaurant needs to be approved by our admin team before you can manage menu items.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
              <p className="text-gray-600">Manage menu items for {restaurant.name}</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-md mx-auto">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm || filterCategory !== 'all' ? 'No items found' : 'No Menu Items Yet'}
              </h3>
              <p className="text-gray-600 mb-8">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start building your menu by adding your first item!'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <button
                  onClick={openAddModal}
                  className="bg-orange-600 text-white px-8 py-4 rounded-2xl hover:bg-orange-700 transition-colors font-semibold"
                >
                  Add Your First Item
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Item Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {item.isVeg ? '🥗' : '🍖'}
                      </div>
                      <p className="text-sm text-gray-500">No image</p>
                    </div>
                  )}
                  
                  {/* Veg/Non-veg Badge */}
                  <div className="absolute top-4 left-4">
                    {item.isVeg ? (
                      <div className="w-6 h-6 border-2 border-green-500 rounded flex items-center justify-center bg-white">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-red-500 rounded flex items-center justify-center bg-white">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className="absolute top-4 right-4"
                    title={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                  >
                    {item.isAvailable ? (
                      <ToggleRight className="w-12 h-12 text-green-500 bg-white rounded-full p-1 shadow-lg" />
                    ) : (
                      <ToggleLeft className="w-12 h-12 text-gray-400 bg-white rounded-full p-1 shadow-lg" />
                    )}
                  </button>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      <span className="font-semibold text-gray-900">₹{item.price}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{item.preparationTime} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Filter className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Image
                  </label>
                  <ImageUpload
                    currentImageUrl={itemForm.image}
                    onImageUploaded={(url) => setItemForm(prev => ({ ...prev, image: url }))}
                    folder="menuItems"
                    maxSizeMB={5}
                    aspectRatio="4/3"
                  />
                </div>

                {/* Item Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={itemForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Margherita Pizza"
                  />
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
                    value={itemForm.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe your dish..."
                  />
                </div>

                {/* Price and Prep Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="1"
                      step="0.01"
                      value={itemForm.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="299"
                    />
                  </div>

                  <div>
                    <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Prep Time (mins) *
                    </label>
                    <input
                      type="number"
                      id="preparationTime"
                      name="preparationTime"
                      required
                      min="1"
                      value={itemForm.preparationTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="20"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    required
                    value={itemForm.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Pizza, Burgers, Indian, Chinese"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isVeg"
                      checked={itemForm.isVeg}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={itemForm.isAvailable}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Available</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagementPage;
