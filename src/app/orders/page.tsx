'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Eye,
  ShoppingBag,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can view orders');
      router.push('/');
      return;
    }

    setupRealTimeListener();
  }, [user, router]);

  const setupRealTimeListener = () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', user.id),
        orderBy('orderDate', 'desc')
      );
      
      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));

        setOrders(ordersData);
        setIsRealTimeActive(true);
        setLoading(false);
      }, (error) => {
        console.error('Error in real-time listener:', error);
        toast.error('Failed to load orders');
        setIsRealTimeActive(false);
        setLoading(false);
      });

      // Cleanup function
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

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
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track and manage your food orders</p>
            </div>
            {isRealTimeActive && (
              <div className="flex items-center text-sm text-green-600">
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Live updates active
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
              { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
              { key: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
              { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
              { key: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter(o => o.status === 'out_for_delivery').length },
              { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet. Start by browsing restaurants!" 
                : `You don't have any ${filter} orders at the moment.`
              }
            </p>
            <Link
              href="/restaurants"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                    
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Track
                    </Link>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} from Restaurant
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {order.items.slice(0, 3).map((item, index) => (
                          <span key={index} className="text-sm text-gray-600">
                            {item.menuItem.name}
                            {index < Math.min(order.items.length, 3) - 1 && ', '}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-gray-500">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-medium text-gray-900">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment</span>
                          <span className="capitalize text-gray-900">{order.paymentMethod}</span>
                        </div>
                        {order.estimatedDeliveryTime && order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Est. Delivery</span>
                            <span className="text-gray-900">
                              {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Delivery to: {order.deliveryAddress.split(',')[0]}...
                  </div>
                  
                  <div className="flex space-x-2">
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => router.push(`/restaurants/${order.restaurantId}`)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Order Again
                      </button>
                    )}
                    
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination could be added here for large order lists */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 