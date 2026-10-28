import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Flame, 
  Gamepad2, 
  Ticket, 
  Layers, 
  Tag, 
  CheckCircle2, 
  ChevronRight,
  TrendingDown,
  Radio
} from 'lucide-react';
import { GameCategory, GameProduct, CurrencyCode } from '../types';

interface HeroBannerProps {
  selectedCategory?: GameCategory | 'all';
  onSelectCategory?: (category: GameCategory | 'all') => void;
  onQuickSearchTag?: (tag: string) => void;
  onSearchChange?: (query: string) => void;
  onSelectGame: (gameIdOrProduct: string | GameProduct) => void;
  flashSaleGames?: GameProduct[];
  currentCurrency?: CurrencyCode;
  searchQuery?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedCategory = 'all',
  onSelectCategory,
  onQuickSearchTag,
  onSearchChange,
  onSelectGame,
  flashSaleGames,
  currentCurrency,
  searchQuery,
}) => {
  // Flash sale countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 34, seconds: 19 });

  const handleTagClick = (tag: string) => {
    if (typeof onQuickSearchTag === 'function') {
      onQuickSearchTag(tag);
    } else if (typeof onSearchChange === 'function') {
      onSearchChange(tag);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories: { id: GameCategory; label: string; icon: React.ReactNode; count?: string }[] = [
    { id: 'all', label: 'All Catalog', icon: <Layers className="w-4 h-4" /> },
    { id: 'flash_sale', label: '🔥 Flash Deals', icon: <Flame className="w-4 h-4 text-orange-400" />, count: 'UP TO 25% OFF' },
    { id: 'entertainment', label: '🎙️ Poppo Live & Stream Apps', icon: <Radio className="w-4 h-4 text-pink-400" />, count: 'HOT' },
    { id: 'direct_topup', label: 'Direct ID Top-Up', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'game_voucher', label: 'Digital Vouchers & Steam', icon: <Ticket className="w-4 h-4" /> },
  ];

  const quickTags = ['Poppo Live', 'Poppo Coins', 'Mobile Legends', 'UniPin Voucher', 'Free Fire', 'Robux', 'Genshin Impact', 'Valorant', 'PUBG Mobile'];

  return (
    <section className="relative pt-6 pb-8 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Hero Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-750 p-6 md:p-8 shadow-2xl overflow-hidden mb-8">
          
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide">
                <Flame className="w-3.5 h-3.5 animate-bounce text-orange-400" />
                <span>UNIPIN LOWEST PRICE GUARANTEE • 2026 EDITION</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Fastest Gaming Top-Up &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400">
                  Wholesale Vouchers
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Top up any game instantly with UniPin Credits, QRIS, Virtual Accounts, and local payment methods. Instant fulfillment in under 5 seconds with automated email receipts and 24/7 live support.
              </p>

              {/* Feature Checkmarks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3-Sec Instant Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>0% Fee with UniPin UC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated E-Receipt</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectGame('poppo-live')}
                  className="px-5 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-500/25 flex items-center gap-2 transition-all"
                >
                  <Radio className="w-4 h-4" />
                  <span>Poppo Live Coins (-25%)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectGame('unipin-voucher')}
                  className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>UniPin Voucher (-15%)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectGame('mlbb')}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4 text-orange-400" />
                  <span>MLBB Weekly Pass</span>
                </button>
              </div>

            </div>

            {/* Right Card: Live Flash Deal Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
                
                {/* Flash Deal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1">
                        Flash Sale Ends In
                      </div>
                      <div className="text-xs text-slate-400 font-medium">Limited Wholesale Quota</div>
                    </div>
                  </div>

                  {/* Countdown Digital Timer */}
                  <div className="flex items-center gap-1 font-mono text-xs font-black">
                    <span className="bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded-md">
                      {String(timeLeft.hours).padStart(2, '0')}h
                    </span>
                    <span className="text-orange-400 font-bold">:</span>
                    <span className="bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded-md">
                      {String(timeLeft.minutes).padStart(2, '0')}m
                    </span>
                    <span className="text-orange-400 font-bold">:</span>
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-md animate-pulse">
                      {String(timeLeft.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                </div>

                {/* Highlighted Deals list */}
                <div className="space-y-2.5">
                  {/* Poppo Live Flash Deal */}
                  <div 
                    onClick={() => onSelectGame('poppo-live')}
                    className="group flex items-center justify-between p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-pink-500/30 hover:border-pink-500/60 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-pink-600 to-rose-500 p-0.5 shrink-0 flex items-center justify-center font-black text-white text-[11px]">
                        🪙 70K
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors flex items-center gap-1.5">
                          <span>Poppo Live 70,000 Coins</span>
                          <span className="bg-pink-500/20 text-pink-300 text-[9px] px-1.5 py-0.2 rounded font-black">Wholesale</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Instant UID Credit • Direct Host Gifting</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400">Rp 129,200</div>
                      <div className="text-[10px] text-slate-500 line-through">Rp 152,000</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => onSelectGame('unipin-voucher')}
                    className="group flex items-center justify-between p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/40 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shrink-0 flex items-center justify-center font-black text-white text-xs">
                        100 UC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                          UniPin Digital Voucher 100k
                        </div>
                        <div className="text-[11px] text-slate-400">Instant Email Delivery • 16-Digit PIN</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400">Rp 85,000</div>
                      <div className="text-[10px] text-slate-500 line-through">Rp 100,000</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => onSelectGame('mlbb')}
                    className="group flex items-center justify-between p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/40 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-500/30 p-0.5 shrink-0 flex items-center justify-center font-bold text-blue-300 text-xs">
                        💎 210
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                          MLBB Weekly Diamond Pass
                        </div>
                        <div className="text-[11px] text-slate-400">7-Day Supply + 70 Starlight</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400">Rp 24,225</div>
                      <div className="text-[10px] text-slate-500 line-through">Rp 28,500</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => onSelectGame('genshin')}
                    className="group flex items-center justify-between p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/40 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-600/30 border border-amber-500/30 p-0.5 shrink-0 flex items-center justify-center font-bold text-amber-300 text-xs">
                        🌙 Welkin
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                          Blessing of the Welkin Moon
                        </div>
                        <div className="text-[11px] text-slate-400">3000 Primogems Value</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400">Rp 67,150</div>
                      <div className="text-[10px] text-slate-500 line-through">Rp 79,000</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Assurance */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Authorized UniPin Reseller
                  </span>
                  <span className="text-orange-400 font-semibold">100% Guaranteed</span>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Quick Search Tag Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-orange-400" /> Popular:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1.5 bg-slate-800/70 hover:bg-slate-750 active:bg-orange-500 active:text-white border border-slate-700/80 hover:border-slate-600 rounded-full text-slate-300 font-medium transition-colors shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory?.(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {cat.count && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
