import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Zap, 
  CreditCard,
  Building2,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CurrencyCode, PaymentMethod, UserAccount } from '../types';
import { formatCurrency, convertFromIDR } from '../services/currency';

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currentCurrency: CurrencyCode;
  paymentMethods: PaymentMethod[];
  onTopUpSuccess: (amountIDR: number) => void;
}

export const WalletTopUpModal: React.FC<WalletTopUpModalProps> = ({
  isOpen,
  onClose,
  user,
  currentCurrency,
  paymentMethods,
  onTopUpSuccess,
}) => {
  if (!isOpen) return null;

  const presetAmountsIDR = [20000, 50000, 100000, 250000, 500000, 1000000, 2000000];
  const [selectedAmountIDR, setSelectedAmountIDR] = useState<number>(100000);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    paymentMethods.find(p => p.id === 'qris') || paymentMethods[0] || null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmTopUp = async () => {
    if (!selectedAmountIDR) return;
    setIsProcessing(true);

    try {
      await new Promise(r => setTimeout(r, 1200));

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      onTopUpSuccess(selectedAmountIDR);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Top Up UniPin Credits (UC)
              </h3>
              <p className="text-xs text-slate-400">
                0% Admin Fee on All Game Checkouts
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Current Balance Banner */}
          <div className="bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-slate-900 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300 font-medium">Current Available Balance</div>
              <div className="text-xl font-black text-emerald-400">
                {formatCurrency(user.unipinCreditsIDR, currentCurrency)}
              </div>
            </div>
            <div className="text-right text-xs text-amber-400 font-semibold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              VIP Tier: {user.vipTier}
            </div>
          </div>

          {/* Preset Denominations */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Select Reload Denomination:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {presetAmountsIDR.map((amount) => {
                const isSelected = selectedAmountIDR === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSelectedAmountIDR(amount)}
                    className={`p-3 rounded-xl text-center border font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 ring-2 ring-orange-500/30'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-750'
                    }`}
                  >
                    <div>{formatCurrency(amount, currentCurrency)}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {(amount / 1000).toLocaleString()} UC
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300">
                Payment Channel:
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">0% Top Up Fee</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {paymentMethods.filter(p => p.id !== 'unipin-credits' && p.id !== 'unipin-voucher-pay').map((pm) => {
                const isSelected = selectedPayment?.id === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPayment(pm)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500 ring-2 ring-orange-500/30'
                        : 'bg-slate-850 hover:bg-slate-800 border-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{pm.logo}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{pm.name}</span>
                          {pm.badge && (
                            <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[9px] font-black px-1.5 py-0.2 rounded">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{pm.instructionText}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total to Charge:</span>
            <span className="text-base font-black text-emerald-400">
              {formatCurrency(selectedAmountIDR, currentCurrency)}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmTopUp}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Reload...' : 'Instant Top-Up'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
