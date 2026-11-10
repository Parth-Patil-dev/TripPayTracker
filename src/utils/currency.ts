export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const POPULAR_CURRENCIES: CurrencyOption[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR', flag: '🇶🇦' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
];

/**
 * Approximate fallback rates against USD in case user has no internet access
 */
const APPROX_USD_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 84.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  THB: 35.0,
  SGD: 1.34,
  JPY: 154.0,
  AUD: 1.52,
  CAD: 1.38,
  CHF: 0.88,
  MYR: 4.45,
  IDR: 15900,
  VND: 25400,
  NZD: 1.68,
  SAR: 3.75,
  QAR: 3.64,
  TRY: 34.5,
  CNY: 7.24,
  KRW: 1390,
};

export function getCurrencyInfo(code: string = 'INR'): CurrencyOption {
  const upper = (code || 'INR').toUpperCase().trim();
  const found = POPULAR_CURRENCIES.find((c) => c.code === upper);
  if (found) return found;
  return {
    code: upper,
    name: upper,
    symbol: `${upper} `,
    flag: '🌐',
  };
}

/**
 * Calculates converted amount in base currency minor units
 * (e.g. 5000 minor * 84.5 rate = 422500 minor)
 */
export function calculateConvertedMinorUnits(
  originalMinorUnits: number,
  exchangeRate: number
): number {
  if (!originalMinorUnits || originalMinorUnits <= 0) return 0;
  if (!exchangeRate || exchangeRate <= 0) return originalMinorUnits;
  return Math.round(originalMinorUnits * exchangeRate);
}

/**
 * Tries to fetch live exchange rate from Frankfurter API with fallback to Open Exchange Rates API.
 * Rate returned is: 1 unit of `fromCurrency` = X units of `toCurrency`.
 * Returns null if network fails or pairs unavailable, allowing manual override.
 */
export async function fetchLiveExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<{ rate: number; source: 'frankfurter' | 'open-exchange' | 'cached' } | null> {
  const from = fromCurrency.toUpperCase().trim();
  const to = toCurrency.toUpperCase().trim();

  if (from === to) {
    return { rate: 1.0, source: 'cached' };
  }

  // Attempt 1: Frankfurter API (fast, reliable, free, ECB data)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && typeof data.rates[to] === 'number') {
        return { rate: Number(data.rates[to]), source: 'frankfurter' };
      }
    }
  } catch (e) {
    // Silently continue to fallback
  }

  // Attempt 2: open.er-api.com (covers wider set including AED, SAR, etc.)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && typeof data.rates[to] === 'number') {
        return { rate: Number(data.rates[to]), source: 'open-exchange' };
      }
    }
  } catch (e) {
    // Silently continue to fallback
  }

  // Attempt 3: Approximate offline estimation if available
  if (APPROX_USD_RATES[from] && APPROX_USD_RATES[to]) {
    const rateFromUSD = APPROX_USD_RATES[from];
    const rateToUSD = APPROX_USD_RATES[to];
    // from -> USD -> to: (1 / rateFromUSD) * rateToUSD
    const estimated = rateToUSD / rateFromUSD;
    return {
      rate: Number(estimated.toFixed(4)),
      source: 'cached',
    };
  }

  return null;
}
