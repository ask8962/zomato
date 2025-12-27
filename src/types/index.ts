export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'shopkeeper' | 'admin' | 'delivery';
  createdAt: Date;
  updatedAt: Date;
  // Delivery boy specific fields
  vehicleType?: 'bike' | 'scooter' | 'bicycle' | 'car';
  vehicleNumber?: string;
  isAvailable?: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  totalDeliveries?: number;
  rating?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  address: string;
  phone: string;
  email: string;
  ownerId: string;
  isApproved: boolean;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  cuisineTypes: string[];
  deliveryTime: string;
  minimumOrder: number;
  deliveryFee: number;
  openingHours?: string;
  closingHours?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  restaurantName?: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  customerPhone: string;
  customerName: string;
  paymentMethod: 'cash' | 'online';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderDate: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  // Delivery boy fields
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
  pickupTime?: Date;
  deliveryStartTime?: Date;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
} 