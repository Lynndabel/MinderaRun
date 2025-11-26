'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="nes-container with-title is-centered pixel-art max-w-md w-full mx-4"
          style={{ backgroundColor: 'white' }}
        >
          <p className="title pixel-font text-primary">{title}</p>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
            <p className="text-sm text-gray-700 text-center whitespace-pre-line">{message}</p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="nes-btn flex-1"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="nes-btn is-primary flex-1"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

