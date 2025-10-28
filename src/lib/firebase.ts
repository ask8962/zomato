// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrs0FykwcxJjO9thf81ultOoyCu1RGdZA",
  authDomain: "brandvibe-ind.firebaseapp.com",
  databaseURL: "https://brandvibe-ind-default-rtdb.firebaseio.com",
  projectId: "brandvibe-ind",
  storageBucket: "brandvibe-ind.firebasestorage.app",
  messagingSenderId: "832715215529",
  appId: "1:832715215529:web:399349aee5d6d9e50ccfb8",
  measurementId: "G-PLQ1N40K9G"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore (only in browser)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firebase persistence: Multiple tabs open, using online mode');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firebase persistence not supported in this browser');
    }
  });
}

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// RecaptchaVerifier for phone authentication
export const setupRecaptcha = (elementId: string) => {
  if (typeof window !== 'undefined') {
    return new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow phone authentication
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
      }
    });
  }
  return null;
};

export default app; 