'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Store,
  Clock,
  MapPin,
  Heart,
  Star,
  Zap,
  Gift,
  Shield,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isVeg: boolean;
    preparationTime: number;
  };
}

interface CartData {
  items: CartItem[];
  restaurant: {
    id: string;
    name: string;
    address: string;
    deliveryTime: string;
    minimumOrder: number;
    deliveryFee: number;
    image: string;
  };
  total: number;
}

const CartPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can view cart');
      router.push('/');
      return;
    }

    loadCartData();
  }, [user, router]);

  const loadCartData = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartData;
        setCartData(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
      toast.error('Error loading cart data');
    } finally {
      setLoading(false);
    }
  };

  const updateCartData = (newCartData: CartData | null) => {
    setCartData(newCartData);
    if (newCartData) {
      localStorage.setItem('cart', JSON.stringify(newCartData));
    } else {
      localStorage.removeItem('cart');
    }
  };

  const updateItemQuantity = (itemId: string, change: number) => {
    if (!cartData) return;

    const updatedItems = cartData.items.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[];

    if (updatedItems.length === 0) {
      updateCartData(null);
      toast.success('Cart cleared');
      return;
    }

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    updateCartData({
      ...cartData,
      items: updatedItems,
      total: newTotal
    });
  };

  const removeItem = (itemId: string) => {
    if (!cartData) return;

    const updatedItems = cartData.items.filter(item => item.id !== itemId);
    
    if (updatedItems.length === 0) {
      updateCartData(null);
      toast.success('Cart cleared');
      return;
    }

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    updateCartData({
      ...cartData,
      items: updatedItems,
      total: newTotal
    });

    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    updateCartData(null);
    toast.success('Cart cleared');
  };

  const proceedToCheckout = () => {
    if (!cartData) return;

    if (cartData.total < cartData.restaurant.minimumOrder) {
      toast.error(`Minimum order amount is ₹${cartData.restaurant.minimumOrder}`);
      return;
    }

    router.push('/checkout');
  };

  const continueShopping = () => {
    if (cartData) {
      router.push(`/restaurants/${cartData.restaurant.id}`);
    } else {
      router.push('/restaurants');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-orange-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Looks like you haven't added any delicious items to your cart yet. 
                Let's find something amazing for you!
              </p>
              <button
                onClick={() => router.push('/restaurants')}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
              >
                Browse Restaurants
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartData.total;
  const deliveryFee = cartData.restaurant.deliveryFee;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-orange-100 text-lg">
                {cartData.items.length} delicious item{cartData.items.length !== 1 ? 's' : ''} ready for checkout
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Restaurant Info */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{cartData.restaurant.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-orange-500" />
                      <span>{cartData.restaurant.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-green-500" />
                      <span>{cartData.restaurant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      <span>4.5 Rating</span>
                    </div>
                  </div>
                </div>
                <button className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Heart className="w-6 h-6 text-red-500" />
                </button>
              </div>
            </div>

            {/* Enhanced Cart Items List */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Your Order</h3>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-2xl hover:bg-red-50 transition-all duration-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {cartData.items.map((item) => (
                    <div key={item.id} className="group flex items-center space-x-6 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-gray-100">
                      {/* Enhanced Item Image */}
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        {item.menuItem.image ? (
                          <img
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="text-center">
                            {item.menuItem.isVeg ? (
                              <div className="w-6 h-6 border-2 border-green-500 rounded flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-red-500 rounded flex items-center justify-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Enhanced Item Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                            {item.menuItem.name}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {item.menuItem.isVeg ? (
                              <div className="w-4 h-4 border border-green-500 rounded flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-4 h-4 border border-red-500 rounded flex items-center justify-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2 leading-relaxed">
                          {item.menuItem.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                            {item.menuItem.category}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.menuItem.preparationTime} mins
                          </span>
                        </div>
                        <p className="font-bold text-orange-600 text-lg mt-2">₹{item.price}</p>
                      </div>

                      {/* Enhanced Quantity Controls */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 bg-gray-100 rounded-2xl p-2">
                          <button
                            onClick={() => updateItemQuantity(item.id, -1)}
                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all duration-300 shadow-sm"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, 1)}
                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-all duration-300 shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Item Total & Remove */}
                        <div className="text-right">
                          <p className="font-bold text-xl text-gray-900 mb-2">₹{item.price * item.quantity}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center hover:bg-red-100 text-red-600 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Continue Shopping */}
            <div className="flex justify-between items-center">
              <button
                onClick={continueShopping}
                className="flex items-center text-orange-600 hover:text-orange-700 font-semibold px-6 py-3 rounded-2xl hover:bg-orange-50 transition-all duration-300"
              >
                ← Continue Shopping
              </button>
              <div className="text-gray-500 text-sm">
                Secure checkout powered by <Shield className="w-4 h-4 inline ml-1" />
              </div>
            </div>
          </div>

          {/* Enhanced Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 sticky top-8 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <h3 className="text-xl font-bold flex items-center">
                  <Gift className="w-6 h-6 mr-2" />
                  Order Summary
                </h3>
              </div>
              
              <div className="p-6">
                {/* Enhanced Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal ({cartData.items.length} items)</span>
                    <span className="font-semibold text-lg">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Zap className="w-4 h-4 mr-1 text-orange-500" />
                      Delivery Fee
                    </span>
                    <span className="font-semibold text-lg">₹{deliveryFee}</span>
                  </div>
                  <div className="border-t-2 border-gray-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-2xl font-bold text-orange-600">₹{total}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Minimum Order Check */}
                {subtotal < cartData.restaurant.minimumOrder ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">Almost there!</p>
                        <p className="text-sm text-yellow-700">
                          Add ₹{cartData.restaurant.minimumOrder - subtotal} more to meet minimum order
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <p className="text-sm font-semibold text-green-800">Ready to checkout!</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Checkout Button */}
                <button
                  onClick={proceedToCheckout}
                  disabled={subtotal < cartData.restaurant.minimumOrder}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                {/* Enhanced Delivery Info */}
                <div className="mt-6 space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800">Estimated delivery</p>
                        <p className="text-sm text-blue-700">{cartData.restaurant.deliveryTime}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Safe & Secure</p>
                        <p className="text-sm text-green-700">100% secure payment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 