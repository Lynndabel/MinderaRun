"use client";

import React, { useEffect, useState } from "react";

type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

interface TransactionStatusProps {
  status: TransactionStatus;
  successMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onClose?: () => void;
  txHash?: string;
}

export function TransactionStatus({
  status,
  successMessage = 'Transaction completed successfully!',
  errorMessage = 'Transaction failed. Please try again.',
  onRetry,
  onClose,
  txHash
}: TransactionStatusProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status !== 'idle') {
      setIsVisible(true);
    }
  }, [status]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const getExplorerUrl = (): string | undefined => {
    if (!txHash) return undefined;
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    return `https://hashscan.io/${network}/transaction/${txHash}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {status === 'pending' && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              )}
              {status === 'success' && (
                <div className="h-5 w-5 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="h-5 w-5 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">
                {status === 'pending' && 'Transaction in progress...'}
                {status === 'success' && 'Success!'}
                {status === 'error' && 'Error'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {status === 'pending' && 'Please wait while we process your transaction.'}
                {status === 'success' && successMessage}
                {status === 'error' && errorMessage}
              </p>
              
              {txHash && status === 'success' && (
                <p className="mt-2 text-xs">
                  <a 
                    href={getExplorerUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Hashscan
                  </a>
                </p>
              )}
              
              <div className="mt-3 flex space-x-4">
                {status === 'error' && onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {status === 'pending' && (
          <div className="w-full bg-gray-200 h-1">
            <div className="bg-blue-600 h-1 w-3/4 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}
