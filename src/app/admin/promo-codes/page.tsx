'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
    Tag,
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    Percent,
    DollarSign,
    Users,
    CheckCircle,
    XCircle,
    Search
} from 'lucide-react';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromoCode } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

const PromoCodesPage = () => {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage' as 'percentage' | 'flat',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscount: 0,
        usageLimit: 100,
        expiryDate: '',
        isActive: true
    });

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/');
            return;
        }

        if (isAdmin) {
            const unsubscribe = onSnapshot(
                query(collection(db, 'promoCodes'), orderBy('createdAt', 'desc')),
                (snapshot) => {
                    const codes = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate() || new Date(),
                        expiryDate: doc.data().expiryDate?.toDate() || new Date()
                    })) as PromoCode[];
                    setPromoCodes(codes);
                    setLoadingData(false);
                }
            );

            return () => unsubscribe();
        }
    }, [user, isAdmin, loading, router]);

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            minOrderAmount: 0,
            maxDiscount: 0,
            usageLimit: 100,
            expiryDate: '',
            isActive: true
        });
        setEditingPromo(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (promo: PromoCode) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            minOrderAmount: promo.minOrderAmount,
            maxDiscount: promo.maxDiscount || 0,
            usageLimit: promo.usageLimit,
            expiryDate: new Date(promo.expiryDate).toISOString().split('T')[0],
            isActive: promo.isActive
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || formData.code.length < 3) {
            toast.error('Promo code must be at least 3 characters');
            return;
        }

        if (formData.discountValue <= 0) {
            toast.error('Discount value must be greater than 0');
            return;
        }

        if (formData.discountType === 'percentage' && formData.discountValue > 100) {
            toast.error('Percentage discount cannot exceed 100%');
            return;
        }

        if (!formData.expiryDate) {
            toast.error('Please set an expiry date');
            return;
        }

        try {
            const promoData = {
                code: formData.code.toUpperCase().trim(),
                discountType: formData.discountType,
                discountValue: formData.discountValue,
                minOrderAmount: formData.minOrderAmount,
                maxDiscount: formData.discountType === 'percentage' ? formData.maxDiscount : null,
                usageLimit: formData.usageLimit,
                usedCount: editingPromo?.usedCount || 0,
                expiryDate: new Date(formData.expiryDate),
                isActive: formData.isActive,
                createdBy: user?.id || '',
                ...(editingPromo ? {} : { createdAt: new Date() })
            };

            if (editingPromo) {
                await updateDoc(doc(db, 'promoCodes', editingPromo.id), promoData);
                toast.success('Promo code updated successfully');
            } else {
                await addDoc(collection(db, 'promoCodes'), promoData);
                toast.success('Promo code created successfully');
            }

            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving promo code:', error);
            toast.error('Failed to save promo code');
        }
    };

    const handleDelete = async (promoId: string) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;

        try {
            await deleteDoc(doc(db, 'promoCodes', promoId));
            toast.success('Promo code deleted successfully');
        } catch (error) {
            console.error('Error deleting promo code:', error);
            toast.error('Failed to delete promo code');
        }
    };

    const toggleActive = async (promo: PromoCode) => {
        try {
            await updateDoc(doc(db, 'promoCodes', promo.id), {
                isActive: !promo.isActive
            });
            toast.success(`Promo code ${promo.isActive ? 'deactivated' : 'activated'}`);
        } catch (error) {
            console.error('Error toggling promo code:', error);
            toast.error('Failed to update promo code');
        }
    };

    const filteredPromoCodes = promoCodes.filter(promo =>
        promo.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isExpired = (date: Date) => {
        return new Date(date) < new Date();
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
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/admin" className="mr-4">
                            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
                            <p className="text-gray-600">Create and manage promotional codes</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Promo Code
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Codes</p>
                                <p className="text-2xl font-bold text-gray-900">{promoCodes.length}</p>
                            </div>
                            <Tag className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Codes</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {promoCodes.filter(p => p.isActive && !isExpired(p.expiryDate)).length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Expired</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {promoCodes.filter(p => isExpired(p.expiryDate)).length}
                                </p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Uses</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {promoCodes.reduce((sum, p) => sum + p.usedCount, 0)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search promo codes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>

                {/* Promo Codes Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {filteredPromoCodes.length === 0 ? (
                        <div className="text-center py-12">
                            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No promo codes found</p>
                            <button
                                onClick={openCreateModal}
                                className="mt-4 text-orange-600 hover:text-orange-700"
                            >
                                Create your first promo code
                            </button>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Min Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expiry
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPromoCodes.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-bold text-lg text-orange-600">
                                                {promo.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {promo.discountType === 'percentage' ? (
                                                    <>
                                                        <Percent className="w-4 h-4 mr-1 text-green-600" />
                                                        <span>{promo.discountValue}% off</span>
                                                        {promo.maxDiscount && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                (max ₹{promo.maxDiscount})
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                                                        <span>₹{promo.discountValue} off</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{promo.minOrderAmount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {promo.usedCount} / {promo.usageLimit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                <span className={isExpired(promo.expiryDate) ? 'text-red-600' : 'text-gray-900'}>
                                                    {formatDate(promo.expiryDate)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleActive(promo)}
                                                className={`px-2 py-1 text-xs rounded-full ${isExpired(promo.expiryDate)
                                                        ? 'bg-red-100 text-red-800'
                                                        : promo.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {isExpired(promo.expiryDate) ? 'Expired' : promo.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openEditModal(promo)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Promo Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g., FIRST50"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 font-mono uppercase"
                                        maxLength={20}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount Type *
                                        </label>
                                        <select
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'flat' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="flat">Flat Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount Value *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                            placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            min="1"
                                            max={formData.discountType === 'percentage' ? 100 : 10000}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Order (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minOrderAmount}
                                            onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                                            placeholder="e.g., 200"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            min="0"
                                        />
                                    </div>
                                    {formData.discountType === 'percentage' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Discount (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.maxDiscount}
                                                onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                                                placeholder="e.g., 100"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                                min="0"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Usage Limit
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                            placeholder="e.g., 100"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expiry Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                        Active (customers can use this code)
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                    >
                                        {editingPromo ? 'Update' : 'Create'} Promo Code
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

export default PromoCodesPage;
