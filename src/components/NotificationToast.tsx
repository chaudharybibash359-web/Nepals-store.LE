import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  X, 
  ExternalLink,
  Bell
} from 'lucide-react';
import { OrderNotification } from '../types';

interface NotificationToastProps {
  notification: OrderNotification | null;
  onClose: () => void;
  onOpenNotificationModal: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onOpenNotificationModal,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6500);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div 
        onClick={() => {
          onOpenNotificationModal();
          onClose();
        }}
        className="cursor-pointer bg-slate-900/95 backdrop-blur-md border border-orange-500/50 shadow-2xl rounded-2xl p-4 flex items-start gap-3 hover:border-orange-400 transition-all text-left group"
      >
        <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
          {notification.type === 'ORDER_DELIVERED' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : notification.type === 'UNIPOINTS_EARNED' ? (
            <Sparkles className="w-5 h-5 text-amber-400" />
          ) : (
            <Bell className="w-5 h-5 text-orange-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
              {notification.channel === 'gmail' ? '📧 Gmail Alert' : notification.channel === 'phone_sms' ? '📱 SMS Alert' : notification.channel === 'telegram' ? '✈️ Telegram Bot' : notification.channel === 'facebook' ? '🔵 FB Alert' : notification.channel === 'twitter' ? '🐦 TW Alert' : '⚡ UniPin Dispatch'}
            </span>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>

          <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-300 transition-colors mt-0.5 truncate">
            {notification.title}
          </h5>

          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-snug">
            {notification.message}
          </p>

          <div className="flex items-center gap-1 text-[11px] text-orange-400 font-bold mt-2">
            <span>Tap to open notification center</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
