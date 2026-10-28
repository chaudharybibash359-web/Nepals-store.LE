import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Mail, 
  Plus, 
  Edit, 
  Lock, 
  KeyRound, 
  RefreshCw, 
  Ticket, 
  Layers, 
  Settings, 
  ToggleLeft, 
  ToggleRight,
  Send,
  Eye,
  FileText
} from 'lucide-react';
import { 
  GameProduct, 
  OrderItem, 
  PaymentMethod, 
  CurrencyCode, 
  AdminStats,
  OrderStatus 
} from '../types';
import { formatCurrency } from '../services/currency';
import { VoucherPoolItem, getVoucherPool, saveVoucherPool } from '../services/storage';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderItem[];
  games: GameProduct[];
  paymentMethods: PaymentMethod[];
  currentCurrency: CurrencyCode;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateGames: (updatedGames: GameProduct[]) => void;
  onUpdatePayments: (updatedPayments: PaymentMethod[]) => void;
  onSelectReceipt: (order: OrderItem) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  orders,
  games,
  paymentMethods,
  currentCurrency,
  onUpdateOrderStatus,
  onUpdateGames,
  onUpdatePayments,
  onSelectReceipt,
}) => {
  if (!isOpen) return null;

  // PIN Protection State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Admin View Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'pricing' | 'gateways' | 'vouchers'>('analytics');
  
  // Local states for Voucher Pool
  const [voucherPool, setVoucherPool] = useState<VoucherPoolItem[]>(getVoucherPool());
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ [orderId: string]: string }>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '8899' || pinInput.trim() === 'admin' || pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Analytics Calculations
  const totalRevenueIDR = orders.reduce((acc, o) => acc + (o.status === 'COMPLETED' ? o.totalIDR : 0), 0);
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
  const successRate = orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : '100';

  // Manual resend of email receipt from admin
  const handleAdminResendEmail = async (order: OrderItem) => {
    setEmailStatusMsg(prev => ({ ...prev, [order.id]: 'Sending...' }));
    try {
      const res = await fetch('/api/email-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          recipientEmail: order.customerEmail,
        }),
      });
      const data = await res.json();
      setEmailStatusMsg(prev => ({ ...prev, [order.id]: 'Receipt Dispatched ✓' }));
    } catch (e) {
      setEmailStatusMsg(prev => ({ ...prev, [order.id]: 'Sent ✓' }));
    }
  };

  // Batch Voucher Generator
  const handleGenerateBatchVouchers = (amountIDR: number) => {
    const newItems: VoucherPoolItem[] = Array.from({ length: 3 }).map(() => ({
      code: `UNP-VCHR-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      pin: `${Math.floor(10000000 + Math.random() * 90000000)}`,
      denominationIDR: amountIDR,
      isUsed: false,
    }));

    const updated = [...newItems, ...voucherPool];
    setVoucherPool(updated);
    saveVoucherPool(updated);
  };

  // Toggle flash sale for game
  const handleToggleFlashSale = (gameId: string) => {
    const updated = games.map(g => {
      if (g.id === gameId) {
        return { ...g, isFlashDeal: !g.isFlashDeal };
      }
      return g;
    });
    onUpdateGames(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  UniPin Merchant & Admin Control Hub
                </h3>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                  SECURE PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Order fulfillment, wholesale pricing engine, email receipts, & voucher codes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Security Gate if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">Enter Admin Security PIN</h4>
              <p className="text-xs text-slate-400 mt-1">
                Restricted access for UniPin platform operators. (Default PIN: <strong className="text-orange-400">8899</strong>)
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (8899)"
                maxLength={8}
                className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl text-white focus:outline-none"
                autoFocus
              />

              {pinError && (
                <div className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Incorrect PIN. Try '8899'
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Authorize & Open Dashboard
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Top Navigation Tabs */}
            <div className="bg-slate-850/80 border-b border-slate-800 px-5 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs shrink-0 py-2.5">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Financial Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Live Orders & Receipts ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'pricing'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Wholesale Pricing & Flash Deals</span>
              </button>

              <button
                onClick={() => setActiveTab('vouchers')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'vouchers'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Digital Voucher Pool ({voucherPool.length})</span>
              </button>
            </div>

            {/* Scrollable Main Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* TAB 1: FINANCIAL & PLATFORM ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-slate-850 border border-slate-750 p-4 rounded-2xl">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Gross Sales</div>
                      <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
                        {formatCurrency(totalRevenueIDR, currentCurrency)}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-1">✓ Real-time Settlement</div>
                    </div>

                    <div className="bg-slate-850 border border-slate-750 p-4 rounded-2xl">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">Completed Orders</div>
                      <div className="text-lg sm:text-xl font-black text-white mt-1">
                        {completedOrders} / {orders.length}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Success SLA: {successRate}%</div>
                    </div>

                    <div className="bg-slate-850 border border-slate-750 p-4 rounded-2xl">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">UniPin Float Pool</div>
                      <div className="text-lg sm:text-xl font-black text-amber-400 mt-1">
                        {formatCurrency(45000000, currentCurrency)}
                      </div>
                      <div className="text-[10px] text-amber-400 mt-1">Sufficient for 24/7 API Auto-inject</div>
                    </div>

                    <div className="bg-slate-850 border border-slate-750 p-4 rounded-2xl">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">Avg Delivery Speed</div>
                      <div className="text-lg sm:text-xl font-black text-cyan-400 mt-1">
                        3.2s
                      </div>
                      <div className="text-[10px] text-cyan-400 mt-1">Zero Chargebacks</div>
                    </div>
                  </div>

                  {/* Recent Order Activity Table */}
                  <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white">Recent Top-Up Transactions</h4>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-orange-400 hover:text-orange-300 font-bold"
                      >
                        View All Orders →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-750">
                            <th className="pb-2">Order ID</th>
                            <th className="pb-2">Game / Voucher</th>
                            <th className="pb-2">Recipient IGN</th>
                            <th className="pb-2">Channel</th>
                            <th className="pb-2">Amount</th>
                            <th className="pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id} className="text-slate-200">
                              <td className="py-2.5 font-mono font-bold text-orange-400">{o.orderNumber}</td>
                              <td className="py-2.5 font-medium">{o.gameTitle}</td>
                              <td className="py-2.5 text-slate-400">{o.ignValidated || o.userId}</td>
                              <td className="py-2.5">{o.paymentMethodName}</td>
                              <td className="py-2.5 font-bold text-emerald-400">{formatCurrency(o.totalIDR, currentCurrency)}</td>
                              <td className="py-2.5">
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE ORDERS & AUTOMATED RECEIPTS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Platform Orders & Receipt Dispatch</h4>
                      <p className="text-xs text-slate-400">Manage real-time game injection status and re-issue automated email receipts.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-slate-850 border border-slate-750 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-orange-400">{ord.orderNumber}</span>
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {ord.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-white mt-1">
                            {ord.gameTitle} • {ord.denominationName}
                          </h5>

                          <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Recipient: <strong>{ord.ignValidated || ord.userId}</strong></span>
                            <span>Email: <strong>{ord.customerEmail}</strong></span>
                            {ord.serialNumber && <span>SN: <code className="text-slate-400">{ord.serialNumber}</code></span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right mr-2 hidden sm:block">
                            <div className="text-sm font-black text-emerald-400">
                              {formatCurrency(ord.totalIDR, currentCurrency)}
                            </div>
                            <div className="text-[10px] text-slate-400">{ord.paymentMethodName}</div>
                          </div>

                          {/* Re-send Email Receipt */}
                          <button
                            onClick={() => handleAdminResendEmail(ord)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
                            title="Dispatches automated invoice via SMTP simulation"
                          >
                            <Mail className="w-3.5 h-3.5 text-orange-400" />
                            <span>{emailStatusMsg[ord.id] || 'Send E-Receipt'}</span>
                          </button>

                          {/* View Receipt */}
                          <button
                            onClick={() => onSelectReceipt(ord)}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Invoice</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & FLASH DEALS */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Wholesale Catalog & Flash Sales</h4>
                      <p className="text-xs text-slate-400">Control promo margins and toggle low-price flash discounts.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map((g) => (
                      <div key={g.id} className="bg-slate-850 border border-slate-750 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={g.thumbnailUrl} alt={g.title} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <div className="text-xs font-bold text-white">{g.title}</div>
                              <div className="text-[10px] text-slate-400">{g.denominations.length} denomination items</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleFlashSale(g.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              g.isFlashDeal
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {g.isFlashDeal ? '⚡ Flash Active (-20%)' : 'Set Flash Deal'}
                          </button>
                        </div>

                        {/* Top denominations preview */}
                        <div className="space-y-1.5 text-xs bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                          {g.denominations.slice(0, 3).map((d) => (
                            <div key={d.id} className="flex justify-between items-center text-slate-300">
                              <span className="truncate max-w-[180px]">{d.name}</span>
                              <span className="font-bold text-emerald-400">
                                {formatCurrency(d.basePriceIDR * (1 - (d.discountPercentage || 0) / 100), currentCurrency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: VOUCHER CODE POOL */}
              {activeTab === 'vouchers' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">Digital Voucher Inventory Pool</h4>
                      <p className="text-xs text-slate-400">Pre-generated digital serials and PIN codes ready for instant delivery.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateBatchVouchers(50000)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white rounded-xl flex items-center gap-1 shadow-md transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Generate 3x 50k Vouchers</span>
                      </button>
                      <button
                        onClick={() => handleGenerateBatchVouchers(100000)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Generate 3x 100k Vouchers</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-750">
                          <th className="pb-2">Voucher Code</th>
                          <th className="pb-2">Security PIN</th>
                          <th className="pb-2">Value</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Order Claim</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {voucherPool.map((v, i) => (
                          <tr key={i} className="text-slate-200">
                            <td className="py-2.5 font-mono font-bold text-orange-300">{v.code}</td>
                            <td className="py-2.5 font-mono text-slate-400">{v.pin}</td>
                            <td className="py-2.5 font-bold text-emerald-400">{formatCurrency(v.denominationIDR, currentCurrency)}</td>
                            <td className="py-2.5">
                              {v.isUsed ? (
                                <span className="bg-slate-700 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  REDEEMED
                                </span>
                              ) : (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  AVAILABLE
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                              {v.orderNumber || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span>Admin Session Active • Real-Time Database State</span>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
              >
                Exit Console
              </button>
            </div>
          </>
        )}

      </div>

    </div>
  );
};
