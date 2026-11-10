import { ExpenseItem, TripMember, DebtSettlement } from '../types';

export interface CalculatedSettlement extends DebtSettlement {
  id: string;
  fromId: string;
  toId: string;
  amount: number; // In minor units (e.g. 125000 = ₹1,250.00)
  status: 'pending' | 'settled';
}

/**
 * Calculates net balances and generates the minimal set of debt settlements.
 * Uses strict integer arithmetic so totals balance exactly down to the last minor unit.
 * Matches the biggest debtor with the biggest creditor repeatedly (greedy cash flow minimization).
 */
export function calculateDebtSettlements(
  members: TripMember[],
  expenses: ExpenseItem[]
): CalculatedSettlement[] {
  const memberCount = members.length;
  if (memberCount <= 1 || expenses.length === 0) return [];

  // Sort members deterministically by ID
  const sortedMembers = [...members].sort((a, b) => a.id.localeCompare(b.id));

  // 1. Calculate total paid by each member in integer minor units
  const paidMap: { [memberId: string]: number } = {};
  sortedMembers.forEach((m) => {
    paidMap[m.id] = 0;
  });

  let totalTripMinor = 0;
  expenses.forEach((expense) => {
    const payerId = expense.paidBy || (expense as any).paidById;
    const amt = Math.round(expense.amount || 0);
    totalTripMinor += amt;
    if (payerId && paidMap[payerId] !== undefined) {
      paidMap[payerId] += amt;
    }
  });

  if (totalTripMinor <= 0) return [];

  // 2. Strict integer division for equal sharing
  // Base share = floor(total / N), distribute the remainder R to first R members
  const baseShare = Math.floor(totalTripMinor / memberCount);
  const remainder = totalTripMinor - baseShare * memberCount;

  const netBalances: { [memberId: string]: number } = {};
  sortedMembers.forEach((m, idx) => {
    const fairShare = baseShare + (idx < remainder ? 1 : 0);
    netBalances[m.id] = paidMap[m.id] - fairShare;
  });

  // 3. Separate into debtors (net < 0) and creditors (net > 0)
  interface PersonBalance {
    id: string;
    amount: number; // in integer minor units
  }

  const debtors: PersonBalance[] = [];
  const creditors: PersonBalance[] = [];

  Object.entries(netBalances).forEach(([id, net]) => {
    if (net < 0) {
      debtors.push({ id, amount: Math.abs(net) });
    } else if (net > 0) {
      creditors.push({ id, amount: net });
    }
  });

  // 4. Greedy matching: biggest debtor with biggest creditor
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: CalculatedSettlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleMinor = Math.min(debtor.amount, creditor.amount);

    if (settleMinor > 0) {
      settlements.push({
        id: `settle_${debtor.id}_${creditor.id}`,
        fromId: debtor.id,
        toId: creditor.id,
        amount: settleMinor,
        status: 'pending',
      });
    }

    debtor.amount -= settleMinor;
    creditor.amount -= settleMinor;

    if (debtor.amount <= 0) dIdx++;
    if (creditor.amount <= 0) cIdx++;
  }

  return settlements;
}
