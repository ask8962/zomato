import { MenuItem } from '@/types';

export const sampleMenuItems: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Pizza items
  {
    restaurantId: '', // Will be set when adding to restaurant
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh tomatoes, mozzarella cheese, and basil',
    price: 299,
    image: '',
    category: 'Pizza',
    isVeg: true,
    isAvailable: true,
    preparationTime: 20
  },
  {
    restaurantId: '',
    name: 'Pepperoni Pizza',
    description: 'Delicious pizza topped with pepperoni and mozzarella cheese',
    price: 399,
    image: '',
    category: 'Pizza',
    isVeg: false,
    isAvailable: true,
    preparationTime: 22
  },
  {
    restaurantId: '',
    name: 'Veggie Supreme Pizza',
    description: 'Loaded with bell peppers, onions, mushrooms, olives, and cheese',
    price: 449,
    image: '',
    category: 'Pizza',
    isVeg: true,
    isAvailable: true,
    preparationTime: 25
  },

  // Burger items
  {
    restaurantId: '',
    name: 'Classic Chicken Burger',
    description: 'Juicy chicken patty with lettuce, tomato, and mayo in a soft bun',
    price: 199,
    image: '',
    category: 'Burgers',
    isVeg: false,
    isAvailable: true,
    preparationTime: 15
  },
  {
    restaurantId: '',
    name: 'Veg Deluxe Burger',
    description: 'Crispy vegetable patty with fresh veggies and special sauce',
    price: 179,
    image: '',
    category: 'Burgers',
    isVeg: true,
    isAvailable: true,
    preparationTime: 12
  },
  {
    restaurantId: '',
    name: 'Cheese Burst Burger',
    description: 'Double cheese burger with chicken patty and special cheese sauce',
    price: 249,
    image: '',
    category: 'Burgers',
    isVeg: false,
    isAvailable: true,
    preparationTime: 18
  },

  // Indian items
  {
    restaurantId: '',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces',
    price: 320,
    image: '',
    category: 'Indian',
    isVeg: false,
    isAvailable: true,
    preparationTime: 25
  },
  {
    restaurantId: '',
    name: 'Paneer Butter Masala',
    description: 'Rich and creamy paneer curry in tomato-based gravy',
    price: 280,
    image: '',
    category: 'Indian',
    isVeg: true,
    isAvailable: true,
    preparationTime: 20
  },
  {
    restaurantId: '',
    name: 'Biryani (Chicken)',
    description: 'Aromatic basmati rice cooked with spiced chicken and herbs',
    price: 350,
    image: '',
    category: 'Indian',
    isVeg: false,
    isAvailable: true,
    preparationTime: 30
  },
  {
    restaurantId: '',
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice with mixed vegetables and aromatic spices',
    price: 280,
    image: '',
    category: 'Indian',
    isVeg: true,
    isAvailable: true,
    preparationTime: 25
  },

  // Chinese items
  {
    restaurantId: '',
    name: 'Chicken Fried Rice',
    description: 'Wok-tossed rice with chicken, vegetables, and soy sauce',
    price: 220,
    image: '',
    category: 'Chinese',
    isVeg: false,
    isAvailable: true,
    preparationTime: 15
  },
  {
    restaurantId: '',
    name: 'Veg Hakka Noodles',
    description: 'Stir-fried noodles with fresh vegetables and Chinese sauces',
    price: 180,
    image: '',
    category: 'Chinese',
    isVeg: true,
    isAvailable: true,
    preparationTime: 12
  },
  {
    restaurantId: '',
    name: 'Chilli Chicken',
    description: 'Spicy Indo-Chinese chicken dish with bell peppers and onions',
    price: 280,
    image: '',
    category: 'Chinese',
    isVeg: false,
    isAvailable: true,
    preparationTime: 20
  },

  // Beverages
  {
    restaurantId: '',
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime juice with soda water and mint',
    price: 80,
    image: '',
    category: 'Beverages',
    isVeg: true,
    isAvailable: true,
    preparationTime: 5
  },
  {
    restaurantId: '',
    name: 'Mango Lassi',
    description: 'Creamy yogurt drink blended with fresh mango pulp',
    price: 120,
    image: '',
    category: 'Beverages',
    isVeg: true,
    isAvailable: true,
    preparationTime: 5
  },
  {
    restaurantId: '',
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea with milk and aromatic spices',
    price: 40,
    image: '',
    category: 'Beverages',
    isVeg: true,
    isAvailable: true,
    preparationTime: 8
  },

  // Desserts
  {
    restaurantId: '',
    name: 'Chocolate Brownie',
    description: 'Rich and fudgy chocolate brownie served warm with ice cream',
    price: 150,
    image: '',
    category: 'Desserts',
    isVeg: true,
    isAvailable: true,
    preparationTime: 10
  },
  {
    restaurantId: '',
    name: 'Gulab Jamun (2 pcs)',
    description: 'Traditional Indian sweet dumplings in sugar syrup',
    price: 80,
    image: '',
    category: 'Desserts',
    isVeg: true,
    isAvailable: true,
    preparationTime: 5
  },
  {
    restaurantId: '',
    name: 'Ice Cream Sundae',
    description: 'Vanilla ice cream topped with chocolate sauce and nuts',
    price: 120,
    image: '',
    category: 'Desserts',
    isVeg: true,
    isAvailable: true,
    preparationTime: 5
  }
];

export const addSampleMenuItems = async (restaurantId: string) => {
  const { addDoc, collection } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase');
  
  try {
    const menuItemsToAdd = sampleMenuItems.map(item => ({
      ...item,
      restaurantId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const promises = menuItemsToAdd.map(item => 
      addDoc(collection(db, 'menuItems'), item)
    );

    await Promise.all(promises);
    console.log(`Added ${menuItemsToAdd.length} sample menu items for restaurant ${restaurantId}`);
  } catch (error) {
    console.error('Error adding sample menu items:', error);
  }
}; 