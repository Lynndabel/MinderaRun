'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface GameNotificationProps {
  notification: Notification | null;
  onClose: () => void;
}

export function GameNotification({ notification, onClose }: GameNotificationProps) {
  useEffect(() => {
    if (notification) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-600/90 border-green-500',
    error: 'bg-red-600/90 border-red-500',
    warning: 'bg-yellow-600/90 border-yellow-500',
    info: 'bg-blue-600/90 border-blue-500',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.3, type: 'spring' }}
        className={`fixed top-4 right-4 z-50 max-w-md ${colors[notification.type]} border-2 rounded-lg shadow-2xl backdrop-blur-sm`}
      >
        <div className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0 text-white mt-0.5">
            {icons[notification.type]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm mb-1">{notification.title}</h3>
            <p className="text-white/90 text-xs whitespace-pre-line">{notification.message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

