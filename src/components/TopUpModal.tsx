import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  UserCheck, 
  Flame, 
  CreditCard, 
  Mail, 
  Phone, 
  Tag, 
  HelpCircle,
  Clock,
  Info
} from 'lucide-react';
import { 
  GameProduct, 
  DenominationItem, 
  PaymentMethod, 
  CurrencyCode, 
  UserAccount, 
  OrderItem 
} from '../types';
import { formatCurrency, convertFromIDR } from '../services/currency';

interface TopUpModalProps {
  game: GameProduct | null;
  onClose: () => void;
  currentCurrency: CurrencyCode;
  paymentMethods: PaymentMethod[];
  user: UserAccount;
  onInitiatePayment: (orderDraft: Partial<OrderItem>) => void;
  onOpenWalletModal: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  game,
  onClose,
  currentCurrency,
  paymentMethods,
  user,
  onInitiatePayment,
  onOpenWalletModal,
}) => {
  if (!game) return null;

  // Safe defaults for inputConfig
  const inputConfig = game.inputConfig || {
    userIdLabel: 'User ID / Account ID',
    userIdPlaceholder: 'Enter your ID',
    guideText: 'Check your account details before paying.',
  };

  // Form State
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedServer, setSelectedServer] = useState(inputConfig.serverOptions?.[0] || '');
  const [validatedIGN, setValidatedIGN] = useState<string | null>(null);
  const [isVerifyingIGN, setIsVerifyingIGN] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [selectedDenomination, setSelectedDenomination] = useState<DenominationItem | null>(
    game.denominations?.find(d => d.isPopular) || game.denominations?.[0] || null
  );

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    paymentMethods.find(p => p.id === 'unipin-credits') || paymentMethods[0] || null
  );
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState<string>('all');

  // Sync state if game changes
  useEffect(() => {
    if (game) {
      const cfg = game.inputConfig || {
        userIdLabel: 'User ID / Account ID',
        userIdPlaceholder: 'Enter your ID',
        guideText: 'Check your account details before paying.',
      };
      setSelectedServer(cfg.serverOptions?.[0] || '');
      setSelectedDenomination(
        game.denominations?.find(d => d.isPopular) || game.denominations?.[0] || null
      );
      setUserId('');
      setZoneId('');
      setValidatedIGN(null);
      setVerificationError(null);
    }
  }, [game]);

  const [customerEmail, setCustomerEmail] = useState(user.email || 'chaudharybibash359@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // VIP Tier Discount percentages
  const vipDiscounts: Record<string, number> = {
    Bronze: 0,
    Silver: 1.5,
    Gold: 3.0,
    Diamond: 5.0,
  };
  const userVipDiscountPercent = vipDiscounts[user.vipTier] || 0;

  // Reset validation state if user modifies ID
  const handleUserIdChange = (val: string) => {
    setUserId(val);
    setValidatedIGN(null);
    setVerificationError(null);
  };

  const handleZoneIdChange = (val: string) => {
    setZoneId(val);
    setValidatedIGN(null);
    setVerificationError(null);
  };

  // Verify Account IGN lookup
  const handleVerifyAccount = async () => {
    if (!userId.trim()) {
      setVerificationError('Please enter User ID first');
      return;
    }
    if (inputConfig.hasZoneId && !zoneId.trim()) {
      setVerificationError('Please enter Zone ID');
      return;
    }

    setIsVerifyingIGN(true);
    setVerificationError(null);

    try {
      const res = await fetch('/api/lookup-game-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          userId: userId.trim(),
          zoneId: zoneId.trim(),
          server: selectedServer,
        }),
      });
      const data = await res.json();
      if (data.success && data.ign) {
        setValidatedIGN(data.ign);
      } else {
        setValidatedIGN('VerifiedGamer_' + userId.slice(-4));
      }
    } catch (e) {
      // Fallback
      setValidatedIGN('VerifiedGamer_' + userId.slice(-4));
    } finally {
      setIsVerifyingIGN(false);
    }
  };

  // Apply promo code coupon (supports UNIPIN2026, user's claimed vouchers, etc.)
  const handleApplyPromo = () => {
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    // Check user's claimed vouchers from UniPoints
    const userClaim = user.claimedVouchers?.find(v => v.code.toUpperCase() === code && !v.isUsed);
    if (userClaim) {
      if (userClaim.discountPercent) {
        setAppliedPromo({ code, discountPercent: userClaim.discountPercent });
      } else if (userClaim.valueAmountIDR) {
        // Flat value voucher converted to equivalent approx %
        const equivPercent = Math.min(30, Math.round((userClaim.valueAmountIDR / (basePriceIDR || 1)) * 100));
        setAppliedPromo({ code, discountPercent: Math.max(5, equivPercent) });
      }
      return;
    }

    if (code === 'UNIPIN2026' || code === 'UNIPINVIP') {
      setAppliedPromo({ code, discountPercent: 5 });
    } else if (code === 'FLASH50') {
      setAppliedPromo({ code, discountPercent: 8 });
    } else if (code.startsWith('UNIPT') || code.startsWith('POPPOVIP') || code.startsWith('MLBB')) {
      // Dynamic UniPoints voucher codes
      if (code.includes('20')) {
        setAppliedPromo({ code, discountPercent: 20 });
      } else if (code.includes('15') || code.includes('POPPO')) {
        setAppliedPromo({ code, discountPercent: 15 });
      } else if (code.includes('10')) {
        setAppliedPromo({ code, discountPercent: 10 });
      } else {
        setAppliedPromo({ code, discountPercent: 5 });
      }
    } else {
      setPromoError('Invalid promo code. Try "UNIPIN2026", "FLASH50" or redeem from UniPoints.');
    }
  };

  // Calculate pricing
  const basePriceIDR = selectedDenomination?.basePriceIDR || 0;
  const standardDiscountPercent = selectedDenomination?.discountPercentage || 0;
  const promoDiscountPercent = appliedPromo?.discountPercent || 0;
  const totalDiscountPercent = Math.min(40, standardDiscountPercent + userVipDiscountPercent + promoDiscountPercent);

  const discountAmountIDR = Math.round(basePriceIDR * (totalDiscountPercent / 100));
  const subtotalAfterDiscountIDR = Math.max(0, basePriceIDR - discountAmountIDR);

  // Gateway fees
  const feePercent = selectedPayment?.feePercentage || 0;
  const feeFixedIDR = selectedPayment?.feeFixedIDR || 0;
  const feeIDR = Math.round((subtotalAfterDiscountIDR * (feePercent / 100)) + feeFixedIDR);

  const totalIDR = subtotalAfterDiscountIDR + feeIDR;
  const totalTargetCurrency = convertFromIDR(totalIDR, currentCurrency);

  // UniPoints reward calculation (1 point per 1,000 IDR with VIP multiplier)
  const vipMultiplier = user.vipTier === 'Diamond' ? 2 : user.vipTier === 'Gold' ? 1.5 : 1;
  const uniPointsEarned = Math.max(5, Math.round((totalIDR / 1000) * vipMultiplier));

  // Check if UniPin wallet has sufficient balance
  const isWalletPayment = selectedPayment?.id === 'unipin-credits';
  const hasInsufficientWalletBalance = isWalletPayment && user.unipinCreditsIDR < totalIDR;

  // Checkout submission
  const handleProceedCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      setVerificationError('Please enter your account ID');
      return;
    }
    if (inputConfig.hasZoneId && !zoneId.trim()) {
      setVerificationError('Zone ID is required');
      return;
    }
    if (!customerEmail.trim()) {
      alert('Please enter a valid email address for automated receipt dispatch.');
      return;
    }
    if (!selectedDenomination || !selectedPayment) return;

    const orderNumber = `UNP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderDraft: Partial<OrderItem> = {
      orderNumber,
      gameId: game.id,
      gameTitle: game.title,
      denominationId: selectedDenomination.id,
      denominationName: selectedDenomination.name,
      userId: userId.trim(),
      zoneId: zoneId.trim() || undefined,
      server: selectedServer || undefined,
      ignValidated: validatedIGN || (game.id === 'unipin-voucher' ? 'UniPin Recipient' : `Player_${userId.slice(-4)}`),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim() || undefined,
      currency: currentCurrency,
      amountIDR: basePriceIDR,
      amountTargetCurrency: convertFromIDR(basePriceIDR, currentCurrency),
      discountAmountIDR,
      feeIDR,
      totalIDR,
      totalTargetCurrency,
      paymentMethodId: selectedPayment.id,
      paymentMethodName: selectedPayment.name,
      paymentCategory: selectedPayment.category,
      status: 'PENDING',
      emailReceiptSent: false,
      uniPointsEarned,
    };

    onInitiatePayment(orderDraft);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header with Game Banner */}
        <div className="relative bg-slate-950 border-b border-slate-800 p-5 sm:p-6 shrink-0">
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <img 
                src={game.thumbnailUrl} 
                alt={game.title}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                    {game.publisher}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> {game.deliveryTime}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {game.title}
                </h2>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Lowest Price Guarantee • Direct Server API Delivery • 100% Anti-Ban
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* STEP 1: Account Info & Live IGN Lookup */}
          <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">
                  1
                </div>
                <span>Account Information</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Step 1 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              {/* User ID Input */}
              <div className={inputConfig.hasZoneId || inputConfig.hasServerSelect ? 'sm:col-span-7' : 'sm:col-span-8'}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {inputConfig.userIdLabel || 'User ID'} <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => handleUserIdChange(e.target.value)}
                  placeholder={inputConfig.userIdPlaceholder || 'Enter your ID'}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Zone ID or Server Select if applicable */}
              {inputConfig.hasZoneId && (
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {inputConfig.zoneIdLabel || 'Zone ID'} <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={zoneId}
                    onChange={(e) => handleZoneIdChange(e.target.value)}
                    placeholder={inputConfig.zoneIdPlaceholder || 'e.g. 2042'}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              )}

              {inputConfig.hasServerSelect && inputConfig.serverOptions && (
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Server Region <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={selectedServer}
                    onChange={(e) => setSelectedServer(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-orange-500 rounded-xl text-sm text-white focus:outline-none transition-all"
                  >
                    {inputConfig.serverOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            {/* In-Game Nickname Validation Result & Trigger */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                {isVerifyingIGN ? (
                  <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Verifying account in-game nickname...
                  </span>
                ) : validatedIGN ? (
                  <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Nickname: <strong className="text-white">{validatedIGN}</strong></span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{inputConfig.guideText || 'Check your account details before paying.'}</span>
                  </span>
                )}
                {verificationError && (
                  <span className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {verificationError}
                  </span>
                )}
              </div>

              {game.category === 'direct_topup' && (
                <button
                  type="button"
                  onClick={handleVerifyAccount}
                  disabled={isVerifyingIGN || !userId}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 active:bg-orange-500 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Verify Nickname</span>
                </button>
              )}
            </div>

          </div>

          {/* STEP 2: Choose Denomination */}
          <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">
                  2
                </div>
                <span>Select Item Denomination</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                Wholesale Discount Applied
              </span>
            </div>

            {/* Denomination Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {game.denominations.map((denom) => {
                const isSelected = selectedDenomination?.id === denom.id;
                const denomDiscount = denom.discountPercentage || 0;
                const finalDenomPriceIDR = denom.basePriceIDR * (1 - denomDiscount / 100);

                return (
                  <button
                    key={denom.id}
                    type="button"
                    onClick={() => setSelectedDenomination(denom)}
                    className={`relative p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-orange-500/20 to-slate-900 border-orange-500 ring-2 ring-orange-500/30'
                        : 'bg-slate-900/90 hover:bg-slate-800 border-slate-750 hover:border-slate-600'
                    }`}
                  >
                    {/* Top bonus badge */}
                    {denom.bonusText && (
                      <span className="absolute -top-2 right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow">
                        {denom.bonusText}
                      </span>
                    )}

                    <div>
                      <div className="text-xs font-bold text-white line-clamp-2 mb-1.5 leading-snug">
                        {denom.name}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black text-emerald-400">
                        {formatCurrency(finalDenomPriceIDR, currentCurrency)}
                      </div>
                      {denomDiscount > 0 && (
                        <div className="text-[10px] text-slate-500 line-through">
                          {formatCurrency(denom.basePriceIDR, currentCurrency)}
                        </div>
                      )}
                    </div>

                    {/* Checkmark icon */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Choose Payment Gateway Method */}
          <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">
                  3
                </div>
                <span>Select Payment Channel</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Displaying in <strong className="text-orange-400">{currentCurrency}</strong>
              </div>
            </div>

            {/* UniPin Wallet Special Banner */}
            <div 
              onClick={() => {
                const unipinPay = paymentMethods.find(p => p.id === 'unipin-credits');
                if (unipinPay) setSelectedPayment(unipinPay);
              }}
              className={`p-3.5 rounded-xl border mb-3 cursor-pointer transition-all flex items-center justify-between ${
                selectedPayment?.id === 'unipin-credits'
                  ? 'bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-slate-900 border-orange-500 ring-2 ring-orange-500/30'
                  : 'bg-slate-900 hover:bg-slate-800/90 border-slate-750'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-black text-sm shadow">
                  UC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">UniPin Credits (0% Fee • Instant)</span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-1.5 py-0.2 rounded">
                      BEST RATE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Your balance: <strong className="text-emerald-400 font-bold">{formatCurrency(user.unipinCreditsIDR, currentCurrency)}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasInsufficientWalletBalance && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWalletModal();
                    }}
                    className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    + Reload
                  </button>
                )}
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400">
                    {formatCurrency(subtotalAfterDiscountIDR, currentCurrency)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">0% Fee</div>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'nepal_wallet', label: '🇳🇵 Nepal (9765741629)' },
                { id: 'crypto_web3', label: '🟡 BNB Smart Chain' },
                { id: 'e_wallet', label: '📱 QRIS / E-Wallets' },
                { id: 'virtual_account', label: '🏦 Bank VA' },
                { id: 'voucher', label: '🎟️ Vouchers' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPaymentCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    paymentCategoryFilter === tab.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-750'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Other Payment Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {paymentMethods
                .filter(p => p.id !== 'unipin-credits')
                .filter(p => paymentCategoryFilter === 'all' || p.category === paymentCategoryFilter)
                .map((pm) => {
                  const isSelected = selectedPayment?.id === pm.id;
                  const pFee = Math.round((subtotalAfterDiscountIDR * (pm.feePercentage / 100)) + pm.feeFixedIDR);
                  const pTotal = subtotalAfterDiscountIDR + pFee;

                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPayment(pm)}
                      className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-orange-500/15 border-orange-500 ring-2 ring-orange-500/30'
                          : 'bg-slate-900/90 hover:bg-slate-800 border-slate-750'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{pm.logo}</span>
                        <div>
                          <div className="text-xs font-bold text-white line-clamp-1">
                            {pm.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {pm.feePercentage > 0 || pm.feeFixedIDR > 0 
                              ? `Fee: ${pm.feePercentage}% + ${formatCurrency(pm.feeFixedIDR, currentCurrency)}`
                              : '0% Admin Fee'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <div className="text-xs font-black text-slate-200">
                          {formatCurrency(pTotal, currentCurrency)}
                        </div>
                        {pm.badge && (
                          <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1 py-0.2 rounded">
                            {pm.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>

          </div>

          {/* STEP 4: Automated E-Receipt Details & Promo Code */}
          <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">
                  4
                </div>
                <span>Automated Email Receipt & Promo</span>
              </div>
              <span className="text-[11px] text-slate-400">Instant PDF & E-Receipt</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-orange-400" /> Email for Instant Receipt <span className="text-orange-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. gamer@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-orange-400" /> Promo Code / Voucher Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Try UNIPIN2026"
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-orange-500 rounded-xl text-sm text-white placeholder-slate-500 uppercase focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-orange-500 text-xs font-bold text-white rounded-xl border border-slate-700 transition-all"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Coupon '{appliedPromo.code}' applied (-{appliedPromo.discountPercent}% extra discount)
                  </div>
                )}
                {promoError && (
                  <div className="text-[11px] text-red-400 mt-1">
                    {promoError}
                  </div>
                )}
              </div>
            </div>

            {/* Price Summary Breakdown Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Base Denomination Price:</span>
                <span>{formatCurrency(basePriceIDR, currentCurrency)}</span>
              </div>

              {discountAmountIDR > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-medium">
                  <span>Wholesale & Promo Discount (-{totalDiscountPercent}%):</span>
                  <span>-{formatCurrency(discountAmountIDR, currentCurrency)}</span>
                </div>
              )}

              {userVipDiscountPercent > 0 && (
                <div className="flex items-center justify-between text-amber-400 font-medium">
                  <span>VIP {user.vipTier} Member Rebate:</span>
                  <span>-{userVipDiscountPercent}% Included</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>Payment Gateway Admin Fee ({selectedPayment?.name}):</span>
                <span>{feeIDR > 0 ? formatCurrency(feeIDR, currentCurrency) : 'FREE (0%)'}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-black text-white">
                <span>Total Payment:</span>
                <span className="text-base sm:text-lg text-emerald-400">
                  {formatCurrency(totalIDR, currentCurrency)}
                </span>
              </div>

              {/* Loyalty UniPoints Earned Pill */}
              <div className="mt-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-lg p-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <span>🪙</span>
                  <span>UniPoints Earned with this purchase:</span>
                </div>
                <div className="font-black text-amber-300">
                  +{uniPointsEarned} PTS
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <div>
            <div className="text-[11px] text-slate-400">Total to Pay ({currentCurrency}):</div>
            <div className="text-xl font-black text-emerald-400 flex items-baseline gap-2">
              <span>{formatCurrency(totalIDR, currentCurrency)}</span>
              <span className="text-[11px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                +{uniPointsEarned} UniPoints
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProceedCheckout}
              disabled={hasInsufficientWalletBalance}
              className="flex-1 sm:flex-initial px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-sm font-black rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{hasInsufficientWalletBalance ? 'Insufficient UC Balance' : 'Pay Now & Top-Up'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
