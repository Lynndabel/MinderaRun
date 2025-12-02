import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export const EnhancedWalletConnection = () => {
  const { 
    isConnected, 
    accountId, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    isLoading, 
    error,
    clearError 
  } = useWallet();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      setIsOpen(false);
    } catch (err) {
      // Error is already handled in the context
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsOpen(false);
  };

  const copyToClipboard = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isConnected 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
        ) : isConnected ? (
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>{formatAddress(accountId || '')}</span>
          </div>
        ) : (
          'Connect Wallet'
        )}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {
          setIsOpen(false);
          clearError();
        }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {isConnected ? 'Account' : 'Connect Wallet'}
                  </Dialog.Title>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {isConnected ? (
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Connected with HashPack</p>
                          <div className="flex items-center mt-1">
                            <p className="font-mono text-sm">{accountId}</p>
                            <button 
                              onClick={copyToClipboard}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              title="Copy to clipboard"
                            >
                              {showCopied ? '✓' : '⎘'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Balance</p>
                        <p className="text-lg font-semibold">{balance} ℏ</p>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handleDisconnect}
                          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 mb-4">
                        Connect with your Hedera wallet to play Mindera Run and earn rewards.
                      </p>
                      
                      <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img 
                          src="/hashpack-logo.png" 
                          alt="HashPack" 
                          className="h-6 w-6 mr-2" 
                        />
                        Connect with HashPack
                      </button>
                      
                      <p className="mt-3 text-xs text-gray-500 text-center">
                        Don't have HashPack?{' '}
                        <a 
                          href="https://www.hashpack.app/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Download it here
                        </a>
                      </p>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
