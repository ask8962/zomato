'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Store, 
  Package, 
  Clock, 
  TrendingUp, 
  DollarSign,
  ChefHat,
  Eye,
  Plus,
  Settings,
  Bike,
  UserPlus,
  XCircle
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Restaurant, Order } from '@/types';
import { addSampleMenuItems } from '@/utils/sampleData';
import toast from 'react-hot-toast';

const ShopkeeperDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallbackQuery, setUsingFallbackQuery] = useState(false);
  const [availableDeliveryBoys, setAvailableDeliveryBoys] = useState<any[]>([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'shopkeeper') {
      toast.error('Access denied. Only shopkeepers can access this page.');
      router.push('/');
      return;
    }

    fetchRestaurantData();
    fetchAvailableDeliveryBoys();
  }, [user, router]);

  useEffect(() => {
    if (restaurant) {
      // Set up real-time listener for orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', restaurant.id),
        orderBy('orderDate', 'desc')
      );

      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));

        setOrders(ordersData);
        calculateStats(ordersData);
      }, (error) => {
        console.error('Error in orders listener:', error);
        
        // Fallback: Fetch without orderBy if index is not ready
        if (error.code === 'failed-precondition') {
          console.log('Using fallback query without orderBy...');
          setUsingFallbackQuery(true);
          toast.error('Database index is building. Using temporary fallback - data may load slower.', {
            duration: 5000
          });
          
          const fallbackQuery = query(
            collection(db, 'orders'),
            where('restaurantId', '==', restaurant.id)
          );
          
          const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Order));

            // Sort in JavaScript as fallback
            ordersData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

            setOrders(ordersData);
            calculateStats(ordersData);
          });

          return () => fallbackUnsubscribe();
        }
      });

      return () => unsubscribe();
    }
  }, [restaurant]);

  const fetchRestaurantData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch restaurant owned by this user
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
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast.error('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDeliveryBoys = async () => {
    try {
      const deliveryQuery = query(
        collection(db, 'users'),
        where('role', '==', 'delivery'),
        where('isAvailable', '==', true)
      );

      const snapshot = await getDocs(deliveryQuery);
      const deliveryBoys = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAvailableDeliveryBoys(deliveryBoys);
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
    }
  };

  const assignDeliveryBoy = async (deliveryBoy: any) => {
    if (!selectedOrderForDelivery) return;

    try {
      await updateDoc(doc(db, 'orders', selectedOrderForDelivery.id), {
        deliveryBoyId: deliveryBoy.id,
        deliveryBoyName: deliveryBoy.name,
        deliveryBoyPhone: deliveryBoy.phone,
        status: 'out_for_delivery',
        deliveryStartTime: new Date()
      });

      toast.success(`Order assigned to ${deliveryBoy.name}`);
      setShowDeliveryModal(false);
      setSelectedOrderForDelivery(null);
    } catch (error) {
      console.error('Error assigning delivery boy:', error);
      toast.error('Failed to assign delivery boy');
    }
  };

  const openAssignDeliveryModal = (order: Order) => {
    setSelectedOrderForDelivery(order);
    setShowDeliveryModal(true);
    fetchAvailableDeliveryBoys();
  };

  const calculateStats = (ordersData: Order[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = ordersData.filter(order => {
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const pendingOrders = ordersData.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    ).length;

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = ordersData.length > 0 
      ? ordersData.reduce((sum, order) => sum + order.totalAmount, 0) / ordersData.length 
      : 0;

    setStats({
      totalOrders: ordersData.length,
      pendingOrders,
      todayRevenue,
      avgOrderValue
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        ...(newStatus === 'delivered' && { actualDeliveryTime: new Date() })
      });
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const addSampleMenu = async () => {
    if (!restaurant) return;
    
    try {
      await addSampleMenuItems(restaurant.id);
      toast.success('Sample menu items added successfully!');
    } catch (error) {
      console.error('Error adding sample menu:', error);
      toast.error('Failed to add sample menu items');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'delivered';
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Restaurant Found</h1>
            <p className="text-gray-600 mb-8">
              You haven't registered a restaurant yet. Please register your restaurant to start receiving orders.
            </p>
            <button
              onClick={() => router.push('/shopkeeper/register')}
              className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
            >
              Register Restaurant
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Restaurant Under Review</h1>
            <p className="text-gray-600 mb-8">
              Your restaurant "{restaurant.name}" is currently under review by our admin team. 
              You'll be notified once it's approved and you can start receiving orders.
            </p>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Restaurant Details:</h3>
              <p className="text-gray-600">Name: {restaurant.name}</p>
              <p className="text-gray-600">Address: {restaurant.address}</p>
              <p className="text-gray-600">Phone: {restaurant.phone}</p>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with {restaurant.name}</p>
        </div>

        {/* Fallback Query Warning */}
        {usingFallbackQuery && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Database Index Building
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  We're optimizing your database for better performance. Orders may load slightly slower during this process.
                  This will be resolved automatically in a few minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.todayRevenue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{Math.round(stats.avgOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <button
                  onClick={() => router.push('/orders')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  View All
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <button
                    onClick={addSampleMenu}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sample Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</h4>
                          <p className="text-sm text-gray-600">{order.customerName} • {order.customerPhone}</p>
                          <p className="text-sm text-gray-500">{formatTime(order.orderDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{order.totalAmount}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          {order.items.length} item(s) • {order.deliveryAddress.split(',')[0]}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>

                        <div className="flex space-x-2">
                          {order.status === 'ready' && !order.deliveryBoyId && (
                            <button
                              onClick={() => openAssignDeliveryModal(order)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                              <Bike className="w-3 h-3 mr-1" />
                              Assign Delivery
                            </button>
                          )}
                          
                          {getNextStatus(order.status) && (
                            <button
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                              className="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                            >
                              Mark as {getNextStatus(order.status)}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Restaurant Info & Quick Actions */}
          <div className="space-y-6">
            {/* Restaurant Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Restaurant Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{restaurant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="font-medium">{restaurant.rating} ⭐ ({restaurant.totalRatings} reviews)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/restaurants/${restaurant.id}`)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Restaurant Page
                </button>
                
                <button
                  onClick={() => router.push('/shopkeeper/menu')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  Manage Menu
                </button>
                
                <button
                  onClick={() => router.push('/shopkeeper/settings')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Restaurant Settings
                </button>
                
                <button
                  onClick={addSampleMenu}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sample Menu
                </button>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders</span>
                  <span className="font-medium">{orders.filter(o => {
                    const today = new Date();
                    const orderDate = new Date(o.orderDate);
                    return orderDate.toDateString() === today.toDateString();
                  }).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-medium">₹{stats.todayRevenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium">{stats.pendingOrders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Boy Assignment Modal */}
        {showDeliveryModal && selectedOrderForDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Assign Delivery Partner</h2>
                    <p className="text-gray-600">Order #{selectedOrderForDelivery.id.slice(-6)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeliveryModal(false);
                      setSelectedOrderForDelivery(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Order Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Delivery Address:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrderForDelivery.deliveryAddress.split(',')[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delivery Fee:</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(selectedOrderForDelivery.deliveryFee || 30)}
                    </span>
                  </div>
                </div>

                {/* Available Delivery Boys */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Available Delivery Partners ({availableDeliveryBoys.length})
                  </h3>
                  
                  {availableDeliveryBoys.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bike className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No delivery partners available right now</p>
                      <p className="text-sm mt-2">Please try again in a few moments</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableDeliveryBoys.map((deliveryBoy) => (
                        <button
                          key={deliveryBoy.id}
                          onClick={() => assignDeliveryBoy(deliveryBoy)}
                          className="w-full border-2 border-gray-200 rounded-2xl p-4 hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {deliveryBoy.name?.charAt(0) || 'D'}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{deliveryBoy.name}</h4>
                                <p className="text-sm text-gray-600">{deliveryBoy.phone}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                                    {deliveryBoy.vehicleType || 'bike'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {deliveryBoy.totalDeliveries || 0} deliveries
                                  </span>
                                  <span className="text-xs text-yellow-600">
                                    ⭐ {deliveryBoy.rating?.toFixed(1) || '5.0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <UserPlus className="w-5 h-5 text-orange-500" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDeliveryModal(false);
                      setSelectedOrderForDelivery(null);
                    }}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopkeeperDashboard; 