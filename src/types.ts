export type CurrencyCode = 'IDR' | 'USD' | 'PHP' | 'MYR' | 'THB' | 'SGD' | 'INR' | 'BRL' | 'EUR' | 'NPR';

export type AuthProvider = 'google' | 'phone' | 'facebook' | 'twitter' | 'telegram' | 'apple' | 'email';

export type NotificationChannel = 'gmail' | 'phone_sms' | 'telegram' | 'facebook' | 'twitter' | 'system';

export interface LinkedAccount {
  provider: AuthProvider;
  identifier: string;
  displayName?: string;
  avatarUrl?: string;
  linkedAt: string;
}

export interface OrderNotification {
  id: string;
  orderId?: string;
  orderNumber?: string;
  gameTitle?: string;
  denominationName?: string;
  channel: NotificationChannel;
  channelTarget: string;
  type: 'ORDER_PROCESSING' | 'ORDER_DELIVERED' | 'UNIPOINTS_EARNED' | 'VOUCHER_CLAIMED' | 'SECURITY';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  previewData?: {
    orderNumber?: string;
    gameTitle?: string;
    denomination?: string;
    recipientId?: string;
    amount?: string;
    serialNumber?: string;
    voucherCode?: string;
    points?: number;
  };
}

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateAgainstIDR: number; // e.g. 1 USD = 16,200 IDR
  decimalPlaces: number;
}

export type GameCategory = 'all' | 'direct_topup' | 'game_voucher' | 'entertainment' | 'flash_sale';

export interface DenominationItem {
  id: string;
  name: string; // e.g. "86 Diamonds (78 + 8 Bonus)"
  basePriceIDR: number;
  discountPercentage?: number;
  isPopular?: boolean;
  bonusText?: string;
  icon?: string;
  uniPointsReward?: number;
  exclusiveVipTier?: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
}

export interface GameProduct {
  id: string;
  title: string;
  publisher: string;
  category: 'direct_topup' | 'game_voucher' | 'entertainment';
  thumbnailUrl: string;
  bannerUrl: string;
  inputConfig: {
    userIdLabel: string;
    userIdPlaceholder: string;
    hasZoneId?: boolean;
    zoneIdLabel?: string;
    zoneIdPlaceholder?: string;
    hasServerSelect?: boolean;
    serverOptions?: string[];
    guideText?: string;
  };
  denominations: DenominationItem[];
  isFlashDeal?: boolean;
  flashDiscount?: number;
  deliveryTime: string; // e.g. "Instant (< 5 sec)"
  rating: number;
  reviewCount: number;
  instructions: string[];
}

export type PaymentCategory = 'unipin_wallet' | 'nepal_wallet' | 'crypto_web3' | 'qris_ewallet' | 'virtual_account' | 'retail_store' | 'voucher_code' | 'credit_card';

export interface PaymentMethod {
  id: string;
  name: string;
  category: PaymentCategory;
  logo: string;
  feePercentage: number;
  feeFixedIDR: number;
  minAmountIDR: number;
  maxAmountIDR: number;
  supportedCurrencies: CurrencyCode[];
  isInstant: boolean;
  instructionText: string;
  badge?: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderNumber: string; // e.g. "UNP-20260827-8912"
  createdAt: string;
  gameId: string;
  gameTitle: string;
  denominationId: string;
  denominationName: string;
  userId: string;
  zoneId?: string;
  server?: string;
  ignValidated?: string;
  customerEmail: string;
  customerPhone?: string;
  currency: CurrencyCode;
  amountIDR: number;
  amountTargetCurrency: number;
  discountAmountIDR: number;
  feeIDR: number;
  totalIDR: number;
  totalTargetCurrency: number;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentCategory: PaymentCategory;
  status: OrderStatus;
  serialNumber?: string;
  voucherCode?: string;
  emailReceiptSent: boolean;
  notes?: string;
  uniPointsEarned?: number;
  uniPointsRedeemed?: number;
  pointsDiscountIDR?: number;
  customerTelegram?: string;
  customerFacebook?: string;
  customerTwitter?: string;
  deliveryStartedAt?: string;
  deliveryCompletedAt?: string;
  deliveryEstimatedSeconds?: number;
  deliveryProgressPercent?: number;
  dispatchedChannels?: NotificationChannel[];
}

export interface UniPointsRewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'voucher_discount' | 'game_credit' | 'exclusive_tier';
  valueAmountIDR?: number;
  discountPercent?: number;
  codePrefix?: string;
  badge?: string;
  icon?: string;
  targetGameId?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  provider?: AuthProvider;
  linkedAccounts?: LinkedAccount[];
  notificationChannels?: NotificationChannel[];
  telegramUsername?: string;
  facebookHandle?: string;
  twitterHandle?: string;
  unipinCreditsIDR: number;
  uniPointsBalance: number;
  totalPointsEarned: number;
  vipTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  totalSpendIDR: number;
  totalOrdersCount: number;
  role: 'user' | 'admin';
  claimedVouchers?: {
    id: string;
    code: string;
    title: string;
    discountPercent?: number;
    valueAmountIDR?: number;
    claimedAt: string;
    isUsed: boolean;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  timestamp: string;
  actionButtons?: {
    label: string;
    action: string;
    payload?: any;
  }[];
}

export interface AdminStats {
  totalRevenueIDR: number;
  totalOrdersCount: number;
  activeUsersCount: number;
  successRate: number;
  unipinPoolBalanceIDR: number;
  todaySalesIDR: number;
  todayOrdersCount: number;
}
