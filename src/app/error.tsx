'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);

        // You can integrate with services like Sentry, LogRocket, etc.
        // Example: Sentry.captureException(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full">
                {/* Error Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-red-100">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <AlertTriangle className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Oops! Something went wrong
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We encountered an unexpected error. Don't worry, our team has been notified
                        and we're working on fixing it.
                    </p>

                    {/* Error Details (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm font-mono text-red-800 break-all">
                                <strong>Error:</strong> {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs font-mono text-red-600 mt-2">
                                    <strong>Digest:</strong> {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={reset}
                            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            Try Again
                        </button>

                        <Link
                            href="/"
                            className="group flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                        >
                            <Home className="w-5 h-5" />
                            Go Home
                        </Link>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="mt-6 text-gray-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back to previous page
                    </button>
                </div>

                {/* Support Link */}
                <p className="text-center text-gray-500 mt-6 text-sm">
                    Need help?{' '}
                    <Link href="/contact" className="text-orange-600 hover:underline font-medium">
                        Contact Support
                    </Link>
                </p>
            </div>
        </div>
    );
}
