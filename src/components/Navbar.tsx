import React, { useState } from 'react';
import { 
  Gamepad2, 
  Wallet, 
  History, 
  ShieldCheck, 
  Ticket, 
  Globe, 
  ChevronDown, 
  Sparkles, 
  Plus, 
  User,
  Search,
  Bell
} from 'lucide-react';
import { CurrencyCode, UserAccount } from '../types';
import { CURRENCY_CONFIGS, formatCurrency } from '../services/currency';

interface NavbarProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange?: (code: CurrencyCode) => void;
  onSelectCurrency?: (code: CurrencyCode) => void;
  user: UserAccount;
  ordersCount?: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenWalletModal?: () => void;
  onOpenWallet?: () => void;
  onOpenVoucherModal?: () => void;
  onOpenVoucherRedeem?: () => void;
  onOpenHistoryModal?: () => void;
  onOpenHistory?: () => void;
  onOpenAuthModal?: () => void;
  onOpenAuth?: () => void;
  onOpenAdminModal?: () => void;
  onOpenAdmin?: () => void;
  onOpenUniPointsModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  onSelectCurrency,
  user,
  ordersCount = 0,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenWalletModal,
  onOpenWallet,
  onOpenVoucherModal,
  onOpenVoucherRedeem,
  onOpenHistoryModal,
  onOpenHistory,
  onOpenAuthModal,
  onOpenAuth,
  onOpenAdminModal,
  onOpenAdmin,
  onOpenUniPointsModal,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
}) => {
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const handleCurrencyChange = (code: CurrencyCode) => {
    if (typeof onCurrencyChange === 'function') {
      onCurrencyChange(code);
    } else if (typeof onSelectCurrency === 'function') {
      onSelectCurrency(code);
    }
  };

  const handleOpenWallet = onOpenWalletModal || onOpenWallet || (() => {});
  const handleOpenVoucher = onOpenVoucherModal || onOpenVoucherRedeem || (() => {});
  const handleOpenHistory = onOpenHistoryModal || onOpenHistory || (() => {});
  const handleOpenAuth = onOpenAuthModal || onOpenAuth || (() => {});
  const handleOpenAdmin = onOpenAdminModal || onOpenAdmin || (() => {});

  const currencies = Object.values(CURRENCY_CONFIGS);
  const currentConfig = CURRENCY_CONFIGS[currentCurrency] || CURRENCY_CONFIGS.IDR;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 py-1 px-4 text-xs font-medium text-white flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase">⚡ Flash Deal</span>
            <span className="truncate">Up to 25% OFF UniPin Vouchers & Direct Top-Ups • 3-Second Instant Delivery</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-amber-100 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-200" /> 100% Official & Anti-Banned Guarantee
            </span>
            <span>•</span>
            <span>24/7 AI Live Support Online</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                    U<span className="text-white">P</span>
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
                    UniPin<span className="text-orange-500">.TopUp</span>
                  </span>
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    LOWEST PRICE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Instant Gaming Voucher & Direct Top-up</p>
              </div>
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search games, vouchers, diamonds, UC, robux..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 hover:border-slate-600 focus:border-orange-500 focus:outline-none rounded-xl text-sm text-slate-100 placeholder-slate-400 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Multi-Currency Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 transition-all hover:border-slate-600"
                title="Switch Currency"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>{currentConfig.flag} {currentConfig.code}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsCurrencyDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-slate-850 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Select Display Currency
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                      {currencies.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            handleCurrencyChange(curr.code);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors ${
                            currentCurrency === curr.code
                              ? 'bg-orange-500 text-white font-bold'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{curr.flag}</span>
                            <span>{curr.code}</span>
                            <span className="text-[11px] text-slate-400 font-normal truncate max-w-[80px]">({curr.name})</span>
                          </span>
                          <span className="text-[11px] opacity-80">{curr.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* UniPin Credits (UC) Wallet Pill */}
            <div className="flex items-center bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700/80 rounded-xl p-1 shadow-sm">
              <button
                onClick={handleOpenWallet}
                className="flex items-center gap-2 px-2.5 py-1 hover:bg-slate-750 rounded-lg transition-colors text-left"
                title="UniPin Credits Wallet Balance"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs">
                  UC
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 leading-tight font-medium">UniPin Credits</div>
                  <div className="text-xs font-bold text-emerald-400 leading-tight">
                    {formatCurrency(user.unipinCreditsIDR, currentCurrency)}
                  </div>
                </div>
              </button>

              <button
                onClick={handleOpenWallet}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white p-1.5 rounded-lg transition-all shadow-md shadow-orange-500/20 flex items-center justify-center ml-1"
                title="Reload UniPin Credits (0% Fee)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* UniPoints Loyalty Pill */}
            <button
              onClick={onOpenUniPointsModal}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/40 rounded-xl transition-all text-left shadow-sm group"
              title="UniPoints Loyalty Points & Rewards Catalog"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                🪙
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] text-amber-300/80 leading-tight font-bold">UniPoints</div>
                <div className="text-xs font-black text-amber-300 leading-tight">
                  {(user.uniPointsBalance ?? 480).toLocaleString()} <span className="text-[10px] font-normal text-amber-400">PTS</span>
                </div>
              </div>
            </button>

            {/* Redeem Voucher Button */}
            <button
              onClick={handleOpenVoucher}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-orange-400 rounded-xl transition-all"
            >
              <Ticket className="w-3.5 h-3.5 text-orange-400" />
              <span>Redeem Code</span>
            </button>

            {/* Transaction History Button with Badge */}
            <button
              onClick={handleOpenHistory}
              className="relative p-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-200 hover:text-white transition-all"
              title="Transaction History & E-Receipts"
            >
              <History className="w-4 h-4 text-slate-300" />
              {ordersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                  {ordersCount}
                </span>
              )}
            </button>

            {/* Notification Center Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-200 hover:text-orange-400 transition-all"
              title="Real-time Order Notifications (Gmail, SMS, Telegram, FB, TW)"
            >
              <Bell className="w-4 h-4 text-slate-300 hover:text-orange-400" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* User Account / VIP Tier Pill */}
            <button
              onClick={handleOpenAuth}
              className="flex items-center gap-2 p-1.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all"
              title="User Profile & VIP Tier"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center text-slate-300">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="hidden md:block text-left pr-1.5">
                <div className="text-xs font-bold text-white truncate max-w-[90px]">{user.name.split(' ')[0]}</div>
                <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> VIP {user.vipTier}
                </div>
              </div>
            </button>

            {/* Admin Console Entry */}
            <button
              onClick={handleOpenAdmin}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-amber-400 rounded-xl transition-all"
              title="Admin Portal (Order Management, Pricing, Vouchers)"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
