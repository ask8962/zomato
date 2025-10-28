'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Minus, 
  Star, 
  Clock, 
  MapPin, 
  ShoppingCart,
  ArrowLeft,
  Heart
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, MenuItem } from '@/types';
import ReviewsSection from '@/components/ReviewsSection';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

const RestaurantPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const restaurantId = params.id as string;

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
      fetchMenuItems();
      if (user?.role === 'customer') {
        checkFavoriteStatus();
      }
    }
  }, [restaurantId, user]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);

      // Fetch restaurant details
      const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
      if (!restaurantDoc.exists()) {
        toast.error('Restaurant not found');
        router.push('/restaurants');
        return;
      }

      const restaurantData = { id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant;
      
      if (!restaurantData.isApproved || !restaurantData.isActive) {
        toast.error('Restaurant is not available');
        router.push('/restaurants');
        return;
      }

      setRestaurant(restaurantData);

      // Fetch menu items
      const menuQuery = query(
        collection(db, 'menuItems'),
        where('restaurantId', '==', restaurantId),
        where('isAvailable', '==', true)
      );
      
      const menuSnapshot = await getDocs(menuQuery);
      const menuData = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuItem));

      setMenuItems(menuData);

    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const menuQuery = query(
        collection(db, 'menuItems'),
        where('restaurantId', '==', restaurantId),
        where('isAvailable', '==', true)
      );
      
      const snapshot = await getDocs(menuQuery);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuItem));
      
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || user.role !== 'customer') return;

    try {
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('customerId', '==', user.id),
        where('restaurantId', '==', restaurantId)
      );
      
      const snapshot = await getDocs(favoritesQuery);
      if (!snapshot.empty) {
        setIsFavorite(true);
        setFavoriteId(snapshot.docs[0].id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || user.role !== 'customer' || !restaurant) {
      toast.error('Please log in as a customer to add favorites');
      return;
    }

    setFavoriteLoading(true);

    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        await deleteDoc(doc(db, 'favorites', favoriteId));
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success(`${restaurant.name} removed from favorites`);
      } else {
        // Add to favorites
        const favoriteData = {
          customerId: user.id,
          restaurantId: restaurantId,
          createdAt: new Date()
        };
        
        const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
        setIsFavorite(true);
        setFavoriteId(docRef.id);
        toast.success(`${restaurant.name} added to favorites`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (menuItem: MenuItem) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can add items to cart');
      return;
    }

    const existingItem = cart.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newCartItem: CartItem = {
        id: `${menuItem.id}-${Date.now()}`,
        menuItemId: menuItem.id,
        quantity: 1,
        price: menuItem.price,
        menuItem
      };
      setCart([...cart, newCartItem]);
    }
    
    toast.success(`${menuItem.name} added to cart`);
  };

  const updateCartQuantity = (menuItemId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.menuItemId === menuItemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const getCartItemQuantity = (menuItemId: string) => {
    const item = cart.find(item => item.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!restaurant) return;

    if (cartTotal < restaurant.minimumOrder) {
      toast.error(`Minimum order amount is ₹${restaurant.minimumOrder}`);
      return;
    }

    // Store cart in localStorage and navigate to checkout
    localStorage.setItem('cart', JSON.stringify({
      items: cart,
      restaurant: restaurant,
      total: cartTotal
    }));
    
    router.push('/checkout');
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
            <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-64 bg-gray-200 relative">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p>No image available</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    {renderStars(restaurant.rating)}
                    <span className="ml-2">{restaurant.rating} ({restaurant.totalRatings} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {restaurant.deliveryTime}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {restaurant.address}
                  </div>
                </div>
              </div>

              {/* Favorite Button for Customers */}
              {user?.role === 'customer' && (
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className={`p-3 rounded-full transition-colors ${
                    isFavorite 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                  } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisineTypes.map((cuisine, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                >
                  {cuisine}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
              <span>Minimum Order: ₹{restaurant.minimumOrder}</span>
              <span>Delivery Fee: ₹{restaurant.deliveryFee}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-3">
            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Menu Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No menu items available in this category.</p>
                </div>
              ) : (
                filteredMenuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          {item.isVeg && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Veg
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                          <span className="text-sm text-gray-500">
                            Prep time: {item.preparationTime} mins
                          </span>
                        </div>
                      </div>

                      <div className="ml-6 flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg mb-3"
                          />
                        )}
                        
                        {getCartItemQuantity(item.id) === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-orange-600 text-white rounded-md">
                            <button
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="p-2 hover:bg-orange-700 rounded-l-md"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-medium">
                              {getCartItemQuantity(item.id)}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="p-2 hover:bg-orange-700 rounded-r-md"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Your Cart ({cartItemsCount})
              </h3>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                          <p className="text-gray-500 text-xs">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.menuItemId, -1)}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.menuItemId, 1)}
                            className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Delivery Fee:</span>
                      <span className="font-medium">₹{restaurant.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-lg font-bold">
                      <span>Total:</span>
                      <span>₹{cartTotal + restaurant.deliveryFee}</span>
                    </div>

                    {cartTotal < restaurant.minimumOrder && (
                      <p className="text-red-500 text-sm mb-4">
                        Minimum order: ₹{restaurant.minimumOrder}
                        (₹{restaurant.minimumOrder - cartTotal} more needed)
                      </p>
                    )}

                    <button
                      onClick={proceedToCheckout}
                      disabled={cartTotal < restaurant.minimumOrder}
                      className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <ReviewsSection restaurantId={restaurantId} restaurantName={restaurant.name} />
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage; 