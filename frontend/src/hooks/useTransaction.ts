"use client";

import { useState } from 'react';

type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export function useTransaction() {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const startTransaction = () => {
    setStatus('pending');
    setError(null);
    setTxHash(null);
  };

  const onSuccess = (hash: string) => {
    setStatus('success');
    setTxHash(hash);
  };

  const onError = (err: Error) => {
    console.error('Transaction error:', err);
    setStatus('error');
    setError(err);
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setTxHash(null);
  };

  return {
    status,
    error,
    txHash,
    startTransaction,
    onSuccess,
    onError,
    reset,
    isIdle: status === 'idle',
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
