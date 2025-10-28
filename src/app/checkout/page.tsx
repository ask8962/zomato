'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Phone, User, CreditCard, Truck, AlertTriangle } from 'lucide-react';
import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, MenuItem } from '@/types';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

interface CartData {
  items: CartItem[];
  restaurant: Restaurant;
  total: number;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingCart, setValidatingCart] = useState(true);
  const [cartValidationErrors, setCartValidationErrors] = useState<string[]>([]);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    paymentMethod: 'cash' as 'cash' | 'online',
    notes: ''
  });

  // Input validation functions
  const validatePhone = (phone: string): boolean => {
    return /^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''));
  };

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  const validateDeliveryAddress = (address: string): boolean => {
    return address.trim().length >= 10 && address.trim().length <= 500;
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can place orders');
      router.push('/');
      return;
    }

    // Load cart data from localStorage
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) {
      toast.error('Your cart is empty');
      router.push('/restaurants');
      return;
    }

    try {
      const parsedCart = JSON.parse(savedCart) as CartData;
      validateCartData(parsedCart);
    } catch (error) {
      console.error('Error parsing cart data:', error);
      toast.error('Invalid cart data');
      router.push('/restaurants');
    }
  }, [user, router]);

  // CRITICAL: Server-side cart validation to prevent price manipulation
  const validateCartData = async (cartData: CartData) => {
    setValidatingCart(true);
    const errors: string[] = [];

    try {
      // 1. Validate restaurant exists and is active
      const restaurantDoc = await getDoc(doc(db, 'restaurants', cartData.restaurant.id));
      if (!restaurantDoc.exists()) {
        errors.push('Restaurant no longer exists');
        setCartValidationErrors(errors);
        return;
      }

      const currentRestaurant = restaurantDoc.data() as Restaurant;
      if (!currentRestaurant.isApproved || !currentRestaurant.isActive) {
        errors.push('Restaurant is currently not accepting orders');
      }

      // 2. Validate each menu item and prices
      const menuQuery = query(
        collection(db, 'menuItems'),
        where('restaurantId', '==', cartData.restaurant.id)
      );
      
      const menuSnapshot = await getDocs(menuQuery);
      const currentMenuItems = new Map();
      menuSnapshot.docs.forEach(doc => {
        currentMenuItems.set(doc.id, { id: doc.id, ...doc.data() });
      });

      let recalculatedTotal = 0;
      const validatedItems: CartItem[] = [];

      for (const cartItem of cartData.items) {
        const currentMenuItem = currentMenuItems.get(cartItem.menuItemId);
        
        if (!currentMenuItem) {
          errors.push(`Menu item "${cartItem.menuItem.name}" is no longer available`);
          continue;
        }

        if (!currentMenuItem.isAvailable) {
          errors.push(`"${currentMenuItem.name}" is currently unavailable`);
          continue;
        }

        // CRITICAL: Validate price hasn't changed
        if (currentMenuItem.price !== cartItem.price) {
          errors.push(`Price for "${currentMenuItem.name}" has changed from ₹${cartItem.price} to ₹${currentMenuItem.price}`);
        }

        // Validate quantity limits
        if (cartItem.quantity <= 0 || cartItem.quantity > 10) {
          errors.push(`Invalid quantity for "${currentMenuItem.name}"`);
          continue;
        }

        // Use current price from database, not client-provided price
        const itemTotal = currentMenuItem.price * cartItem.quantity;
        recalculatedTotal += itemTotal;

        validatedItems.push({
          ...cartItem,
          price: currentMenuItem.price, // Use server price
          menuItem: currentMenuItem
        });
      }

      // 3. Validate minimum order
      if (recalculatedTotal < currentRestaurant.minimumOrder) {
        errors.push(`Minimum order amount is ₹${currentRestaurant.minimumOrder}`);
      }

      // 4. Validate total amount
      const expectedTotal = recalculatedTotal;
      if (Math.abs(cartData.total - expectedTotal) > 0.01) {
        errors.push(`Cart total mismatch. Expected: ₹${expectedTotal}, Got: ₹${cartData.total}`);
      }

      if (errors.length === 0) {
        // Update cart with validated data
        const validatedCartData = {
          ...cartData,
          items: validatedItems,
          total: recalculatedTotal,
          restaurant: { ...cartData.restaurant, ...currentRestaurant }
        };
        
        setCartData(validatedCartData);
        
        // Update localStorage with validated data
        localStorage.setItem('cart', JSON.stringify(validatedCartData));
        
        // Pre-fill form with user data
        if (user) {
          setOrderForm(prev => ({
            ...prev,
            customerName: user.name || '',
            customerPhone: user.phone || '',
            deliveryAddress: user.address || ''
          }));
        }
      }

      setCartValidationErrors(errors);
    } catch (error) {
      console.error('Error validating cart:', error);
      errors.push('Failed to validate cart. Please try again.');
      setCartValidationErrors(errors);
    } finally {
      setValidatingCart(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cartData || !user) return;

    // Enhanced validation
    if (!orderForm.customerName || orderForm.customerName.length < 2) {
      toast.error('Please enter a valid name (at least 2 characters)');
      return;
    }

    if (!orderForm.customerPhone || !validatePhone(orderForm.customerPhone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!orderForm.deliveryAddress || !validateDeliveryAddress(orderForm.deliveryAddress)) {
      toast.error('Please enter a complete delivery address (10-500 characters)');
      return;
    }

    // Re-validate cart before placing order
    if (cartValidationErrors.length > 0) {
      toast.error('Please fix cart issues before placing order');
      return;
    }

    setLoading(true);

    try {
      // Final validation: Re-check restaurant and menu items
      const restaurantDoc = await getDoc(doc(db, 'restaurants', cartData.restaurant.id));
      if (!restaurantDoc.exists() || !restaurantDoc.data()?.isApproved || !restaurantDoc.data()?.isActive) {
        toast.error('Restaurant is no longer accepting orders');
        setLoading(false);
        return;
      }

      // Calculate final total with current prices
      let finalTotal = 0;
      const validatedItems = [];

      for (const item of cartData.items) {
        const menuItemDoc = await getDoc(doc(db, 'menuItems', item.menuItemId));
        if (!menuItemDoc.exists() || !menuItemDoc.data()?.isAvailable) {
          toast.error(`"${item.menuItem.name}" is no longer available`);
          setLoading(false);
          return;
        }

        const currentPrice = menuItemDoc.data()?.price;
        finalTotal += currentPrice * item.quantity;
        
        validatedItems.push({
          ...item,
          price: currentPrice // Use current server price
        });
      }

      const orderData = {
        customerId: user.id,
        restaurantId: cartData.restaurant.id,
        items: validatedItems,
        totalAmount: finalTotal + cartData.restaurant.deliveryFee,
        deliveryFee: cartData.restaurant.deliveryFee,
        status: 'pending' as const,
        deliveryAddress: sanitizeInput(orderForm.deliveryAddress),
        customerPhone: sanitizeInput(orderForm.customerPhone),
        customerName: sanitizeInput(orderForm.customerName),
        paymentMethod: orderForm.paymentMethod,
        paymentStatus: 'pending' as const,
        orderDate: new Date(),
        notes: orderForm.notes ? sanitizeInput(orderForm.notes) : null,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      
      toast.success('Order placed successfully!');
      router.push(`/orders/${docRef.id}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validatingCart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartValidationErrors.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-red-800">Cart Validation Issues</h2>
            </div>
            <div className="space-y-2 mb-6">
              {cartValidationErrors.map((error, index) => (
                <p key={index} className="text-red-700">• {error}</p>
              ))}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/restaurants')}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Browse Restaurants
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('cart');
                  router.push('/restaurants');
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  const subtotal = cartData.total;
  const deliveryFee = cartData.restaurant.deliveryFee;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Restaurant Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Ordering from</h2>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                    {cartData.restaurant.image ? (
                      <img
                        src={cartData.restaurant.image}
                        alt={cartData.restaurant.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cartData.restaurant.name}</h3>
                    <p className="text-gray-600">{cartData.restaurant.address}</p>
                    <p className="text-sm text-gray-500">Delivery time: {cartData.restaurant.deliveryTime}</p>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      required
                      minLength={2}
                      maxLength={100}
                      value={orderForm.customerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        required
                        pattern="[+]?[0-9]{10,15}"
                        value={orderForm.customerPhone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </h2>
                
                <div>
                  <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Complete Address *
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    required
                    rows={3}
                    minLength={10}
                    maxLength={500}
                    value={orderForm.deliveryAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your complete delivery address including landmarks"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {orderForm.deliveryAddress.length}/500 characters (minimum 10)
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={orderForm.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-green-600" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">Pay when your order arrives</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      disabled
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-gray-500">Coming soon</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Special Instructions</h2>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes for Restaurant (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    maxLength={500}
                    value={orderForm.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Any special instructions for your order..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {orderForm.notes.length}/500 characters
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartData.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                      <p className="text-gray-500 text-xs">₹{item.price} × {item.quantity}</p>
                      {item.menuItem.isVeg && (
                        <div className="flex items-center mt-1">
                          <div className="w-3 h-3 border border-green-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-xs text-green-600 ml-1">Veg</span>
                        </div>
                      )}
                    </div>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-4 p-3 bg-orange-50 rounded-md">
                <div className="flex items-center text-sm text-orange-800">
                  <Truck className="w-4 h-4 mr-2" />
                  <span>Estimated delivery: 45 minutes</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || cartValidationErrors.length > 0}
                className="w-full mt-6 bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : `Place Order - ₹${total}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 