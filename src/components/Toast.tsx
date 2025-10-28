import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setIsVisible(true);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      progressColor: 'bg-green-500'
    },
    error: {
      icon: XCircle,
      bgColor: 'from-red-500 to-pink-500',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      progressColor: 'bg-red-500'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      progressColor: 'bg-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'from-blue-500 to-indigo-500',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      progressColor: 'bg-blue-500'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl border-2 ${config.borderColor} overflow-hidden max-w-sm animate-slide-in-up`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.bgColor} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg">{title}</h4>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {message && (
          <div className="p-4">
            <p className={`${config.textColor} leading-relaxed`}>{message}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>;
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(${index * 10}px)` }}
        >
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast; 