import React, { useMemo } from 'react';
import { 
  TripMember, 
  ExpenseItem, 
  formatMinorUnits 
} from '../types';
import { StatCard } from '../components/StatCard';
import { SpendingChart } from '../components/SpendingChart';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { PrimaryButton } from '../components/PrimaryButton';
import { getCategoryIcon } from './ExpensesScreen';
import { 
  DollarSign, 
  Wallet, 
  Receipt, 
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';

interface OverviewScreenProps {
  tripName: string;
  expenses: ExpenseItem[];
  members: TripMember[];
  currencySymbol?: string;
  onOpenAddExpense: () => void;
  onNavigateToTab: (tab: 'expenses' | 'balances' | 'settle') => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  tripName,
  expenses,
  members,
  currencySymbol = '₹',
  onOpenAddExpense,
  onNavigateToTab,
}) => {
  const memberCount = Math.max(1, members.length);
  const totalSpentMinor = expenses.reduce((sum, item) => sum + item.amount, 0);
  const fairShareMinor = totalSpentMinor / memberCount;

  // Today's date calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todaySpentMinor = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Distinct days with expenses
  const uniqueDates = Array.from(new Set(expenses.map((e) => e.date || todayStr)));
  const dayCount = Math.max(1, uniqueDates.length);
  const dailyAverageMinor = totalSpentMinor / dayCount;

  // Delta calculation for Total Spent card
  const todayVsAvgText = useMemo(() => {
    if (expenses.length === 0) return 'New Trip';
    if (todaySpentMinor > 0) {
      if (dailyAverageMinor > 0) {
        const diffPercent = Math.round(((todaySpentMinor - dailyAverageMinor) / dailyAverageMinor) * 100);
        if (diffPercent > 0) return `+${diffPercent}% today`;
        if (diffPercent < 0) return `${diffPercent}% today`;
      }
      return `${formatMinorUnits(todaySpentMinor, currencySymbol)} today`;
    }
    return `Avg ${formatMinorUnits(dailyAverageMinor, currencySymbol)}/day`;
  }, [expenses.length, todaySpentMinor, dailyAverageMinor, currencySymbol]);

  // Delta for Your Share
  const yourShareDeltaText = `Equal (1/${memberCount})`;

  // Delta for Expenses Count
  const expenseCountDeltaText = todayExpenses.length > 0 
    ? `+${todayExpenses.length} today` 
    : `${dayCount} ${dayCount === 1 ? 'day' : 'days'}`;

  // Generate dynamic chart data sorted chronologically
  const chartPoints = useMemo(() => {
    if (expenses.length === 0) {
      return [
        { day: 'Day 1', label: 'Start', amount: 0, cumulative: 0 },
        { day: 'Today', label: 'Today', amount: 0, cumulative: 0 },
      ];
    }

    // Group expenses by date
    const dateMap: { [date: string]: number } = {};
    expenses.forEach((e) => {
      const d = e.date || todayStr;
      dateMap[d] = (dateMap[d] || 0) + (e.amount / 100); // in major units for chart
    });

    const sortedDates = Object.keys(dateMap).sort((a, b) => a.localeCompare(b));
    let cumulative = 0;

    return sortedDates.map((dStr, idx) => {
      const amt = dateMap[dStr];
      cumulative += amt;
      const parts = dStr.split('-');
      const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : dStr;
      return {
        day: `Day ${idx + 1}`,
        label,
        amount: Math.round(amt),
        cumulative: Math.round(cumulative),
      };
    });
  }, [expenses, todayStr]);

  return (
    <div className="space-y-4 px-4 pb-28">
      {/* Primary Action Button */}
      <div className="flex justify-center pt-1">
        <PrimaryButton onClick={onOpenAddExpense} fullWidth>
          Quick Add Trip Expense
        </PrimaryButton>
      </div>

      {/* THREE STAT CARDS (Total spent, Your share, Expenses count) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* 1. Highlighted Lime Card: Total Spent */}
        <StatCard
          icon={<DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />}
          label="Total spent"
          value={formatMinorUnits(totalSpentMinor, currencySymbol)}
          changeBadgeText={todayVsAvgText}
          isPositiveChange={true}
          isHighlighted={true}
        />

        {/* 2. Soft Gray Card: Your Share */}
        <StatCard
          icon={<Wallet className="w-3.5 h-3.5 stroke-[2.5]" />}
          label="Your share"
          value={formatMinorUnits(fairShareMinor, currencySymbol)}
          changeBadgeText={yourShareDeltaText}
          isPositiveChange={true}
          isHighlighted={false}
        />

        {/* 3. Soft Gray Card: Expenses Count */}
        <StatCard
          icon={<Receipt className="w-3.5 h-3.5 stroke-[2.5]" />}
          label="Expenses"
          value={expenses.length.toString()}
          changeBadgeText={expenseCountDeltaText}
          isPositiveChange={true}
          isHighlighted={false}
        />
      </div>

      {/* Line Chart with Gradient Fill of Spending per Day */}
      <SpendingChart data={chartPoints} currencySymbol={currencySymbol} />

      {/* Category Breakdown (Horizontal bars with amounts & percentages) */}
      <CategoryBreakdown expenses={expenses} currencySymbol={currencySymbol} />

      {/* Recent Expenses List Preview */}
      <div className="bg-white rounded-[22px] p-4.5 border border-black/5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-xs font-bold text-[#0B0B0B] uppercase tracking-tight">
              Recent Expenses
            </h3>
            <p className="text-[11px] text-black/50">Latest splits synced across phones</p>
          </div>
          <button
            onClick={() => onNavigateToTab('expenses')}
            className="text-xs font-bold text-[#0B0B0B] hover:text-[#3F6212] flex items-center gap-1 transition"
          >
            <span>View All ({expenses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-6 text-center text-xs text-black/40">
            No expenses logged yet. Tap the button above to record the first bill.
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {expenses.slice(0, 4).map((item) => {
              const payer = members.find((m) => m.id === item.paidBy);
              const userIsPayer = payer?.isCurrentUser;

              return (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#F4F4F2] text-[#0B0B0B] flex items-center justify-center shrink-0 border border-black/5">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0B0B0B] truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-medium text-black/55">
                          {payer ? (userIsPayer ? 'You paid' : `${payer.shortName} paid`) : 'Paid'}
                        </span>
                        <span className="text-black/30">•</span>
                        <span className="text-[10px] font-bold text-[#3F6212] bg-[#E6FCB0] px-1.5 py-0.2 rounded-md">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-[#0B0B0B]">
                      {formatMinorUnits(item.amount, currencySymbol)}
                    </div>
                    <div className="text-[10px] font-semibold text-black/45">
                      {formatMinorUnits(item.amount / memberCount, currencySymbol)} / ea
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
