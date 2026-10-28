import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  FileText,
  Mail,
  Send,
  Phone,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { OrderItem, CurrencyCode, NotificationChannel } from '../types';
import { formatCurrency } from '../services/currency';
import confetti from 'canvas-confetti';

interface LiveOrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem | null;
  currentCurrency: CurrencyCode;
  onCompleteDelivery: (orderId: string) => void;
  onViewReceipt: (order: OrderItem) => void;
}

export const LiveOrderTrackerModal: React.FC<LiveOrderTrackerModalProps> = ({
  isOpen,
  onClose,
  order,
  currentCurrency,
  onCompleteDelivery,
  onViewReceipt,
}) => {
  if (!isOpen || !order) return null;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return order.status === 'COMPLETED' ? 0 : 150; // 2.5 minutes standard SLA
  });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    return order.status === 'COMPLETED' ? 4 : 1;
  });
  const [isDelivered, setIsDelivered] = useState<boolean>(order.status === 'COMPLETED');

  // Multi-step delivery stages
  const deliverySteps = [
    { title: 'Payment Confirmed', desc: 'Gateway transaction verified & secured' },
    { title: 'Publisher API Handshake', desc: `Connected to ${order.gameTitle} server gateway` },
    { title: 'Player ID & IGN Validation', desc: `Validated recipient: ${order.ignValidated || order.userId}` },
    { title: 'Item Direct Injection', desc: `Injecting ${order.denominationName}` },
    { title: 'Order Dispatched & Delivered', desc: 'Receipts & alerts sent to Gmail, SMS, Telegram, FB, TW' },
  ];

  useEffect(() => {
    if (order.status === 'COMPLETED') {
      setIsDelivered(true);
      setCurrentStepIndex(4);
      setSecondsRemaining(0);
      return;
    }

    // Timer interval
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsDelivered(true);
          setCurrentStepIndex(4);
          onCompleteDelivery(order.id);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
          return 0;
        }

        // Advance steps dynamically based on remaining time
        if (prev <= 30) setCurrentStepIndex(3);
        else if (prev <= 70) setCurrentStepIndex(2);
        else if (prev <= 120) setCurrentStepIndex(1);

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order.id, order.status, onCompleteDelivery]);

  // Fast forward test delivery
  const handleFastForward = () => {
    setSecondsRemaining(0);
    setIsDelivered(true);
    setCurrentStepIndex(4);
    onCompleteDelivery(order.id);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const progressPercent = isDelivered 
    ? 100 
    : Math.min(95, Math.round(((150 - secondsRemaining) / 150) * 100));

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
              isDelivered 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-orange-500/20 text-orange-400'
            }`}>
              {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-spin" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isDelivered ? 'Order Delivered Successfully!' : 'Live Order Delivery Tracker'}
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  isDelivered 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                }`}>
                  {isDelivered ? 'DELIVERED (0s SLA)' : 'PROCESSING (2-3 MIN SLA)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Order #{order.orderNumber} • {order.gameTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Main Status & Countdown Banner */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDelivered 
              ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/40' 
              : 'bg-gradient-to-br from-orange-950/30 to-slate-900 border-orange-500/30'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-xs text-slate-400">
                  {isDelivered ? 'Fulfillment Status:' : 'Estimated Delivery Time Remaining:'}
                </div>
                <div className={`text-2xl sm:text-3xl font-black ${
                  isDelivered ? 'text-emerald-400' : 'text-orange-400 font-mono'
                }`}>
                  {isDelivered ? '100% Complete & Delivered' : formattedTime}
                </div>
              </div>

              {!isDelivered && (
                <button
                  onClick={handleFastForward}
                  className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                  title="Accelerate delivery to instant for testing"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fast-Forward (Instant)</span>
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isDelivered 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
              <span>Progress: {progressPercent}%</span>
              <span>Direct Game API Injection</span>
            </div>
          </div>

          {/* Delivery Steps Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Automated Fulfillment Pipeline (2-3 Min)
            </h4>

            <div className="space-y-2.5">
              {deliverySteps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex && !isDelivered;

                return (
                  <div
                    key={step.title}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      isPassed
                        ? isDelivered || idx < currentStepIndex
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : 'bg-orange-500/10 border-orange-500/40 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isPassed && (isDelivered || idx < currentStepIndex) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <RotateCw className="w-4 h-4 text-orange-400 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 text-[10px] flex items-center justify-center font-mono text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isPassed ? 'text-white' : 'text-slate-400'}`}>
                          {step.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-orange-400 font-bold bg-orange-500/20 px-2 py-0.5 rounded-md animate-pulse">
                            IN PROGRESS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipient & Dispatched Channels Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Order Completion Alerts Dispatched To:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-red-400" /> Gmail Recipient
                </span>
                <span className="text-slate-200 font-medium truncate block">
                  {order.customerEmail}
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> SMS Phone Number
                </span>
                <span className="text-slate-200 font-medium block">
                  {order.customerPhone || '+977 9801234567'}
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <Send className="w-3 h-3 text-sky-400" /> Telegram Bot ID
                </span>
                <span className="text-slate-200 font-medium block">
                  {order.customerTelegram || '@bibash_gamer'}
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" /> Facebook / Twitter
                </span>
                <span className="text-slate-200 font-medium block">
                  {order.customerTwitter || '@bibash_c (Verified)'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onViewReceipt(order);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-orange-400" />
            <span>View Full E-Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-xs font-bold text-white rounded-xl shadow-lg transition-all"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
};
