'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Package,
  CreditCard,
  CheckCircle,
  Truck,
  ChefHat,
  RefreshCw,
  XCircle,
  Star,
  MessageSquare,
  X
} from 'lucide-react';
import { doc, getDoc, onSnapshot, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, Review } from '@/types';
import toast from 'react-hot-toast';

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const OrderDetailsPageContent = ({ params }: { params: { id: string } }) => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && params.id) {
      fetchOrderDetails();
      setupRealTimeListener();
    }
  }, [user, loading, params.id, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoadingOrder(true);
      const orderDoc = await getDoc(doc(db, 'orders', params.id));
      
      if (orderDoc.exists()) {
        const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;
        
        // Check if user has permission to view this order
        if (!isAdmin && user?.role === 'customer' && orderData.customerId !== user.id) {
          toast.error('You can only view your own orders');
          router.push('/orders');
          return;
        }
        
        if (!isAdmin && user?.role === 'shopkeeper') {
          // Check if shopkeeper owns the restaurant for this order
          const restaurantDoc = await getDoc(doc(db, 'restaurants', orderData.restaurantId));
          if (!restaurantDoc.exists() || restaurantDoc.data()?.ownerId !== user.id) {
            toast.error('You can only view orders for your restaurant');
            router.push('/shopkeeper');
            return;
          }
        }
        
        setOrder(orderData);
        
        // Fetch restaurant details
        const restaurantDoc = await getDoc(doc(db, 'restaurants', orderData.restaurantId));
        if (restaurantDoc.exists()) {
          setRestaurant({ id: restaurantDoc.id, ...restaurantDoc.data() });
        }

        // Check for existing review if order is delivered
        if (orderData.status === 'delivered' && user?.role === 'customer') {
          await checkExistingReview(orderData.id);
        }
      } else {
        toast.error('Order not found');
        router.push(isAdmin ? '/admin' : user?.role === 'customer' ? '/orders' : '/shopkeeper');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoadingOrder(false);
    }
  };

  const setupRealTimeListener = () => {
    if (!params.id) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', params.id), (doc) => {
      if (doc.exists()) {
        const orderData = { id: doc.id, ...doc.data() } as Order;
        setOrder(orderData);
        setIsRealTimeActive(true);
      }
    }, (error) => {
      console.error('Error in real-time listener:', error);
      setIsRealTimeActive(false);
    });

    return () => unsubscribe();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getBackUrl = () => {
    if (isAdmin) return '/admin';
    if (user?.role === 'customer') return '/orders';
    if (user?.role === 'shopkeeper') return '/shopkeeper';
    return '/';
  };

  const getBackText = () => {
    if (isAdmin) return 'Back to Admin Dashboard';
    if (user?.role === 'customer') return 'Back to My Orders';
    if (user?.role === 'shopkeeper') return 'Back to Dashboard';
    return 'Back';
  };

  const checkExistingReview = async (orderId: string) => {
    if (!user) return;

    try {
      const reviewQuery = query(
        collection(db, 'reviews'),
        where('orderId', '==', orderId),
        where('customerId', '==', user.id)
      );
      
      const snapshot = await getDocs(reviewQuery);
      if (!snapshot.empty) {
        const reviewData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Review;
        setExistingReview(reviewData);
        setReviewForm({
          rating: reviewData.rating,
          comment: reviewData.comment
        });
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user) return;

    if (reviewForm.comment.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }

    setSubmittingReview(true);

    try {
      const reviewData = {
        orderId: order.id,
        customerId: user.id,
        restaurantId: order.restaurantId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      
      // Refresh to show the new review
      await checkExistingReview(order.id);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 cursor-pointer transition-colors ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 hover:text-yellow-200'
        }`}
        onClick={() => interactive && onStarClick && onStarClick(index + 1)}
      />
    ));
  };

  if (loading || loadingOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to view order details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600">The requested order could not be found.</p>
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
          <button
            onClick={() => router.push(getBackUrl())}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {getBackText()}
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">Order placed on {formatDate(order.orderDate)}</p>
              {isRealTimeActive && (
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Live tracking active
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              {getStatusIcon(order.status)}
              <span className={`ml-2 px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.menuItem.name}</h3>
                        <p className="text-sm text-gray-600">{item.menuItem.description}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-600">₹{item.price} each</span>
                          {item.menuItem.isVeg && (
                            <>
                              <span className="mx-2 text-gray-400">•</span>
                              <div className="w-3 h-3 border border-green-500 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-gray-900">{formatCurrency(order.deliveryFee || 30)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.role === 'customer' ? 'Delivery Information' : 'Customer Information'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{order.customerPhone}</p>
                    <p className="text-sm text-gray-600">Phone Number</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Information */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Restaurant</h3>
              </div>
              <div className="p-6">
                <p className="font-medium text-gray-900">{restaurant?.name || 'Loading...'}</p>
                <p className="text-sm text-gray-600">{restaurant?.address}</p>
                <p className="text-sm text-gray-500 mt-1">Restaurant ID: {order.restaurantId}</p>
              </div>
            </div>

            {/* Delivery Boy Information */}
            {order.deliveryBoyId && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Delivery Partner</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {order.deliveryBoyName?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.deliveryBoyName || 'Delivery Partner'}</p>
                      {order.deliveryBoyPhone && (
                        <a href={`tel:${order.deliveryBoyPhone}`} className="text-sm text-blue-600 hover:text-blue-700">
                          {order.deliveryBoyPhone}
                        </a>
                      )}
                    </div>
                  </div>
                  {order.deliveryStartTime && (
                    <p className="text-xs text-gray-500">
                      Picked up at {new Date(order.deliveryStartTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
                    <p className="text-sm text-gray-600">Payment Method</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Status</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Progress</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Order Placed</p>
                      <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  
                  {order.status !== 'pending' && order.status !== 'cancelled' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                        <p className="text-xs text-gray-500">Restaurant accepted your order</p>
                      </div>
                    </div>
                  )}
                  
                  {['preparing', 'ready', 'delivered'].includes(order.status) && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Preparing</p>
                        <p className="text-xs text-gray-500">Kitchen is preparing your order</p>
                      </div>
                    </div>
                  )}
                  
                  {['ready', 'out_for_delivery', 'delivered'].includes(order.status) && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Ready for Delivery</p>
                        <p className="text-xs text-gray-500">Order is ready</p>
                      </div>
                    </div>
                  )}
                  
                  {['out_for_delivery', 'delivered'].includes(order.status) && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Out for Delivery</p>
                        <p className="text-xs text-gray-500">
                          {order.deliveryBoyName ? `${order.deliveryBoyName} is delivering your order` : 'On the way to you'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {order.status === 'delivered' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Delivered</p>
                        <p className="text-xs text-gray-500">
                          {order.actualDeliveryTime ? 
                            `Delivered on ${formatDate(order.actualDeliveryTime)}` : 
                            'Order has been delivered'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">Order Cancelled</p>
                        <p className="text-xs text-red-500">This order has been cancelled</p>
                      </div>
                    </div>
                  )}

                  {order.status === 'pending' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">Waiting for Confirmation</p>
                        <p className="text-xs text-yellow-600">Restaurant will confirm your order soon</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estimated Delivery Time */}
                {order.estimatedDeliveryTime && order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Estimated delivery: </span>
                      <span className="font-medium text-gray-900 ml-1">
                        {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Actions */}
            {user?.role === 'customer' && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                  <div className="space-y-3">
                    {order.status === 'delivered' && (
                      <>
                        <button
                          onClick={() => router.push(`/restaurants/${order.restaurantId}`)}
                          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                        >
                          Order Again
                        </button>
                        
                        {/* Review Section */}
                        {existingReview ? (
                          <div className="border border-gray-200 rounded-md p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">Your Review</h4>
                              <div className="flex items-center">
                                {renderStars(existingReview.rating)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{existingReview.comment}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Reviewed on {new Date(existingReview.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowReviewModal(true)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Write a Review
                          </button>
                        )}
                      </>
                    )}
                    
                    <button
                      onClick={() => router.push('/restaurants')}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Browse Restaurants
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm(prev => ({ ...prev, rating }))
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                      {reviewForm.rating} out of 5 stars
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Share your experience with this order..."
                    required
                    minLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters ({reviewForm.comment.length}/10)
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || reviewForm.comment.trim().length < 10}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
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

const OrderDetailsPage = ({ params }: OrderDetailsPageProps) => {
  const unwrappedParams = use(params);
  
  return <OrderDetailsPageContent params={unwrappedParams} />;
};

export default OrderDetailsPage; 