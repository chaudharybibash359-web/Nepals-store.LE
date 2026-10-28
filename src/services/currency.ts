import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    flag: '🇮🇩',
    rateAgainstIDR: 1,
    decimalPlaces: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rateAgainstIDR: 16200,
    decimalPlaces: 2,
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    flag: '🇵🇭',
    rateAgainstIDR: 285,
    decimalPlaces: 2,
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    flag: '🇲🇾',
    rateAgainstIDR: 3750,
    decimalPlaces: 2,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    flag: '🇹🇭',
    rateAgainstIDR: 470,
    decimalPlaces: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    rateAgainstIDR: 12450,
    decimalPlaces: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rateAgainstIDR: 192,
    decimalPlaces: 2,
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    flag: '🇧🇷',
    rateAgainstIDR: 2950,
    decimalPlaces: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rateAgainstIDR: 17500,
    decimalPlaces: 2,
  },
  NPR: {
    code: 'NPR',
    symbol: 'रू',
    name: 'Nepalese Rupee',
    flag: '🇳🇵',
    rateAgainstIDR: 120, // 1 NPR approx 120 IDR
    decimalPlaces: 2,
  },
};

export function convertFromIDR(amountIDR: number, targetCurrency: CurrencyCode): number {
  const config = CURRENCY_CONFIGS[targetCurrency] || CURRENCY_CONFIGS.IDR;
  if (config.rateAgainstIDR === 1) {
    return Math.round(amountIDR);
  }
  const converted = amountIDR / config.rateAgainstIDR;
  return Number(converted.toFixed(config.decimalPlaces));
}

export function convertToIDR(amountTargetCurrency: number, sourceCurrency: CurrencyCode): number {
  const config = CURRENCY_CONFIGS[sourceCurrency] || CURRENCY_CONFIGS.IDR;
  return Math.round(amountTargetCurrency * config.rateAgainstIDR);
}

export function formatCurrency(amount: number, currency: CurrencyCode, isAlreadyTargetCurrency = false): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.IDR;
  const val = isAlreadyTargetCurrency ? amount : convertFromIDR(amount, currency);

  if (config.code === 'IDR') {
    return `${config.symbol} ${new Intl.NumberFormat('id-ID').format(Math.round(val))}`;
  }

  return `${config.symbol}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  }).format(val)}`;
}
