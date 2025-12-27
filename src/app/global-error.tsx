'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Global Error Boundary - Catches errors in the root layout
 * This is the last line of defense for unhandled errors
 * Note: This must include its own <html> and <body> tags
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log critical error
        console.error('Critical application error:', error);

        // Send to error monitoring service
        // Example: Sentry.captureException(error, { level: 'fatal' });
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-gray-900 min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    {/* Critical Error Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                        <AlertOctagon className="w-14 h-14 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Critical Error
                    </h1>

                    {/* Description */}
                    <p className="text-gray-400 mb-8 text-lg">
                        The application encountered a critical error and needs to be restarted.
                        We apologize for the inconvenience.
                    </p>

                    {/* Error Details (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-8 text-left">
                            <p className="text-sm font-mono text-red-300 break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs font-mono text-red-500 mt-2">
                                    Digest: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Reset Button */}
                    <button
                        onClick={reset}
                        className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                        <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                        Restart Application
                    </button>

                    {/* Support Info */}
                    <p className="text-gray-500 mt-8 text-sm">
                        If this problem persists, please contact{' '}
                        <a
                            href="mailto:ganukalp70@gmail.com"
                            className="text-orange-500 hover:underline"
                        >
                            support
                        </a>
                    </p>
                </div>
            </body>
        </html>
    );
}
