import React from 'react';
import { ExpenseItem, ExpenseCategory, formatMinorUnits } from '../types';
import { getCategoryIcon } from '../screens/ExpensesScreen';
import { PieChart, Tag } from 'lucide-react';

interface CategoryBreakdownProps {
  expenses: ExpenseItem[];
  currencySymbol?: string;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#C4F96B',
  Stay: '#0B0B0B',
  Travel: '#3F6212',
  Fuel: '#F59E0B',
  Shopping: '#8B5CF6',
  Tickets: '#06B6D4',
  Other: '#64748B',
};

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  expenses,
  currencySymbol = '₹',
}) => {
  const totalSpentMinor = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryTotals: Record<ExpenseCategory, number> = {
    Food: 0,
    Stay: 0,
    Travel: 0,
    Fuel: 0,
    Shopping: 0,
    Tickets: 0,
    Other: 0,
  };

  expenses.forEach((e) => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amount;
    } else {
      categoryTotals.Other += e.amount;
    }
  });

  // Filter to categories with spending > 0, sorted descending
  const sortedCategories = (Object.keys(categoryTotals) as ExpenseCategory[])
    .filter((cat) => categoryTotals[cat] > 0)
    .sort((a, b) => categoryTotals[b] - categoryTotals[a]);

  if (expenses.length === 0 || sortedCategories.length === 0) {
    return (
      <div className="bg-white rounded-[22px] p-5 border border-black/5 shadow-xs text-center">
        <div className="w-10 h-10 rounded-full bg-[#F4F4F2] flex items-center justify-center mx-auto text-black/40 mb-2">
          <PieChart className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-[#0B0B0B] uppercase tracking-wider">
          Category Breakdown
        </h4>
        <p className="text-[11px] text-black/45 mt-1">
          Add expenses to see category distribution
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[22px] p-4.5 border border-black/5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E6FCB0] flex items-center justify-center text-[#3F6212]">
            <PieChart className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0B0B0B] uppercase tracking-tight">
              Category Breakdown
            </h3>
            <p className="text-[11px] text-black/50">Where the money went</p>
          </div>
        </div>
        <span className="text-xs font-extrabold text-[#0B0B0B]">
          {sortedCategories.length} {sortedCategories.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      {/* Multi-segment distribution progress bar */}
      <div className="w-full h-3 rounded-full bg-[#F4F4F2] overflow-hidden flex mb-4 border border-black/5">
        {sortedCategories.map((cat) => {
          const amount = categoryTotals[cat];
          const pct = totalSpentMinor > 0 ? (amount / totalSpentMinor) * 100 : 0;
          return (
            <div
              key={cat}
              style={{
                width: `${pct}%`,
                backgroundColor: CATEGORY_COLORS[cat] || '#0B0B0B',
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
              title={`${cat}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Itemized Categories List with Horizontal Progress */}
      <div className="space-y-3">
        {sortedCategories.map((cat) => {
          const amount = categoryTotals[cat];
          const pct = totalSpentMinor > 0 ? Math.round((amount / totalSpentMinor) * 100) : 0;
          const color = CATEGORY_COLORS[cat];

          return (
            <div key={cat} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                {/* Category Icon and Label */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#F4F4F2] text-[#0B0B0B] flex items-center justify-center border border-black/5">
                    {getCategoryIcon(cat)}
                  </div>
                  <span className="font-bold text-[#0B0B0B]">{cat}</span>
                  <span className="text-[10px] font-bold text-black/50 bg-[#F4F4F2] px-2 py-0.5 rounded-full">
                    {pct}%
                  </span>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <span className="font-extrabold text-[#0B0B0B]">
                    {formatMinorUnits(amount, currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 rounded-full bg-[#F4F4F2] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
