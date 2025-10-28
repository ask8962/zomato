# FoodExpress Setup Guide

This guide will help you set up the FoodExpress food delivery application from scratch.

## 🚀 Quick Start

The application is already configured and ready to run! Just follow these steps:

### 1. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Test the Application

1. **Visit the homepage** - Beautiful landing page with features
2. **Register accounts** - Try different user roles:
   - Customer: Regular user account
   - Shopkeeper: Restaurant owner account
   - Admin: Use `ganukalp70@gmail.com` for admin access

3. **Test workflows**:
   - Register as shopkeeper → Submit restaurant → Admin approves
   - Browse restaurants as customer
   - Admin manages the platform

## 🔧 Firebase Setup (Required for Production)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable the following services:
   - **Authentication** (Email/Password, Google, Phone)
   - **Firestore Database**
   - **Storage**

### 2. Configure Authentication

1. Go to Authentication → Sign-in method
2. Enable **Email/Password** provider
3. Enable **Google** provider
4. Enable **Phone** provider ⭐ NEW (for OTP login)
5. Add `ganukalp70@gmail.com` as an admin user

**For Phone Authentication:**
- Add test phone numbers (optional): `+919999999999` with code `123456`
- Note: Requires Blaze plan for production (free tier: 10 SMS/day)

### 3. Set up Firestore Database

1. Go to Firestore Database
2. Create database in **production mode**
3. Deploy the security rules:

```bash
npm run firebase:rules
```

### 4. Deploy Firestore Indexes

```bash
npm run firebase:indexes
```

### 5. Configure Storage

1. Go to Storage
2. Deploy storage rules:

```bash
firebase deploy --only storage
```

## 📁 Database Collections

The app will automatically create these collections:

### `users`
```javascript
{
  id: string,
  email: string,
  name: string,
  phone?: string,
  address?: string,
  role: 'customer' | 'shopkeeper' | 'admin',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `restaurants`
```javascript
{
  id: string,
  name: string,
  description: string,
  address: string,
  phone: string,
  email: string,
  ownerId: string,
  isApproved: boolean,
  isActive: boolean,
  rating: number,
  totalRatings: number,
  cuisineTypes: string[],
  deliveryTime: string,
  minimumOrder: number,
  deliveryFee: number,
  image: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `menuItems`
```javascript
{
  id: string,
  restaurantId: string,
  name: string,
  description: string,
  price: number,
  image: string,
  category: string,
  isVeg: boolean,
  isAvailable: boolean,
  preparationTime: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `orders`
```javascript
{
  id: string,
  customerId: string,
  restaurantId: string,
  items: CartItem[],
  totalAmount: number,
  deliveryFee: number,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
  deliveryAddress: string,
  customerPhone: string,
  customerName: string,
  paymentMethod: 'cash' | 'online',
  paymentStatus: 'pending' | 'completed' | 'failed',
  orderDate: timestamp,
  estimatedDeliveryTime?: timestamp,
  actualDeliveryTime?: timestamp,
  notes?: string
}
```

## 🔐 Security Rules

The application includes comprehensive security rules:

- **Users**: Can only access their own data
- **Restaurants**: Public read for approved, owners can manage their own
- **Menu Items**: Public read, owners can manage their items
- **Orders**: Customers see their orders, restaurants see their orders
- **Admin**: `ganukalp70@gmail.com` has full access to everything

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Deploy automatically

### Option 2: Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init
```

4. Deploy:
```bash
npm run deploy
```

## 🧪 Testing the Application

### Admin Testing
1. Register with `ganukalp70@gmail.com`
2. Access admin panel at `/admin`
3. Approve restaurants, manage users

### Shopkeeper Testing
1. Register as "Restaurant Owner"
2. Fill restaurant details
3. Wait for admin approval
4. Manage menu items and orders

### Customer Testing
1. Register as "Customer"
2. Browse approved restaurants
3. View menus and place orders

## 📱 Features Implemented

### ✅ Phase 1 (Completed)
- [x] User authentication with roles
- [x] Admin panel with restaurant approval
- [x] Shopkeeper dashboard
- [x] Restaurant browsing for customers
- [x] Responsive design
- [x] Firebase integration
- [x] Security rules

### ✅ Phase 2 (COMPLETED!)
- [x] Individual restaurant pages
- [x] Shopping cart functionality
- [x] Order placement system
- [x] Menu item management for shopkeepers
- [x] Image upload functionality
- [x] Restaurant settings management
- [x] Profile management
- [x] Favorites system
- [x] Review display system
- [x] Help/FAQ pages
- [x] Contact page
- [x] About page

### ✅ Phase 3 (COMPLETED!)
- [x] Real-time order tracking
- [x] Review and rating system
- [x] Advanced analytics
- [x] User management
- [x] Complete menu CRUD
- [x] Image management with Firebase Storage

### 📋 Phase 4 (Optional Enhancements)
- [ ] Online payment integration (Razorpay/Stripe)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Promotional codes
- [ ] Mobile apps (iOS/Android)

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Firebase
npm run deploy

# Deploy only Firestore rules
npm run firebase:rules

# Deploy only Firestore indexes
npm run firebase:indexes
```

## 📞 Support

For any issues or questions:
- Email: ganukalp70@gmail.com
- Check the README.md for detailed documentation

## 🎯 Key Features

1. **Multi-Role System**: Customer, Shopkeeper, Admin
2. **Admin Approval Workflow**: Restaurants need approval
3. **Secure Access**: Role-based permissions
4. **Real-time Data**: Firebase Firestore integration
5. **Responsive Design**: Works on all devices
6. **Modern Tech Stack**: Next.js 14, React 18, TypeScript

---

**Your food delivery platform is ready to serve tier 2/3 cities! 🚀** 