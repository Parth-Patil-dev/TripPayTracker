import { ExpenseItem, TripMember } from '../types';

/**
 * Escapes a cell value according to RFC 4180 CSV standard.
 * If value contains comma, quotes, or newlines, enclose in quotes and double existing quotes.
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports expenses of the current trip to a downloadable CSV file.
 * Columns: Date, Title, Category, Paid by, Amount, Currency, Converted Amount, Exchange Rate
 */
export function exportExpensesToCSV(
  expenses: ExpenseItem[],
  members: TripMember[],
  tripName: string = 'Trip',
  baseCurrency: string = 'INR'
): void {
  // Map member IDs to member names
  const memberMap = new Map<string, string>();
  members.forEach((m) => {
    memberMap.set(m.id, m.name || m.shortName || 'Member');
  });

  const headers = [
    'Date',
    'Title',
    'Category',
    'Paid by',
    'Amount',
    'Currency',
    'Converted Amount',
    'Base Currency',
    'Exchange Rate',
  ];

  const rows = expenses.map((exp) => {
    const payerName = memberMap.get(exp.paidBy) || exp.paidBy || 'Unknown';
    const currency = exp.currency || baseCurrency;
    
    // Original major amount
    const originalMajor = exp.originalAmount !== undefined
      ? (exp.originalAmount / 100).toFixed(2)
      : (exp.amount / 100).toFixed(2);

    // Converted base amount
    const convertedMajor = (exp.amount / 100).toFixed(2);
    const rate = exp.exchangeRate !== undefined ? exp.exchangeRate : 1.0;

    return [
      escapeCsvCell(exp.date),
      escapeCsvCell(exp.title),
      escapeCsvCell(exp.category),
      escapeCsvCell(payerName),
      escapeCsvCell(originalMajor),
      escapeCsvCell(currency),
      escapeCsvCell(convertedMajor),
      escapeCsvCell(baseCurrency),
      escapeCsvCell(rate),
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\r\n');

  // Prefix with \uFEFF UTF-8 BOM so Excel properly recognises UTF-8 encoding
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Trigger download
  const dateStr = new Date().toISOString().split('T')[0];
  const safeTripName = tripName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeTripName}_expenses_${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
