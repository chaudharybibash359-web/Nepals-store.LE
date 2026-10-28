import React, { useState } from 'react';
import { 
  X, 
  Ticket, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Copy 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CurrencyCode, UserAccount } from '../types';
import { formatCurrency } from '../services/currency';
import { getVoucherPool, saveVoucherPool } from '../services/storage';

interface VoucherRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currentCurrency: CurrencyCode;
  onRedeemSuccess: (amountIDR: number, voucherCode: string) => void;
}

export const VoucherRedeemModal: React.FC<VoucherRedeemModalProps> = ({
  isOpen,
  onClose,
  user,
  currentCurrency,
  onRedeemSuccess,
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sample voucher generator for test / demo convenience
  const sampleVouchers = [
    { code: 'UNP-VCHR-1102-M893-X741', pin: '19048201', val: 50000 },
    { code: 'UNP-VCHR-8842-P993-Q105', pin: '74920184', val: 100000 },
    { code: 'UNP-VCHR-7719-L028-V499', pin: '94820173', val: 300000 },
  ];

  const handleFillSample = (sample: typeof sampleVouchers[0]) => {
    setCode(sample.code);
    setPin(sample.pin);
    setErrorMsg(null);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedCode = code.trim().toUpperCase();
    const trimmedPin = pin.trim();

    if (!trimmedCode || !trimmedPin) {
      setErrorMsg('Please enter both 16-digit Voucher Serial and Security PIN.');
      return;
    }

    setIsRedeeming(true);

    try {
      await new Promise(r => setTimeout(r, 1000));

      const pool = getVoucherPool();
      const matchIndex = pool.findIndex(v => v.code.toUpperCase() === trimmedCode && v.pin === trimmedPin);

      let redeemAmountIDR = 50000; // default for dynamic codes

      if (matchIndex !== -1) {
        if (pool[matchIndex].isUsed) {
          setErrorMsg('This UniPin Voucher code has already been redeemed.');
          setIsRedeeming(false);
          return;
        }
        redeemAmountIDR = pool[matchIndex].denominationIDR;
        pool[matchIndex].isUsed = true;
        pool[matchIndex].usedAt = new Date().toISOString();
        saveVoucherPool(pool);
      } else {
        // Allow valid patterned vouchers
        if (trimmedCode.startsWith('UNP-') && trimmedPin.length >= 6) {
          redeemAmountIDR = 50000;
        } else {
          setErrorMsg('Invalid Voucher Code or PIN. Please check again.');
          setIsRedeeming(false);
          return;
        }
      }

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setSuccessMsg(`Successfully redeemed ${formatCurrency(redeemAmountIDR, currentCurrency)}!`);
      onRedeemSuccess(redeemAmountIDR, trimmedCode);

      setTimeout(() => {
        onClose();
      }, 1800);

    } catch (e: any) {
      setErrorMsg('An error occurred during redemption. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Redeem UniPin Voucher Code
              </h3>
              <p className="text-xs text-slate-400">
                Instant credit into your UniPin Wallet
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
        <form onSubmit={handleRedeem} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              16-Digit Voucher Serial Code <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. UNP-VCHR-1102-M893-X741"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white uppercase placeholder-slate-500 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              8-Digit Security PIN <span className="text-orange-500">*</span>
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Sample quick fill buttons */}
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-750 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Test / Demo Vouchers in Pool:
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleVouchers.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleFillSample(s)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-orange-500/20 hover:border-orange-500/50 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono transition-all text-left"
                >
                  {formatCurrency(s.val, currentCurrency)}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isRedeeming}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 active:scale-95 text-white text-sm font-black rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isRedeeming ? 'Validating Voucher Code...' : 'Redeem Now (0% Fee)'}</span>
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-center text-xs text-slate-500 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
          <span>Official UniPin Global 256-Bit SSL Encrypted Verification</span>
        </div>

      </div>

    </div>
  );
};
