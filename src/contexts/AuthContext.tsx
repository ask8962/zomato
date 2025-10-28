'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  ConfirmationResult,
  RecaptchaVerifier
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // FIXED: Admin role is now determined by user.role in database, not hardcoded email
  const ADMIN_EMAILS = ['ganukalp70@gmail.com']; // Temporary fallback for initial admin

  // Input validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Enhanced password validation
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            // Create user document if it doesn't exist
            const isInitialAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: sanitizeInput(firebaseUser.displayName || ''),
              role: isInitialAdmin ? 'admin' : 'customer',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Enhanced error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled');
      }
      
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
      } else {
        // Create user document if it doesn't exist
        const isInitialAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: sanitizeInput(firebaseUser.displayName || ''),
          role: isInitialAdmin ? 'admin' : 'customer',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        setUser(newUser);
      }
    } catch (error: any) {
      console.error('Sign in with Google error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups and try again');
      }
      
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    try {
      // Validate phone number format
      if (!phoneNumber || !/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
        throw new Error('Please enter a valid phone number with country code');
      }

      // Ensure phone number has country code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later');
      } else if (error.code === 'auth/quota-exceeded') {
        throw new Error('SMS quota exceeded. Please try again later or use email login');
      }
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      // Enhanced validation
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
      }

      if (!userData.name || userData.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      if (userData.phone && !/^\+?[0-9]{10,15}$/.test(userData.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      const isInitialAdmin = ADMIN_EMAILS.includes(email);
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: sanitizeInput(userData.name || ''),
        phone: userData.phone ? sanitizeInput(userData.phone) : undefined,
        address: userData.address ? sanitizeInput(userData.address) : undefined,
        role: isInitialAdmin ? 'admin' : (userData.role || 'customer'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Enhanced error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      }
      
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // FIXED: Admin check now uses database role instead of hardcoded email
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signInWithGoogle,
    signInWithPhone,
    signUp,
    resetPassword,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 