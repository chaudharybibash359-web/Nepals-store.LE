import React from 'react';
import { Zap, Star, ShieldCheck, Sparkles, Flame, ChevronRight } from 'lucide-react';
import { GameProduct, CurrencyCode } from '../types';
import { formatCurrency } from '../services/currency';

interface GameCardProps {
  game: GameProduct;
  currentCurrency: CurrencyCode;
  onSelect: (game: GameProduct) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, currentCurrency, onSelect }) => {
  // Find minimum starting price among denominations
  const minPriceIDR = game.denominations.length > 0 
    ? Math.min(...game.denominations.map(d => {
        const disc = d.discountPercentage || 0;
        return d.basePriceIDR * (1 - disc / 100);
      }))
    : 10000;

  const popularItem = game.denominations.find(d => d.isPopular) || game.denominations[0];

  return (
    <div 
      onClick={() => onSelect(game)}
      className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-4 shadow-xl hover:shadow-orange-500/10 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Banner & Badges */}
      <div>
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-slate-950">
          <img 
            src={game.thumbnailUrl} 
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Dark gradient shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {game.isFlashDeal && (
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 animate-pulse" /> FLASH DEAL
              </span>
            )}
            <span className="bg-slate-900/80 backdrop-blur-md border border-slate-750 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" /> {game.deliveryTime}
            </span>
          </div>

          {/* Publisher tag on bottom left of image */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 drop-shadow truncate">
              {game.publisher}
            </span>
            <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-slate-750">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <span>{game.rating.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 mb-1">
          {game.title}
        </h3>

        {/* Highlighted package */}
        <p className="text-xs text-slate-400 line-clamp-1 mb-3">
          Popular: <span className="text-slate-300 font-medium">{popularItem?.name}</span>
        </p>
      </div>

      {/* Bottom Pricing & CTA */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Starting From
          </div>
          <div className="text-sm font-black text-emerald-400">
            {formatCurrency(minPriceIDR, currentCurrency)}
          </div>
        </div>

        <button 
          className="px-3 py-1.5 bg-orange-500/15 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 group-hover:border-orange-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
        >
          <span>Top Up</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};
