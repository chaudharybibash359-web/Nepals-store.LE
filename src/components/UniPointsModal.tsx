import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Gift, 
  Award, 
  Ticket, 
  Check, 
  ArrowRight, 
  Flame, 
  ShieldCheck, 
  Coins, 
  Lock, 
  Crown,
  Copy,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, CurrencyCode, UniPointsRewardItem } from '../types';
import { UNIPOINTS_REWARDS } from '../data/mockData';
import { formatCurrency } from '../services/currency';

interface UniPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currentCurrency: CurrencyCode;
  onRedeemReward: (reward: UniPointsRewardItem) => void;
  onOpenTopUpForGame?: (gameId: string) => void;
}

export const UniPointsModal: React.FC<UniPointsModalProps> = ({
  isOpen,
  onClose,
  user,
  currentCurrency,
  onRedeemReward,
  onOpenTopUpForGame,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'rewards' | 'my_vouchers' | 'earn_rules'>('rewards');
  const [filterType, setFilterType] = useState<'all' | 'voucher_discount' | 'game_credit' | 'exclusive_tier'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredRewards = UNIPOINTS_REWARDS.filter((r) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClaim = (reward: UniPointsRewardItem) => {
    if (user.uniPointsBalance < reward.pointsCost) return;

    setRedeemingId(reward.id);
    setTimeout(() => {
      onRedeemReward(reward);
      setRedeemingId(null);
      setSuccessMessage(`🎉 Successfully redeemed "${reward.title}"!`);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => setSuccessMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header with Points Showcase */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 sm:p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black text-xl shadow-lg">
                🪙
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight">UniPoints Loyalty Club</h3>
                  <span className="bg-amber-300 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow">
                    Rewards Program
                  </span>
                </div>
                <p className="text-xs text-amber-100 mt-0.5">
                  Earn 1 UniPoint for every Rp 1,000 / रू 8 spent. Redeem for instant discount vouchers & VIP tiers!
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Points Balance Banner */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-amber-200 uppercase font-semibold">Available UniPoints</div>
                <div className="text-2xl font-black text-white">{user.uniPointsBalance.toLocaleString()} <span className="text-xs text-amber-300 font-bold">PTS</span></div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-400/20 text-orange-300 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-amber-200 uppercase font-semibold">Lifetime Points Earned</div>
                <div className="text-2xl font-black text-white">{user.totalPointsEarned.toLocaleString()} <span className="text-xs text-amber-300 font-bold">PTS</span></div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-amber-200 uppercase font-semibold">VIP Loyalty Tier</div>
                <div className="text-xl font-black text-amber-300">{user.vipTier} Member</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'rewards'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Rewards Catalog ({UNIPOINTS_REWARDS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('my_vouchers')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'my_vouchers'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Claimed Vouchers ({user.claimedVouchers?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('earn_rules')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'earn_rules'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>How to Earn Points</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time point sync</span>
          </div>
        </div>

        {/* Notification Toast */}
        {successMessage && (
          <div className="bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 text-center animate-in slide-in-from-top">
            {successMessage}
          </div>
        )}

        {/* Tab 1: Rewards Catalog */}
        {activeTab === 'rewards' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filter By:</span>
              {[
                { id: 'all', label: 'All Rewards' },
                { id: 'voucher_discount', label: '🎟️ Discount Vouchers' },
                { id: 'game_credit', label: '💳 UniPin Credits Balance' },
                { id: 'exclusive_tier', label: '👑 Exclusive Streamer & Game Tiers' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === f.id
                      ? 'bg-slate-800 text-orange-400 border border-orange-500/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Rewards Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRewards.map((reward) => {
                const canAfford = user.uniPointsBalance >= reward.pointsCost;
                const isClaiming = redeemingId === reward.id;

                return (
                  <div
                    key={reward.id}
                    className={`relative bg-slate-850/90 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                      canAfford
                        ? 'border-slate-700/80 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5'
                        : 'border-slate-800/80 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-750 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                            {reward.icon || '🎁'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white leading-snug">
                                {reward.title}
                              </h4>
                            </div>
                            {reward.badge && (
                              <span className="inline-block mt-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-md">
                                {reward.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Points Badge */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-amber-400 flex items-center justify-end gap-1">
                            <span>🪙</span>
                            <span>{reward.pointsCost}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">UniPoints</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                        {reward.description}
                      </p>

                      {reward.valueAmountIDR && (
                        <div className="mt-2.5 bg-slate-900/80 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-semibold flex items-center justify-between border border-slate-800">
                          <span>Equivalent Real Cash Value:</span>
                          <span className="font-bold">{formatCurrency(reward.valueAmountIDR, currentCurrency)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-400">
                        {canAfford ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Ready to Redeem
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-slate-500" /> Need {(reward.pointsCost - user.uniPointsBalance).toLocaleString()} more pts
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleClaim(reward)}
                        disabled={!canAfford || isClaiming}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          canAfford
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                        }`}
                      >
                        {isClaiming ? (
                          <span className="flex items-center gap-1">Processing...</span>
                        ) : (
                          <>
                            <span>Redeem Reward</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: My Claimed Vouchers */}
        {activeTab === 'my_vouchers' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {(!user.claimedVouchers || user.claimedVouchers.length === 0) ? (
              <div className="text-center py-12 bg-slate-850/50 rounded-2xl border border-slate-800 p-6">
                <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No Claimed Vouchers Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Redeem your available UniPoints in the Rewards Catalog to unlock instant discount promo codes!
                </p>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  Explore Rewards Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Copy voucher code and paste it into the checkout promo code field.</span>
                  <span>{user.claimedVouchers.length} Total Vouchers</span>
                </div>

                {user.claimedVouchers.map((vchr) => (
                  <div
                    key={vchr.id}
                    className={`bg-slate-850 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      vchr.isUsed
                        ? 'border-slate-800 opacity-60'
                        : 'border-amber-500/40 bg-gradient-to-r from-slate-850 to-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                        vchr.isUsed ? 'bg-slate-800 text-slate-500' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        🎟️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{vchr.title}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            vchr.isUsed ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {vchr.isUsed ? 'REDEEMED / USED' : 'ACTIVE & UNUSED'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Claimed on: {new Date(vchr.claimedAt).toLocaleDateString()}
                          {vchr.valueAmountIDR && ` • Cash Value: ${formatCurrency(vchr.valueAmountIDR, currentCurrency)}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-slate-950 border border-slate-700 px-3.5 py-2 rounded-xl font-mono text-xs font-bold text-amber-300 tracking-wider">
                        {vchr.code}
                      </div>

                      <button
                        onClick={() => handleCopyCode(vchr.code)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                        title="Copy Promo Code"
                      >
                        {copiedCode === vchr.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: How to Earn Points */}
        {activeTab === 'earn_rules' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" /> UniPoints Earning Rate Guide
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-2xl font-black text-amber-400">1 Point</div>
                  <div className="text-xs font-bold text-white mt-1">Per Rp 1,000 IDR Spent</div>
                  <div className="text-[11px] text-slate-400 mt-1">Automatic credit with every game purchase or voucher order.</div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-2xl font-black text-emerald-400">1 Point</div>
                  <div className="text-xs font-bold text-white mt-1">Per रू 8.3 NPR Spent</div>
                  <div className="text-[11px] text-slate-400 mt-1">Direct point conversion on eSewa, Khalti, IME Pay, or Fonepay checkouts.</div>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-2xl font-black text-cyan-400">2x Multiplier</div>
                  <div className="text-xs font-bold text-white mt-1">VIP Tier Bonus</div>
                  <div className="text-[11px] text-slate-400 mt-1">Gold & Diamond VIP members earn double UniPoints on Flash Sale orders!</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white">UniPoints Program Terms:</h4>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li>Points are credited instantly upon successful payment completion (2-3 seconds).</li>
                <li>Points have no expiration date as long as your account remains active.</li>
                <li>Discount voucher codes generated from points can be used alongside standard game sales and Poppo Live promotions.</li>
                <li>Direct UniPin Credits rewards are added straight to your wallet balance with 0% fee.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Current Balance: <strong className="text-amber-400 font-bold">{user.uniPointsBalance.toLocaleString()} UniPoints</strong>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
