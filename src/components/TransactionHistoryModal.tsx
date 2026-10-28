import React, { useState } from 'react';
import { 
  X, 
  History, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Ticket
} from 'lucide-react';
import { OrderItem, CurrencyCode } from '../types';
import { formatCurrency } from '../services/currency';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderItem[];
  currentCurrency: CurrencyCode;
  onSelectReceipt: (order: OrderItem) => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentCurrency,
  onSelectReceipt,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'COMPLETED' | 'PROCESSING' | 'PENDING'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.ignValidated && ord.ignValidated.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || ord.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin" /> PROCESSING
          </span>
        );
      default:
        return (
          <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Transaction History & E-Receipts
              </h3>
              <p className="text-xs text-slate-400">
                Track top-ups, copy voucher PIN codes, and download automated invoices
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

        {/* Filters and Search */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-850/50 space-y-3 shrink-0">
          
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Game, Email, or In-game Nickname..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 focus:border-orange-500 focus:outline-none rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            {(['ALL', 'COMPLETED', 'PROCESSING', 'PENDING'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st}
              </button>
            ))}
          </div>

        </div>

        {/* Orders List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto opacity-30 text-orange-400" />
              <div className="text-sm font-semibold">No transactions found</div>
              <p className="text-xs text-slate-500">
                Try adjusting your search criteria or make your first top-up!
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-850 hover:bg-slate-800/90 border border-slate-750 hover:border-slate-650 rounded-2xl p-4 transition-all shadow-md space-y-3"
              >
                {/* Top Row: Game, Order#, Status */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-orange-400">
                        {ord.orderNumber}
                      </span>
                      {getStatusBadge(ord.status)}
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {ord.gameTitle}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium">
                      {ord.denominationName}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">
                      {formatCurrency(ord.totalIDR, currentCurrency)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.paymentMethodName}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Recipient User ID / IGN:</span>
                    <div className="font-bold text-slate-200">
                      {ord.ignValidated || ord.userId} {ord.zoneId ? `(${ord.zoneId})` : ''}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Email Receipt:</span>
                    <div className="text-slate-300 truncate">
                      {ord.customerEmail}
                    </div>
                  </div>

                  {ord.voucherCode && ord.voucherCode !== 'DIRECT_GAME_INJECTION_API' && (
                    <div className="sm:col-span-2 pt-1 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-orange-300 font-mono font-bold text-xs">
                        <Ticket className="w-3.5 h-3.5 text-orange-400" />
                        <span>Voucher PIN: {ord.voucherCode}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(ord.voucherCode || '', `code-${ord.id}`)}
                        className="px-2 py-0.5 bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white rounded text-[11px] font-bold transition-all flex items-center gap-1"
                      >
                        {copiedId === `code-${ord.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === `code-${ord.id}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    SLA Delivery: Instant (<strong className="text-slate-300">3s</strong>)
                  </span>

                  <button
                    onClick={() => {
                      onSelectReceipt(ord);
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-white border border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                    <span>View & Email E-Receipt</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Total {orders.length} order{orders.length === 1 ? '' : 's'} recorded in this session.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
};
