import { GameProduct, OrderItem, PaymentMethod, UserAccount, CurrencyCode, OrderNotification } from '../types';
import { INITIAL_GAMES, INITIAL_ORDERS, PAYMENT_METHODS, INITIAL_USER, INITIAL_NOTIFICATIONS } from '../data/mockData';

const KEYS = {
  USER: 'unipin_user_account_v1',
  ORDERS: 'unipin_orders_v1',
  GAMES: 'unipin_games_v1',
  PAYMENTS: 'unipin_payments_v1',
  CURRENCY: 'unipin_currency_v1',
  ADMIN_AUTH: 'unipin_admin_authenticated_v1',
  VOUCHER_POOL: 'unipin_voucher_pool_v1',
  NOTIFICATIONS: 'unipin_notifications_v1',
};

export function getStoredUser(): UserAccount {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_USER,
        ...parsed,
        uniPointsBalance: typeof parsed.uniPointsBalance === 'number' ? parsed.uniPointsBalance : (INITIAL_USER.uniPointsBalance ?? 480),
        totalPointsEarned: typeof parsed.totalPointsEarned === 'number' ? parsed.totalPointsEarned : (INITIAL_USER.totalPointsEarned ?? 1450),
        claimedVouchers: parsed.claimedVouchers || INITIAL_USER.claimedVouchers || [],
      };
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_USER;
}

export const getUserAccount = getStoredUser;

export function saveStoredUser(user: UserAccount): void {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
}

export const saveUserAccount = saveStoredUser;

export function getStoredOrders(): OrderItem[] {
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_ORDERS;
}

export function saveStoredOrders(orders: OrderItem[]): void {
  try {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredGames(): GameProduct[] {
  try {
    const raw = localStorage.getItem(KEYS.GAMES);
    if (raw) {
      const parsed: GameProduct[] = JSON.parse(raw);
      // Merge with initial games to guarantee inputConfig and denominations exist
      const mapped = parsed.map((pg) => {
        const fallback = INITIAL_GAMES.find((ig) => ig.id === pg.id);
        return {
          ...pg,
          inputConfig: pg.inputConfig || fallback?.inputConfig || {
            userIdLabel: 'Player ID / Email',
            userIdPlaceholder: 'Enter your ID',
            guideText: 'Check your account details before paying.',
          },
          denominations: pg.denominations && pg.denominations.length > 0
            ? pg.denominations
            : fallback?.denominations || [],
        };
      });

      // Ensure any newly added initial games (like poppo-live) exist
      INITIAL_GAMES.forEach((ig) => {
        if (!mapped.some((m) => m.id === ig.id)) {
          mapped.unshift(ig);
        }
      });

      return mapped;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_GAMES;
}

export function saveStoredGames(games: GameProduct[]): void {
  try {
    localStorage.setItem(KEYS.GAMES, JSON.stringify(games));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredPayments(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(KEYS.PAYMENTS);
    if (raw) {
      const parsed: PaymentMethod[] = JSON.parse(raw);
      const list = [...parsed];
      PAYMENT_METHODS.forEach((pm) => {
        if (!list.some((existing) => existing.id === pm.id)) {
          list.push(pm);
        }
      });
      return list;
    }
  } catch (e) {
    console.error(e);
  }
  return PAYMENT_METHODS;
}

export function saveStoredPayments(payments: PaymentMethod[]): void {
  try {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredCurrency(): CurrencyCode {
  try {
    const raw = localStorage.getItem(KEYS.CURRENCY);
    if (raw) return raw as CurrencyCode;
  } catch (e) {
    console.error(e);
  }
  return 'IDR';
}

export function saveStoredCurrency(currency: CurrencyCode): void {
  try {
    localStorage.setItem(KEYS.CURRENCY, currency);
  } catch (e) {
    console.error(e);
  }
}

export interface VoucherPoolItem {
  code: string;
  pin: string;
  denominationIDR: number;
  isUsed: boolean;
  usedAt?: string;
  orderNumber?: string;
}

const INITIAL_VOUCHERS: VoucherPoolItem[] = [
  { code: 'UNP-VCHR-9X82-K491-P028', pin: '88492019', denominationIDR: 100000, isUsed: true, usedAt: '2026-08-27T08:42:11Z', orderNumber: 'UNP-20260827-89102' },
  { code: 'UNP-VCHR-1102-M893-X741', pin: '19048201', denominationIDR: 50000, isUsed: false },
  { code: 'UNP-VCHR-8842-P993-Q105', pin: '74920184', denominationIDR: 100000, isUsed: false },
  { code: 'UNP-VCHR-3391-Z819-B662', pin: '38291047', denominationIDR: 20000, isUsed: false },
  { code: 'UNP-VCHR-7719-L028-V499', pin: '94820173', denominationIDR: 300000, isUsed: false },
  { code: 'UNP-VCHR-5501-A392-C119', pin: '61928405', denominationIDR: 500000, isUsed: false },
];

export function getVoucherPool(): VoucherPoolItem[] {
  try {
    const raw = localStorage.getItem(KEYS.VOUCHER_POOL);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_VOUCHERS;
}

export function saveVoucherPool(pool: VoucherPoolItem[]): void {
  try {
    localStorage.setItem(KEYS.VOUCHER_POOL, JSON.stringify(pool));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredNotifications(): OrderNotification[] {
  try {
    const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifications: OrderNotification[]): void {
  try {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error(e);
  }
}

