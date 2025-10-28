import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading delicious food...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Animated Food Icons */}
        <div className="relative mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                🍕
              </div>
            </div>
            <div className="animate-bounce" style={{ animationDelay: '150ms' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                🍔
              </div>
            </div>
            <div className="animate-bounce" style={{ animationDelay: '300ms' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                🍜
              </div>
            </div>
          </div>
          
          {/* Main Spinner */}
          <div className={`${sizeClasses[size]} mx-auto relative`}>
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-orange-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-red-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-800 animate-pulse">{message}</h3>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 