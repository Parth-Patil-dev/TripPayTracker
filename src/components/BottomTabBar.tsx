import React from 'react';
import { TabType } from '../types';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Scale, 
  HandCoins, 
  Plus 
} from 'lucide-react';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddExpense: () => void;
  expenseCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
  expenseCount,
}) => {
  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'expenses' as TabType,
      label: 'Expenses',
      icon: ReceiptText,
      badge: expenseCount,
    },
    {
      id: 'balances' as TabType,
      label: 'Balances',
      icon: Scale,
    },
    {
      id: 'settle' as TabType,
      label: 'Settle up',
      icon: HandCoins,
    },
  ];

  return (
    <>
      {/* Floating Black Circular "+" Button (above the bottom tab bar) */}
      <div className="fixed bottom-22 right-5 z-40 max-w-md mx-auto pointer-events-auto">
        <button
          onClick={onOpenAddExpense}
          className="group relative w-14 h-14 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center shadow-xl hover:bg-black/90 active:scale-90 transition-all border-2 border-white/20"
          aria-label="Add new expense"
          title="Add Expense"
        >
          {/* Subtle lime glow ping */}
          <span className="absolute -inset-1 rounded-full bg-[#C4F96B] opacity-20 group-hover:opacity-40 blur-xs transition-opacity" />
          <Plus className="relative w-6 h-6 stroke-[2.5] text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Modern Fintech Bottom Tab Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-black/5 pb-safe"
        aria-label="Bottom Navigation"
      >
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-all group ${
                  isActive ? 'text-[#0B0B0B]' : 'text-black/40 hover:text-black/70'
                }`}
              >
                {/* Active Indicator: Black Pill or Underline */}
                {isActive && (
                  <span className="absolute -top-3 w-8 h-1 rounded-full bg-[#0B0B0B] transition-all" />
                )}

                <div className="relative">
                  <div
                    className={`p-1.5 rounded-full transition-all ${
                      isActive ? 'bg-[#F4F4F2]' : 'group-hover:bg-black/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-[#C4F96B] text-[#0B0B0B] text-[9px] font-extrabold border border-white">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                    isActive ? 'font-bold text-[#0B0B0B]' : 'text-black/50'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
