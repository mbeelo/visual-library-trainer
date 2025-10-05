import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={20} className="text-orange-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-slate-800 border-green-500/30 text-white';
      case 'error':
        return 'bg-slate-800 border-red-500/30 text-white';
      case 'warning':
        return 'bg-slate-800 border-orange-500/30 text-white';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm ${getStyles()}`}>
        {getIcon()}
        <span className="font-medium text-sm">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-orange-400 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}