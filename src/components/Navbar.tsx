'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ShoppingCart, User, LogOut, Settings, Bell, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (_error) {
      toast.error('Failed to logout');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav aria-label="Primary" className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-2xl border-b border-orange-100' 
        : 'bg-white shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                  FoodExpress
                </span>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" label="Home" />
            <NavLink href="/restaurants" label="Restaurants" />
            <NavLink href="/about" label="About" />
            <NavLink href="/contact" label="Contact" />
            <NavLink href="/help" label="Help" />
            
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <NavLink href="/cart" label="Cart" icon={ShoppingCart} />
                    <NavLink href="/favorites" label="Favorites" icon={Heart} />
                    <NavLink href="/orders" label="Orders" />
                  </>
                )}
                
                {user.role === 'shopkeeper' && (
                  <NavLink href="/shopkeeper" label="Dashboard" icon={Settings} />
                )}
                
                {user.role === 'delivery' && (
                  <NavLink href="/delivery" label="Deliveries" icon={Settings} />
                )}
                
                {isAdmin && (
                  <NavLink href="/admin" label="Admin" icon={Settings} />
                )}

                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                  {/* Notification Bell */}
                  <button className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 group">
                    <Bell className="w-5 h-5 group-hover:animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  </button>

                  {/* User Profile */}
                  <Link href="/profile" className="flex items-center space-x-2 p-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{user.name || 'Profile'}</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium rounded-xl hover:bg-orange-50 transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary animate-pulse-glow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              className="p-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 transform rotate-180 transition-transform duration-300" />
              ) : (
                <Menu className="w-6 h-6 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div 
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen 
              ? 'max-h-screen opacity-100 pb-4' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-2 pt-2 space-y-1 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl mt-2 border border-orange-100">
            <MobileNavLink href="/" label="Home" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink href="/restaurants" label="Restaurants" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink href="/about" label="About" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink href="/contact" label="Contact" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink href="/help" label="Help" onClick={() => setIsMenuOpen(false)} />

            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <MobileNavLink href="/cart" label="Cart" icon={ShoppingCart} onClick={() => setIsMenuOpen(false)} />
                    <MobileNavLink href="/favorites" label="Favorites" icon={Heart} onClick={() => setIsMenuOpen(false)} />
                    <MobileNavLink href="/orders" label="My Orders" onClick={() => setIsMenuOpen(false)} />
                  </>
                )}
                
                {user.role === 'shopkeeper' && (
                  <MobileNavLink href="/shopkeeper" label="Dashboard" icon={Settings} onClick={() => setIsMenuOpen(false)} />
                )}
                
                {user.role === 'delivery' && (
                  <MobileNavLink href="/delivery" label="Deliveries" icon={Settings} onClick={() => setIsMenuOpen(false)} />
                )}
                
                {isAdmin && (
                  <MobileNavLink href="/admin" label="Admin Panel" icon={Settings} onClick={() => setIsMenuOpen(false)} />
                )}

                <div className="border-t border-orange-200 pt-2 mt-2">
                  <MobileNavLink href="/profile" label="Profile" icon={User} onClick={() => setIsMenuOpen(false)} />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-orange-200 pt-2 mt-2 space-y-2">
                <Link
                  href="/auth/login"
                  className="block px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-100 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Enhanced NavLink Component
interface NavLinkProps {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon }) => {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 font-medium group"
    >
      {Icon && <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
      <span>{label}</span>
    </Link>
  );
};

// Enhanced Mobile NavLink Component
interface MobileNavLinkProps {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ href, label, icon: Icon, onClick }) => {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-100 rounded-xl transition-all duration-300 font-medium"
      onClick={onClick}
    >
      {Icon && <Icon className="w-5 h-5 mr-3" />}
      {label}
    </Link>
  );
};

export default Navbar; 