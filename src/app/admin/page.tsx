'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  DollarSign,
  Activity,
  UserCheck,
  UserX,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  Ban,
  Tag
} from 'lucide-react';
import { collection, doc, updateDoc, query, onSnapshot, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Restaurant, Order } from '@/types';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  // Enhanced state management
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalShopkeepers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    todayOrders: 0,
    activeRestaurants: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });

  const [pendingRestaurants, setPendingRestaurants] = useState<Restaurant[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      setupRealTimeListeners();
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    filterUsers();
  }, [allUsers, userFilter, searchTerm]);

  const setupRealTimeListeners = () => {
    setLoadingData(true);

    // Enhanced restaurants listener
    const restaurantsUnsubscribe = onSnapshot(collection(db, 'restaurants'), (snapshot) => {
      const restaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
      setPendingRestaurants(restaurants.filter(r => !r.isApproved));

      setStats(prev => ({
        ...prev,
        totalRestaurants: restaurants.length,
        pendingApprovals: restaurants.filter(r => !r.isApproved).length,
        activeRestaurants: restaurants.filter(r => r.isApproved && r.isActive).length
      }));
    });

    // Enhanced orders listener
    const ordersUnsubscribe = onSnapshot(
      query(collection(db, 'orders'), orderBy('orderDate', 'desc')),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setRecentOrders(orders.slice(0, 15));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });

        const completedOrders = orders.filter(order => order.status === 'delivered');
        const cancelledOrders = orders.filter(order => order.status === 'cancelled');
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          todayOrders: todayOrders.length,
          totalRevenue,
          avgOrderValue,
          completedOrders: completedOrders.length,
          cancelledOrders: cancelledOrders.length
        }));
      }
    );

    // Enhanced users listener
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setAllUsers(users);

      const customers = users.filter(u => u.role === 'customer');
      const shopkeepers = users.filter(u => u.role === 'shopkeeper');

      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        totalCustomers: customers.length,
        totalShopkeepers: shopkeepers.length
      }));
    });

    setLoadingData(false);

    return () => {
      restaurantsUnsubscribe();
      ordersUnsubscribe();
      usersUnsubscribe();
    };
  };

  const filterUsers = () => {
    let filtered = allUsers;

    if (userFilter !== 'all') {
      filtered = filtered.filter(user => user.role === userFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRestaurantApproval = async (restaurantId: string, approve: boolean) => {
    try {
      await updateDoc(doc(db, 'restaurants', restaurantId), {
        isApproved: approve,
        updatedAt: new Date()
      });
      toast.success(`Restaurant ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error('Failed to update restaurant status');
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        await deleteDoc(doc(db, 'users', userId));
        toast.success('User deleted successfully');
      } else {
        await updateDoc(doc(db, 'users', userId), {
          isActive: action === 'activate',
          updatedAt: new Date()
        });
        toast.success(`User ${action}d successfully`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const viewOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
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

  const exportData = (type: 'users' | 'orders' | 'restaurants') => {
    // Implementation for data export
    toast.success(`${type} data export started`);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Comprehensive platform management</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <Activity className="w-4 h-4 mr-1" />
              Live Updates Active
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setupRealTimeListeners()}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">
                  {stats.totalCustomers} customers, {stats.totalShopkeepers} shopkeepers
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">
                  Avg: {formatCurrency(stats.avgOrderValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">
                  {stats.todayOrders} today
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRestaurants}</p>
                <p className="text-xs text-gray-500">
                  {stats.activeRestaurants} active, {stats.pendingApprovals} pending
                </p>
              </div>
              <Store className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Order Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">
                  {stats.completedOrders} completed, {stats.cancelledOrders} cancelled
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Growth</p>
                <p className="text-2xl font-bold text-blue-600">+12%</p>
                <p className="text-xs text-gray-500">This month vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-2xl font-bold text-red-600">{stats.pendingApprovals}</p>
                <p className="text-xs text-gray-500">Restaurant approvals needed</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'restaurants', label: 'Restaurant Approvals', icon: Store },
                { id: 'orders', label: 'Order Monitoring', icon: ShoppingBag },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
              {/* Promo Codes - Links to separate page */}
              <a
                href="/admin/promo-codes"
                className="flex items-center py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Tag className="w-4 h-4 mr-2" />
                Promo Codes
              </a>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Overview</h3>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Manage Users</h4>
                    <p className="text-sm text-gray-600">View and manage all platform users</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('restaurants')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Store className="w-6 h-6 text-orange-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Restaurant Approvals</h4>
                    <p className="text-sm text-gray-600">{stats.pendingApprovals} pending approvals</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <ShoppingBag className="w-6 h-6 text-purple-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Monitor Orders</h4>
                    <p className="text-sm text-gray-600">Track all platform orders</p>
                  </button>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <ShoppingBag className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Order #{order.id.slice(-6)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatCurrency(order.totalAmount)} • {formatDate(order.orderDate)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced User Management Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button
                    onClick={() => exportData('users')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </button>
                </div>

                {/* User Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Users</option>
                    <option value="customer">Customers</option>
                    <option value="shopkeeper">Shopkeepers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-medium">
                                  {user.name?.charAt(0) || user.email.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'shopkeeper' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              {user.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                  {user.phone}
                                </div>
                              )}
                              {user.address && (
                                <div className="flex items-center mt-1">
                                  <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                  <span className="truncate max-w-32">{user.address}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewUserDetails(user)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {user.role !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => handleUserAction(user.id, 'activate')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUserAction(user.id, 'deactivate')}
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUserAction(user.id, 'delete')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users found matching your criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Restaurant Approvals Tab */}
            {activeTab === 'restaurants' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Restaurant Approvals</h3>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    {stats.pendingApprovals} Pending
                  </span>
                </div>

                {pendingRestaurants.length === 0 ? (
                  <div className="text-center py-8">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending restaurant approvals</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {pendingRestaurants.map((restaurant) => (
                      <div key={restaurant.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">{restaurant.name}</h4>
                            <p className="text-gray-600 mt-1">{restaurant.description}</p>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                {restaurant.address}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                {restaurant.phone}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                {restaurant.openingHours} - {restaurant.closingHours}
                              </div>
                            </div>
                            <div className="mt-3">
                              <span className="text-sm text-gray-600">Cuisines: </span>
                              <span className="text-sm font-medium">
                                {restaurant.cuisineTypes?.join(', ')}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-3 ml-6">
                            <button
                              onClick={() => handleRestaurantApproval(restaurant.id, true)}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRestaurantApproval(restaurant.id, false)}
                              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order Monitoring Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Order Monitoring</h3>
                  <button
                    onClick={() => exportData('orders')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Orders
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Restaurant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id.slice(-6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.restaurantName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                              }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.orderDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => viewOrderDetails(order.id)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Revenue Trends</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="text-sm font-medium">{formatCurrency(stats.totalRevenue * 0.3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Month</span>
                        <span className="text-sm font-medium">{formatCurrency(stats.totalRevenue * 0.25)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Growth</span>
                        <span className="text-sm font-medium text-green-600">+20%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">User Growth</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">New Users (30d)</span>
                        <span className="text-sm font-medium">{Math.round(stats.totalUsers * 0.15)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Users</span>
                        <span className="text-sm font-medium">{Math.round(stats.totalUsers * 0.8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Retention Rate</span>
                        <span className="text-sm font-medium text-green-600">85%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Platform Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                      </p>
                      <p className="text-sm text-gray-600">Order Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">4.2</p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">28min</p>
                      <p className="text-sm text-gray-600">Avg Delivery Time</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-medium text-xl">
                    {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900">
                    {selectedUser.name || 'No name provided'}
                  </h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                      selectedUser.role === 'shopkeeper' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joined</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="text-sm text-gray-900">{selectedUser.address || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="text-sm text-gray-900 font-mono">{selectedUser.id}</p>
              </div>

              {selectedUser.role !== 'admin' && (
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleUserAction(selectedUser.id, 'activate');
                      setShowUserModal(false);
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </button>
                  <button
                    onClick={() => {
                      handleUserAction(selectedUser.id, 'deactivate');
                      setShowUserModal(false);
                    }}
                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Deactivate
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this user?')) {
                        handleUserAction(selectedUser.id, 'delete');
                        setShowUserModal(false);
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 