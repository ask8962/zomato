'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Lock, ArrowLeft, Shield } from 'lucide-react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, setupRecaptcha } from '@/lib/firebase';
import toast from 'react-hot-toast';

const PhoneLoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  
  const { signInWithPhone } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initialize reCAPTCHA on component mount
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      try {
        const verifier = setupRecaptcha('recaptcha-container');
        if (verifier) {
          setRecaptchaVerifier(verifier);
        }
      } catch (error) {
        console.error('Error setting up reCAPTCHA:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (error) {
          console.error('Error clearing reCAPTCHA:', error);
        }
      }
    };
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!/^[0-9]{10}$/.test(cleanPhone) && !/^\+91[0-9]{10}$/.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    if (!recaptchaVerifier) {
      toast.error('reCAPTCHA not initialized. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
      const result = await signInWithPhone(formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent successfully! Check your phone.');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
      
      // Recreate reCAPTCHA on error
      try {
        const verifier = setupRecaptcha('recaptcha-container');
        if (verifier) {
          setRecaptchaVerifier(verifier);
        }
      } catch (recaptchaError) {
        console.error('Error recreating reCAPTCHA:', recaptchaError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    if (!confirmationResult) {
      toast.error('Session expired. Please request a new OTP.');
      setStep('phone');
      return;
    }

    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        const newUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          phone: firebaseUser.phoneNumber || phoneNumber,
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      }

      toast.success('Logged in successfully!');
      router.push('/');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        toast.error('OTP expired. Please request a new one.');
        setStep('phone');
      } else {
        toast.error('Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setStep('phone');
    toast.success('You can now request a new OTP');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-orange-600">
            FoodExpress
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in with Phone Number
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Fast and secure login with OTP verification
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'phone' ? (
            /* Phone Number Entry */
            <form className="space-y-6" onSubmit={handleSendOTP}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                    <span className="text-gray-500">+91</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={10}
                    className="appearance-none block w-full pl-20 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Enter 10-digit number"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  We'll send you a 6-digit OTP to verify your number
                </p>
              </div>

              {/* reCAPTCHA container */}
              <div id="recaptcha-container"></div>

              <div>
                <button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </span>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* OTP Verification */
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-center text-2xl tracking-widest font-bold"
                    placeholder="000000"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  OTP sent to +91 {phoneNumber}
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <Shield className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Secure Authentication</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Your phone number is encrypted and will never be shared with third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/auth/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Email Login
              </Link>
              <Link
                href="/auth/register"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneLoginPage;

