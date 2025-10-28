# 🍕 FoodExpress - Food Delivery Platform

A comprehensive food delivery web application built for tier 2/3 cities, featuring multi-role authentication, real-time order tracking, and complete restaurant management.

## 🚀 **Live Demo**

The application is running at `http://localhost:3000`

## ✨ **Features Implemented**

### 🔐 **Authentication & Authorization**
- **Multi-role system**: Customer, Shopkeeper, Delivery Partner, Admin ⭐
- **4 Authentication Methods**:
  - Email/Password
  - Google Sign-in
  - **Phone/OTP** ⭐ NEW
  - Password Reset
- **Role-based access control** with protected routes
- **Admin-only access** restricted to `ganukalp70@gmail.com`
- **Offline Support** with data persistence ⭐ NEW

### 👨‍💼 **Admin Panel**
- **Restaurant approval workflow** - approve/reject new restaurants
- **Platform analytics** - total users, restaurants, orders, revenue
- **User management** - view all registered users
- **Order monitoring** - track all platform orders
- **Real-time dashboard** with live statistics

### 🏪 **Shopkeeper Features**
- **Restaurant registration** with detailed information
- **Real-time order management** with status updates
- **Dashboard analytics** - orders, revenue, ratings
- **Menu management** with full CRUD operations ⭐
- **Image uploads** for restaurant and menu items ⭐
- **Restaurant settings** - Update all restaurant info ⭐
- **Order status tracking** - pending → confirmed → preparing → ready → out_for_delivery → delivered ⭐
- **Revenue tracking** with daily summaries
- **Delivery assignment** - Assign orders to delivery partners ⭐ NEW
- **Delivery partner management** - View available riders ⭐ NEW

### 👥 **Customer Experience**
- **Restaurant browsing** with search and filters
- **Individual restaurant pages** with detailed menus
- **Shopping cart functionality** with quantity management
- **Order placement system** with complete checkout flow
- **Real-time order tracking** with live status updates
- **Order history** with filtering and status management
- **Cash on delivery** payment option
- **Favorites system** - Save favorite restaurants ⭐
- **Profile management** - Edit profile, change password ⭐
- **Review system** - Rate restaurants and delivery ⭐
- **Delivery partner tracking** - See who's delivering ⭐ NEW

### 🛒 **Shopping & Orders**
- **Add to cart** with quantity controls
- **Cart persistence** across sessions
- **Minimum order validation**
- **Delivery fee calculation**
- **Order placement** with customer details
- **Real-time order tracking** with progress timeline
- **Order status updates** (pending → confirmed → preparing → ready → delivered)

### 🚴 **Delivery Partner Features** ⭐ NEW
- **Delivery dashboard** with earnings tracker
- **Availability toggle** - Go online/offline
- **Order acceptance system** - Accept ready orders
- **My deliveries** - Track assigned orders
- **Delivery status updates** - Mark as delivered
- **Statistics** - Total deliveries, today's earnings, rating
- **Vehicle information** - Manage vehicle details
- **Customer contact** - Call customers for delivery
- **Real-time notifications** - New order alerts
- **Performance tracking** - Ratings and delivery count

### 📱 **User Interface**
- **Responsive design** - works on all devices
- **Modern UI/UX** with Tailwind CSS
- **Beautiful landing page** with features showcase
- **Intuitive navigation** with role-based menus
- **Real-time notifications** with toast messages
- **Loading states** and error handling
- **Image upload** with progress indicators ⭐
- **Profile management** with password change ⭐
- **Help center** with 25+ FAQs ⭐
- **Contact form** with validation ⭐

### 🔥 **Real-time Features**
- **Live order tracking** with Firebase listeners
- **Instant status updates** for customers and restaurants
- **Real-time dashboard** statistics
- **Live notifications** for order changes

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context API
- **Authentication**: Email/Password, Google, Phone/OTP
- **Real-time**: Firebase Realtime Database, Firestore Listeners
- **Offline Support**: IndexedDB Persistence

## 📁 **Project Structure**

```
food-delivery-app/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── admin/             # Admin panel pages
│   │   ├── auth/              # Authentication pages
│   │   ├── checkout/          # Order checkout page
│   │   ├── orders/            # Order tracking & history
│   │   ├── restaurants/       # Restaurant browsing & details
│   │   └── shopkeeper/        # Shopkeeper dashboard & registration
│   ├── components/            # Reusable UI components
│   ├── contexts/              # React Context providers
│   ├── lib/                   # Firebase configuration
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions & sample data
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Database indexes
├── storage.rules             # Storage security rules
└── firebase.json             # Firebase configuration
```

## 🔧 **Setup & Installation**

### Prerequisites
- Node.js 18+ installed
- Firebase project created
- Git installed

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd food-delivery-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Firebase Configuration

The app is already configured with Firebase. For production deployment:

1. **Deploy Firestore rules**
```bash
npm run firebase:rules
```

2. **Deploy database indexes**
```bash
npm run firebase:indexes
```

3. **Deploy to Firebase Hosting**
```bash
npm run deploy
```

## 🧪 **Testing the Application**

### 1. **Admin Testing**
- Register/Login with `ganukalp70@gmail.com`
- Access admin panel at `/admin`
- Approve restaurants and manage platform

### 2. **Shopkeeper Testing**
- Register as "Restaurant Owner"
- Complete restaurant registration
- Wait for admin approval
- Add sample menu items
- Manage incoming orders

### 3. **Customer Testing**
- Register as "Customer"
- Browse approved restaurants
- Add items to cart
- Place orders with cash on delivery
- Track order status in real-time

## 📊 **Database Collections**

### `users`
- User authentication and profile data
- Role-based access control

### `restaurants`
- Restaurant information and approval status
- Owner details and operational data

### `menuItems`
- Restaurant menu with categories
- Pricing and availability status

### `orders`
- Complete order information
- Real-time status tracking
- Customer and delivery details

### `reviews` (planned)
- Customer reviews and ratings
- Restaurant feedback system

## 🔐 **Security Features**

- **Comprehensive Firestore rules** for data protection
- **Role-based access control** at database level
- **Admin-only operations** with email verification
- **User data isolation** - users can only access their own data
- **Restaurant owner permissions** - manage only owned restaurants
- **Secure file uploads** with size and type restrictions

## 🚀 **Deployment**

### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Deploy automatically

### Firebase Hosting
```bash
npm run build
npm run export
firebase deploy
```

## 📈 **Performance Features**

- **Database indexes** for fast queries
- **Real-time listeners** for live updates
- **Optimized queries** with proper filtering
- **Responsive images** and lazy loading
- **Efficient state management**

## 🎯 **Key Workflows**

### Restaurant Onboarding
1. Shopkeeper registers account
2. Submits restaurant details
3. Admin reviews and approves
4. Restaurant goes live
5. Menu items can be added

### Order Flow
1. Customer browses restaurants
2. Adds items to cart
3. Proceeds to checkout
4. Places order with details
5. Real-time tracking begins
6. Status updates throughout delivery

### Admin Management
1. Monitor platform statistics
2. Review restaurant applications
3. Approve/reject restaurants
4. Track all orders and users
5. Manage platform operations

## 🔄 **Real-time Updates**

- **Order status changes** instantly reflect for all users
- **Dashboard statistics** update in real-time
- **New orders** appear immediately for restaurants
- **Cart synchronization** across browser sessions

## 💳 **Payment Integration**

- **Cash on Delivery** - fully implemented
- **Online Payment** - placeholder for future integration
- **Order total calculation** with delivery fees
- **Minimum order validation**

## 📱 **Mobile Responsive**

- **Fully responsive design** for all screen sizes
- **Touch-friendly interface** for mobile users
- **Optimized navigation** for small screens
- **Fast loading** on mobile networks

## 🎨 **UI/UX Features**

- **Modern design** with consistent branding
- **Intuitive navigation** with clear user flows
- **Loading states** for better user experience
- **Error handling** with helpful messages
- **Success notifications** for user actions

## 🔮 **Future Enhancements**

- **Online payment integration** (Razorpay/Stripe)
- **Push notifications** for order updates
- **Advanced analytics** and reporting
- **Review and rating system**
- **Delivery tracking** with maps
- **Promotional codes** and discounts
- **Multi-language support**

## 📞 **Support**

For any issues or questions:
- **Email**: ganukalp70@gmail.com
- **Check**: Console logs for debugging
- **Review**: Firebase rules and indexes

---

**🎉 Your complete food delivery platform is ready to serve tier 2/3 cities! 🚀**
#   z o m a t o  
 