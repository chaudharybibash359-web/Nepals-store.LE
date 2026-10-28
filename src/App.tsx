import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  HeroBanner 
} from './components/HeroBanner';
import { 
  GameCard 
} from './components/GameCard';
import { 
  TopUpModal 
} from './components/TopUpModal';
import { 
  PaymentModal 
} from './components/PaymentModal';
import { 
  ReceiptModal 
} from './components/ReceiptModal';
import { 
  TransactionHistoryModal 
} from './components/TransactionHistoryModal';
import { 
  WalletTopUpModal 
} from './components/WalletTopUpModal';
import { 
  VoucherRedeemModal 
} from './components/VoucherRedeemModal';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  UniPointsModal 
} from './components/UniPointsModal';
import { 
  NotificationModal 
} from './components/NotificationModal';
import { 
  LiveOrderTrackerModal 
} from './components/LiveOrderTrackerModal';
import { 
  NotificationToast 
} from './components/NotificationToast';
import { 
  AdminDashboard 
} from './components/AdminDashboard';
import { 
  ChatAssistant 
} from './components/ChatAssistant';

import { 
  GameProduct, 
  GameCategory, 
  CurrencyCode, 
  OrderItem, 
  UserAccount, 
  PaymentMethod,
  OrderStatus,
  UniPointsRewardItem,
  OrderNotification
} from './types';
import { 
  INITIAL_GAMES, 
  PAYMENT_METHODS 
} from './data/mockData';
import { 
  getUserAccount, 
  saveUserAccount, 
  getStoredOrders, 
  saveStoredOrders,
  getStoredGames,
  saveStoredGames,
  getStoredPayments,
  saveStoredPayments,
  getStoredCurrency,
  saveStoredCurrency,
  getStoredNotifications,
  saveStoredNotifications
} from './services/storage';
import { 
  formatCurrency 
} from './services/currency';

import { 
  ShieldCheck, 
  Zap, 
  Headphones, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Ticket, 
  Flame,
  Globe2,
  Lock,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function App() {
  // State Initialization
  const [user, setUser] = useState<UserAccount>(() => getUserAccount());
  const [orders, setOrders] = useState<OrderItem[]>(() => getStoredOrders());
  const [games, setGames] = useState<GameProduct[]>(() => getStoredGames());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => getStoredPayments());
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(() => getStoredCurrency());
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Navigation State
  const [selectedGameForTopUp, setSelectedGameForTopUp] = useState<GameProduct | null>(null);
  const [orderDraft, setOrderDraft] = useState<Partial<OrderItem> | null>(null);
  const [completedOrderForReceipt, setCompletedOrderForReceipt] = useState<OrderItem | null>(null);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUniPointsModalOpen, setIsUniPointsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<OrderItem | null>(null);
  const [activeToastNotification, setActiveToastNotification] = useState<OrderNotification | null>(null);

  // Real-time notifications state
  const [notifications, setNotifications] = useState<OrderNotification[]>(() => getStoredNotifications());

  // Sync state to local persistence
  useEffect(() => {
    saveUserAccount(user);
  }, [user]);

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredGames(games);
  }, [games]);

  useEffect(() => {
    saveStoredPayments(paymentMethods);
  }, [paymentMethods]);

  useEffect(() => {
    saveStoredCurrency(currentCurrency);
  }, [currentCurrency]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Filtered Games Listing
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesCategory = 
        selectedCategory === 'all' || 
        (selectedCategory === 'flash_sale' ? !!game.isFlashDeal : game.category === selectedCategory);
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        game.title.toLowerCase().includes(q) ||
        game.publisher.toLowerCase().includes(q) ||
        game.id.toLowerCase().includes(q) ||
        game.denominations?.some(d => d.name.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  const flashSaleGames = useMemo(() => {
    return games.filter((g) => g.isFlashDeal);
  }, [games]);

  // Handle Order Draft Creation from TopUpModal
  const handleInitiatePayment = (draft: Partial<OrderItem>) => {
    setSelectedGameForTopUp(null);
    setOrderDraft(draft);
  };

  // Handle Successful Payment (Accrue UniPoints & deduct wallet if chosen)
  const handlePaymentSuccess = (completedOrder: OrderItem) => {
    setOrderDraft(null);

    const earnedPoints = completedOrder.uniPointsEarned || Math.max(5, Math.round((completedOrder.totalIDR || 0) / 1000));

    // Update user balance, spend, and points
    setUser((prev) => {
      const newCredits = completedOrder.paymentMethodId === 'unipin-credits'
        ? Math.max(0, prev.unipinCreditsIDR - completedOrder.totalIDR)
        : prev.unipinCreditsIDR;
      
      const newSpend = prev.totalSpendIDR + completedOrder.totalIDR;
      const newTotalOrders = prev.totalOrdersCount + 1;
      
      // Determine dynamic VIP Tier upgrade
      let newTier = prev.vipTier;
      if (newSpend >= 5000000) newTier = 'Diamond';
      else if (newSpend >= 1500000) newTier = 'Gold';
      else if (newSpend >= 500000) newTier = 'Silver';

      return {
        ...prev,
        unipinCreditsIDR: newCredits,
        uniPointsBalance: (prev.uniPointsBalance ?? 0) + earnedPoints,
        totalPointsEarned: (prev.totalPointsEarned ?? 0) + earnedPoints,
        totalSpendIDR: newSpend,
        totalOrdersCount: newTotalOrders,
        vipTier: newTier,
      };
    });

    // Add to Orders
    setOrders((prev) => [completedOrder, ...prev]);

    // Dispatch automated notifications across linked channels
    const nowIso = new Date().toISOString();
    const newNotifications: OrderNotification[] = [
      {
        id: `notif-gmail-${Date.now()}`,
        orderId: completedOrder.id,
        orderNumber: completedOrder.orderNumber,
        gameTitle: completedOrder.gameTitle,
        denominationName: completedOrder.denominationName,
        channel: 'gmail',
        channelTarget: completedOrder.customerEmail || user.email,
        type: 'ORDER_DELIVERED',
        title: `Order Delivered: ${completedOrder.gameTitle} (${completedOrder.denominationName})`,
        message: `Your top-up for ${completedOrder.gameTitle} (${completedOrder.denominationName}) was delivered within 2-3 minutes to recipient ID ${completedOrder.ignValidated || completedOrder.userId}. Official receipt sent to ${completedOrder.customerEmail || user.email}.`,
        timestamp: nowIso,
        read: false,
        previewData: {
          orderNumber: completedOrder.orderNumber,
          gameTitle: completedOrder.gameTitle,
          denomination: completedOrder.denominationName,
          recipientId: `${completedOrder.userId} (${completedOrder.ignValidated || 'Player'})`,
          amount: formatCurrency(completedOrder.totalIDR, currentCurrency),
          serialNumber: completedOrder.serialNumber,
          voucherCode: completedOrder.voucherCode,
          points: earnedPoints,
        },
      },
      {
        id: `notif-sms-${Date.now() + 1}`,
        orderId: completedOrder.id,
        orderNumber: completedOrder.orderNumber,
        gameTitle: completedOrder.gameTitle,
        denominationName: completedOrder.denominationName,
        channel: 'phone_sms',
        channelTarget: completedOrder.customerPhone || user.phone || '+977 9801234567',
        type: 'ORDER_DELIVERED',
        title: `SMS Confirmation: Order #${completedOrder.orderNumber}`,
        message: `[UniPin SMS] Order #${completedOrder.orderNumber} delivered in 2.8s. ${completedOrder.denominationName} credited to UID ${completedOrder.userId}. +${earnedPoints} UniPoints earned.`,
        timestamp: nowIso,
        read: false,
      },
      {
        id: `notif-tg-${Date.now() + 2}`,
        orderId: completedOrder.id,
        orderNumber: completedOrder.orderNumber,
        gameTitle: completedOrder.gameTitle,
        denominationName: completedOrder.denominationName,
        channel: 'telegram',
        channelTarget: completedOrder.customerTelegram || user.telegramUsername || '@bibash_gamer',
        type: 'ORDER_DELIVERED',
        title: `Telegram Bot: ${completedOrder.gameTitle} Dispatched ⚡`,
        message: `🤖 UniPin Dispatcher Bot: Order ${completedOrder.orderNumber} successfully delivered to ${completedOrder.ignValidated || completedOrder.userId}! Full serial: ${completedOrder.serialNumber || 'SN-AUTO-2026'}.`,
        timestamp: nowIso,
        read: false,
      },
    ];

    setNotifications((prev) => [...newNotifications, ...prev]);

    // Trigger Toast banner
    setActiveToastNotification(newNotifications[0]);

    // Open Live Order Delivery Tracker Modal (with fast-forward option and live SLA)
    setActiveTrackingOrder(completedOrder);
  };

  // Complete Delivery Callback from Tracker Modal
  const handleCompleteDelivery = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'COMPLETED' as OrderStatus } : o))
    );
  };

  // Notification actions
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: OrderNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
  };

  const handleSelectReceiptByOrderNumber = (orderNumber: string) => {
    const found = orders.find((o) => o.orderNumber === orderNumber);
    if (found) {
      setIsNotificationModalOpen(false);
      setCompletedOrderForReceipt(found);
    }
  };

  // Handle UniPoints Reward Claim
  const handleRedeemUniPointsReward = (reward: UniPointsRewardItem) => {
    if ((user.uniPointsBalance ?? 0) < reward.pointsCost) return;

    setUser((prev) => {
      const updatedPoints = Math.max(0, (prev.uniPointsBalance ?? 0) - reward.pointsCost);
      let updatedCredits = prev.unipinCreditsIDR;
      const updatedClaimed = [...(prev.claimedVouchers || [])];

      if (reward.type === 'game_credit' && reward.valueAmountIDR) {
        // Direct UC wallet deposit
        updatedCredits += reward.valueAmountIDR;
      } else {
        // Voucher or tier pass
        const newVoucherCode = `${reward.codePrefix || 'UNIPT'}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        updatedClaimed.unshift({
          id: `claim-${Date.now()}`,
          code: newVoucherCode,
          title: reward.title,
          discountPercent: reward.discountPercent,
          valueAmountIDR: reward.valueAmountIDR,
          claimedAt: new Date().toISOString(),
          isUsed: false,
        });
      }

      return {
        ...prev,
        uniPointsBalance: updatedPoints,
        unipinCreditsIDR: updatedCredits,
        claimedVouchers: updatedClaimed,
      };
    });
  };

  // Handle Wallet Reload
  const handleWalletReload = (amountIDR: number) => {
    setUser((prev) => ({
      ...prev,
      unipinCreditsIDR: prev.unipinCreditsIDR + amountIDR,
    }));
  };

  // Handle Voucher Code Redemption
  const handleVoucherRedeemed = (amountIDR: number, voucherCode: string) => {
    setUser((prev) => ({
      ...prev,
      unipinCreditsIDR: prev.unipinCreditsIDR + amountIDR,
    }));
  };

  // Admin Order Status Update
  const handleAdminUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => 
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Handle Game Selection for Top-Up Modal
  const handleSelectGame = (gameOrId: GameProduct | string) => {
    if (typeof gameOrId === 'string') {
      const found = games.find((g) => g.id === gameOrId);
      if (found) {
        setSelectedGameForTopUp(found);
      }
    } else if (gameOrId) {
      setSelectedGameForTopUp(gameOrId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 1. Header & Navigation Bar */}
      <Navbar
        user={user}
        ordersCount={orders.length}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        currentCurrency={currentCurrency}
        onCurrencyChange={setCurrentCurrency}
        onSelectCurrency={setCurrentCurrency}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenVoucherRedeem={() => setIsVoucherModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenUniPointsModal={() => setIsUniPointsModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* 2. Hero Banner & Flash Sales Carousel */}
        <HeroBanner
          flashSaleGames={flashSaleGames}
          currentCurrency={currentCurrency}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickSearchTag={(tag) => setSearchQuery(tag)}
          onSelectGame={handleSelectGame}
        />

        {/* 3. Value Proposition Bar (Wholesale Low Price, 24/7 AI, Instant SLA) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Guaranteed Low Price</div>
              <div className="text-[11px] text-slate-400">Up to 35% Wholesale Rebates</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Instant API Injection</div>
              <div className="text-[11px] text-slate-400">Direct Server Delivery &lt; 5s</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% Anti-Ban Official</div>
              <div className="text-[11px] text-slate-400">Official Publisher Distributor</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">24/7 AI Concierge</div>
              <div className="text-[11px] text-slate-400">Automated Receipts & Chat</div>
            </div>
          </div>
        </section>

        {/* 4. Products & Game Catalog Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {selectedCategory === 'all' ? 'All Top-Up Products & Vouchers' : `${selectedCategory.replace('_', ' ').toUpperCase()}`}
                </h3>
                <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredGames.length} Items
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your favorite game, input in-game ID, and checkout securely with multi-currency support.
              </p>
            </div>

            {/* Category Quick Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory('direct_topup')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedCategory === 'direct_topup'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                }`}
              >
                Direct Top-Up
              </button>
              <button
                onClick={() => setSelectedCategory('game_voucher')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedCategory === 'game_voucher'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                }`}
              >
                Vouchers
              </button>
              <button
                onClick={() => setSelectedCategory('entertainment')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedCategory === 'entertainment'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                }`}
              >
                Digital Pass
              </button>
            </div>
          </div>

          {/* Game Cards Grid */}
          {filteredGames.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-3xl border border-slate-800">
              <Ticket className="w-12 h-12 mx-auto text-orange-500/50" />
              <div className="text-base font-bold text-white">No game found for "{searchQuery}"</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for "Mobile Legends", "Free Fire", "Genshin", "Steam", or "UniPin Voucher".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  currentCurrency={currentCurrency}
                  onSelect={(g) => setSelectedGameForTopUp(g)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 5. Payment Gateway Support Showcase */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-400" />
                Integrated Multi-Currency Payment Gateway Channels
              </h4>
              <p className="text-xs text-slate-400">
                Pay securely with QRIS, GoPay, DANA, Virtual Accounts (BCA, Mandiri, BRI, BNI), Indomaret, Alfamart, & Visa/Mastercard.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> 0% Admin Fee with UC Wallet
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 flex items-center gap-2"
              >
                <span>{pm.logo}</span>
                <span>{pm.name}</span>
                {pm.badge && (
                  <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded">
                    {pm.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 6. Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 mt-12 py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-base">
                U
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                UniPin<span className="text-orange-500">.TopUp</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Leading gaming top-up distributor with wholesale low prices, automated instant API delivery, multi-currency conversion, and 24/7 AI-assisted customer support.
            </p>
            <div className="text-[10px] text-slate-500">
              © 2026 PT UniPin Voucher Digital. All rights reserved.
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white mb-2.5 text-xs uppercase tracking-wider">
              Popular Games
            </h5>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => setSelectedGameForTopUp(games[0])} className="hover:text-orange-400 transition-colors">Mobile Legends: Bang Bang</button></li>
              <li><button onClick={() => setSelectedGameForTopUp(games[1])} className="hover:text-orange-400 transition-colors">Free Fire MAX Diamonds</button></li>
              <li><button onClick={() => setSelectedGameForTopUp(games[2])} className="hover:text-orange-400 transition-colors">Genshin Impact Genesis Crystals</button></li>
              <li><button onClick={() => setSelectedGameForTopUp(games[3])} className="hover:text-orange-400 transition-colors">Valorant VP Points</button></li>
              <li><button onClick={() => setSelectedGameForTopUp(games[6])} className="hover:text-orange-400 transition-colors">Official UniPin Voucher Code</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-2.5 text-xs uppercase tracking-wider">
              Security & Guarantees
            </h5>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Anti-Ban Guarantee</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-orange-400" /> Instant SLA &lt; 5 Seconds</li>
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-cyan-400" /> 256-Bit SSL Encrypted Gateways</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated PDF & E-Receipts</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-2.5 text-xs uppercase tracking-wider">
              Quick Admin & Member Tools
            </h5>
            <div className="space-y-2">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-400 border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Merchant Portal (PIN: 8899)</span>
              </button>
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-orange-300 border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Redeem UniPin Voucher PIN</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Modals */}
      {/* 1. Top-Up Order Configuration Modal */}
      {selectedGameForTopUp && (
        <TopUpModal
          game={selectedGameForTopUp}
          onClose={() => setSelectedGameForTopUp(null)}
          currentCurrency={currentCurrency}
          paymentMethods={paymentMethods}
          user={user}
          onInitiatePayment={handleInitiatePayment}
          onOpenWalletModal={() => {
            setSelectedGameForTopUp(null);
            setIsWalletModalOpen(true);
          }}
        />
      )}

      {/* 2. Payment Gateway Modal */}
      {orderDraft && (
        <PaymentModal
          orderDraft={orderDraft}
          onClose={() => setOrderDraft(null)}
          onPaymentSuccess={handlePaymentSuccess}
          currentCurrency={currentCurrency}
        />
      )}

      {/* 3. Printable E-Receipt Modal */}
      {completedOrderForReceipt && (
        <ReceiptModal
          order={completedOrderForReceipt}
          onClose={() => setCompletedOrderForReceipt(null)}
          currentCurrency={currentCurrency}
        />
      )}

      {/* 4. Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={orders}
        currentCurrency={currentCurrency}
        onSelectReceipt={(ord) => {
          setIsHistoryOpen(false);
          setCompletedOrderForReceipt(ord);
        }}
      />

      {/* 5. Wallet Reload Modal */}
      <WalletTopUpModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        user={user}
        currentCurrency={currentCurrency}
        paymentMethods={paymentMethods}
        onTopUpSuccess={handleWalletReload}
      />

      {/* 6. Voucher Redemption Modal */}
      <VoucherRedeemModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        user={user}
        currentCurrency={currentCurrency}
        onRedeemSuccess={handleVoucherRedeemed}
      />

      {/* 7. Member Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        currentCurrency={currentCurrency}
        onUpdateUser={setUser}
      />

      {/* 7.5 UniPoints Loyalty Program Modal */}
      <UniPointsModal
        isOpen={isUniPointsModalOpen}
        onClose={() => setIsUniPointsModalOpen(false)}
        user={user}
        currentCurrency={currentCurrency}
        onRedeemReward={handleRedeemUniPointsReward}
        onOpenTopUpForGame={(gameId) => {
          setIsUniPointsModalOpen(false);
          handleSelectGame(gameId);
        }}
      />

      {/* 7.8 Real-Time Order Notifications Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
        onSelectReceipt={handleSelectReceiptByOrderNumber}
        onNotificationClick={handleNotificationClick}
        user={user}
      />

      {/* 7.9 Live 2-3 Min Delivery SLA Order Tracker Modal */}
      <LiveOrderTrackerModal
        order={activeTrackingOrder}
        onClose={() => setActiveTrackingOrder(null)}
        currentCurrency={currentCurrency}
        onCompleteDelivery={handleCompleteDelivery}
        onViewReceipt={(ord) => {
          setActiveTrackingOrder(null);
          setCompletedOrderForReceipt(ord);
        }}
        user={user}
      />

      {/* 7.95 Real-Time Toast Notification Popup */}
      <NotificationToast
        notification={activeToastNotification}
        onClose={() => setActiveToastNotification(null)}
        onClick={(notif) => {
          setActiveToastNotification(null);
          if (notif.orderNumber) {
            handleSelectReceiptByOrderNumber(notif.orderNumber);
          } else {
            setIsNotificationModalOpen(true);
          }
        }}
      />

      {/* 8. Admin Control Hub */}
      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        orders={orders}
        games={games}
        paymentMethods={paymentMethods}
        currentCurrency={currentCurrency}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onUpdateGames={setGames}
        onUpdatePayments={setPaymentMethods}
        onSelectReceipt={(ord) => {
          setIsAdminModalOpen(false);
          setCompletedOrderForReceipt(ord);
        }}
      />

      {/* 9. 24/7 AI Customer Support Floating Widget */}
      <ChatAssistant
        orders={orders}
        currentCurrency={currentCurrency}
      />

    </div>
  );
}
