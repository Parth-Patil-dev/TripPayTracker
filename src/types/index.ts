export type ExpenseCategory = 
  | 'Food' 
  | 'Stay' 
  | 'Travel' 
  | 'Fuel' 
  | 'Shopping' 
  | 'Tickets' 
  | 'Other';

export interface TripData {
  id: string;
  name: string;
  baseCurrency: string;
  joinCode: string;
  createdAt?: any;
  createdByUid?: string;
}

export interface SavedTripInfo {
  id: string;
  name: string;
  baseCurrency: string;
  joinCode: string;
}

export interface TripMember {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  role?: string;
  uid?: string;
  joinedAt?: any;
  avatarColor: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number; // Converted base amount in integer minor units (e.g. 15000 = 150.00 baseCurrency)
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paidBy: string; // Member ID who paid
  createdBy: string; // Auth UID who created the expense
  createdAt?: any;
  // Multi-currency support
  currency?: string; // Foreign currency code or base currency (e.g. "USD", "EUR", "INR")
  originalAmount?: number; // Original amount in integer minor units of `currency` (e.g. 5000 = $50.00)
  exchangeRate?: number; // 1 unit of foreign currency = exchangeRate units of trip base currency
  // Receipt photo
  receiptImage?: string; // Compressed base64 JPEG data URL (<= 800px, 0.6 quality)
}

export interface MemberBalance {
  memberId: string;
  paid: number;
  owes: number;
  net: number;
}

export interface DebtSettlement {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  status: 'pending' | 'settled';
}

export type TabType = 'overview' | 'expenses' | 'balances' | 'settle';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  THB: '฿',
};

export function getCurrencySymbol(code: string = 'INR'): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] || `${code} `;
}

/**
 * Formats minor units (e.g. 25050 paise) into major display string (250.50)
 */
export function formatMinorUnits(amountInMinorUnits: number, currencySymbol: string = '₹'): string {
  const major = (amountInMinorUnits || 0) / 100;
  return `${currencySymbol}${major.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
