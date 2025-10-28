'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bike,
  Package, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Phone,
  DollarSign,
  Navigation,
  ToggleLeft,
  ToggleRight,
  Eye,
  Star,
  Award,
  Hash
} from 'lucide-react';
import { 
  collection, 
  query, 
  where,
  orderBy, 
  doc, 
  updateDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import toast from 'react-hot-toast';

const DeliveryDashboard = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    todayDeliveries: 0,
    todayEarnings: 0,
    avgRating: 5.0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'delivery') {
      toast.error('Access denied. Only delivery partners can access this page.');
      router.push('/');
      return;
    }

    if (user) {
      setIsAvailable(user.isAvailable !== false);
      fetchOrders();
      calculateStats();
    }
  }, [user, loading, router]);

  const fetchOrders = () => {
    if (!user) return;

    // Listen to orders ready for pickup (not assigned to anyone yet)
    const availableQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'ready'),
      orderBy('orderDate', 'desc')
    );

    const availableUnsubscribe = onSnapshot(availableQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order)).filter(order => !order.deliveryBoyId);

      setAvailableOrders(orders);
    }, (error) => {
      console.error('Error fetching available orders:', error);
      // Fallback without orderBy
      const fallbackQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'ready')
      );
      onSnapshot(fallbackQuery, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order)).filter(order => !order.deliveryBoyId);
        setAvailableOrders(orders);
      });
    });

    // Listen to my assigned orders
    const myOrdersQuery = query(
      collection(db, 'orders'),
      where('deliveryBoyId', '==', user.id),
      orderBy('orderDate', 'desc')
    );

    const myOrdersUnsubscribe = onSnapshot(myOrdersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));

      setMyOrders(orders);
      setLoadingOrders(false);
    }, (error) => {
      console.error('Error fetching my orders:', error);
      // Fallback without orderBy
      const fallbackQuery = query(
        collection(db, 'orders'),
        where('deliveryBoyId', '==', user.id)
      );
      onSnapshot(fallbackQuery, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        setMyOrders(orders);
        setLoadingOrders(false);
      });
    });

    return () => {
      availableUnsubscribe();
      myOrdersUnsubscribe();
    };
  };

  const calculateStats = async () => {
    if (!user) return;

    try {
      const deliveredQuery = query(
        collection(db, 'orders'),
        where('deliveryBoyId', '==', user.id),
        where('status', '==', 'delivered')
      );

      const snapshot = await getDocs(deliveredQuery);
      const deliveredOrders = snapshot.docs.map(doc => doc.data() as Order);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = deliveredOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const todayEarnings = todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);

      setStats({
        totalDeliveries: user.totalDeliveries || deliveredOrders.length,
        todayDeliveries: todayOrders.length,
        todayEarnings: todayEarnings,
        avgRating: user.rating || 5.0
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const toggleAvailability = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.id), {
        isAvailable: !isAvailable,
        updatedAt: new Date()
      });

      setIsAvailable(!isAvailable);
      toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for deliveries`);
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const acceptOrder = async (order: Order) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'orders', order.id), {
        deliveryBoyId: user.id,
        deliveryBoyName: user.name,
        deliveryBoyPhone: user.phone || '',
        status: 'out_for_delivery',
        pickupTime: new Date(),
        deliveryStartTime: new Date()
      });

      toast.success('Order accepted! Navigate to the restaurant to pick it up.');
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'out_for_delivery' | 'delivered') => {
    try {
      const updateData: any = {
        status: newStatus
      };

      if (newStatus === 'delivered') {
        updateData.actualDeliveryTime = new Date();
        updateData.paymentStatus = 'completed';
        
        // Increment delivery count
        if (user) {
          await updateDoc(doc(db, 'users', user.id), {
            totalDeliveries: (user.totalDeliveries || 0) + 1
          });
        }
      }

      await updateDoc(doc(db, 'orders', orderId), updateData);
      
      toast.success(`Order marked as ${newStatus === 'delivered' ? 'delivered' : 'picked up'}!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
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
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'out_for_delivery') return 'bg-blue-100 text-blue-800';
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading || loadingOrders) {
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            
            {/* Availability Toggle */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Availability:</span>
                <button
                  onClick={toggleAvailability}
                  className="flex items-center"
                  title={isAvailable ? 'Click to go offline' : 'Click to go online'}
                >
                  {isAvailable ? (
                    <>
                      <span className="text-green-600 font-semibold mr-2">Online</span>
                      <ToggleRight className="w-12 h-12 text-green-500" />
                    </>
                  ) : (
                    <>
                      <span className="text-gray-600 font-semibold mr-2">Offline</span>
                      <ToggleLeft className="w-12 h-12 text-gray-400" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)} ⭐</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Orders */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Orders</h2>
                <p className="text-gray-600">{availableOrders.length} orders ready for pickup</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isAvailable ? 'Accepting Orders' : 'Not Accepting'}
              </div>
            </div>

            {!isAvailable && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <p className="text-yellow-800 text-sm">
                  ⚠️ You're currently offline. Toggle availability to see and accept orders.
                </p>
              </div>
            )}

            {availableOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders available for pickup</p>
                <p className="text-sm text-gray-400 mt-2">Check back soon for new delivery opportunities!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">Order #{order.id.slice(-6)}</h4>
                        <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(order.deliveryFee || 30)}</p>
                        <p className="text-xs text-gray-500">Delivery fee</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start text-sm">
                        <MapPin className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Delivery Address:</p>
                          <p className="text-gray-600">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-gray-600">Customer: {order.customerPhone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Package className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-gray-600">{order.items.length} items • {formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptOrder(order)}
                      disabled={!isAvailable}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-2xl hover:bg-orange-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Accept Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Orders */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
                <p className="text-gray-600">{myOrders.filter(o => o.status !== 'delivered').length} active deliveries</p>
              </div>
            </div>

            {myOrders.length === 0 ? (
              <div className="text-center py-12">
                <Bike className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assigned deliveries yet</p>
                <p className="text-sm text-gray-400 mt-2">Accept orders from the available list to start earning!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">Order #{order.id.slice(-6)}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status)}`}>
                          {order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(order.deliveryFee || 30)}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start text-sm">
                        <MapPin className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-600 line-clamp-2">{order.deliveryAddress}</p>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-blue-500 mr-2" />
                        <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:text-blue-700">
                          {order.customerPhone}
                        </a>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </button>
                      
                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-2xl hover:bg-green-700 transition-colors font-semibold"
                        >
                          Mark Delivered
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <button
                          onClick={() => router.push(`/restaurants/${order.restaurantId}`)}
                          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-2xl hover:bg-gray-700 transition-colors font-medium"
                        >
                          View Restaurant
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Vehicle Type</p>
              <div className="flex items-center">
                <Bike className="w-5 h-5 text-orange-500 mr-2" />
                <p className="text-gray-900 font-semibold capitalize">{user?.vehicleType || 'Not set'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Vehicle Number</p>
              <div className="flex items-center">
                <Hash className="w-5 h-5 text-blue-500 mr-2" />
                <p className="text-gray-900 font-semibold uppercase">{user?.vehicleNumber || 'Not set'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Contact</p>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-gray-900 font-semibold">{user?.phone || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;

