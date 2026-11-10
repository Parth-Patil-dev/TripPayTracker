import React from 'react';
import { TripMember, formatMinorUnits } from '../types';
import { CalculatedSettlement } from '../utils/debtCalculator';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle,
  Repeat,
  PartyPopper
} from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';

interface SettleUpScreenProps {
  members: TripMember[];
  settlements: CalculatedSettlement[];
  settlementsMap: Record<string, boolean>; // Live synced from Firestore
  currencySymbol?: string;
  onToggleSettlement: (
    settlementId: string, 
    isSettled: boolean, 
    fromId: string, 
    toId: string, 
    amount: number
  ) => Promise<void>;
  onOpenAddExpense: () => void;
}

export const SettleUpScreen: React.FC<SettleUpScreenProps> = ({
  members,
  settlements,
  settlementsMap,
  currencySymbol = '₹',
  onToggleSettlement,
  onOpenAddExpense,
}) => {
  // Count how many are settled
  const settledCount = settlements.filter((s) => Boolean(settlementsMap[s.id])).length;
  const allMarkedSettled = settlements.length > 0 && settledCount === settlements.length;

  return (
    <div className="space-y-4 px-4 pb-28">
      {/* Smart Debt Simplification Info Banner */}
      <div className="bg-[#C4F96B] rounded-[24px] p-5 border border-black/5 shadow-xs lime-grid-pattern">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0B0B0B] text-[#C4F96B] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0B0B0B]">
              Greedy Debt Simplification
            </span>
          </div>

          <span className="text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded-full text-[#0B0B0B]">
            Zero Rounding Errors
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-[#0B0B0B] tracking-tight">
          {settlements.length === 0
            ? 'All Settled!'
            : allMarkedSettled
            ? 'All Debts Settled!'
            : `${settlements.length} ${settlements.length === 1 ? 'Transfer' : 'Transfers'} to Settle Everyone`}
        </h3>

        <p className="text-xs text-black/75 mt-1 leading-relaxed">
          {settlements.length === 0
            ? 'All family members have paid their exact fair share. No outstanding transfers.'
            : 'Minimal cash flow algorithm matches biggest debtors with biggest creditors so everyone squares away with the fewest transactions.'}
        </p>

        {settlements.length > 0 && (
          <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-bold text-[#0B0B0B]">
            <span>Settlement progress</span>
            <span>{settledCount} of {settlements.length} completed</span>
          </div>
        )}
      </div>

      {/* FRIENDLY ALL SETTLED STATE */}
      {settlements.length === 0 ? (
        <div className="bg-white rounded-[26px] p-8 text-center border border-black/5 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#E6FCB0] text-[#3F6212] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-[#0B0B0B]">
              All Settled!
            </h4>
            <p className="text-xs text-black/55 mt-1 max-w-xs mx-auto leading-relaxed">
              Every family member is completely even. There are no pending debts or transfers needed.
            </p>
          </div>
          <div className="pt-2">
            <PrimaryButton onClick={onOpenAddExpense} fullWidth>
              Add New Expense
            </PrimaryButton>
          </div>
        </div>
      ) : (
        /* LIST OF TRANSFERS */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black/50">
              Suggested Repayments ({settlements.length})
            </h4>
            <span className="text-[11px] text-black/45 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F6212] animate-pulse" />
              Live Synced
            </span>
          </div>

          <div className="space-y-2.5">
            {settlements.map((settlement) => {
              const debtor = members.find((m) => m.id === settlement.fromId);
              const creditor = members.find((m) => m.id === settlement.toId);
              const isSettled = Boolean(settlementsMap[settlement.id]);

              const debtorName = debtor?.shortName || 'Member';
              const creditorName = creditor?.shortName || 'Member';
              const formattedAmount = formatMinorUnits(settlement.amount, currencySymbol);

              return (
                <div
                  key={settlement.id}
                  className={`rounded-[22px] p-4.5 border transition-all ${
                    isSettled
                      ? 'bg-white/80 border-black/5 opacity-80'
                      : 'bg-white border-black/10 shadow-xs hover:border-black/20'
                  }`}
                >
                  {/* Clear Heading: "Rahul pays Priya ₹1,250" */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="text-sm sm:text-base font-extrabold text-[#0B0B0B] leading-tight">
                      <span className={isSettled ? 'line-through opacity-60' : ''}>
                        {debtor?.isCurrentUser ? 'You' : debtorName} pays {creditor?.isCurrentUser ? 'You' : creditorName}{' '}
                        <span className="text-[#3F6212] font-black">{formattedAmount}</span>
                      </span>
                    </div>

                    {isSettled && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6FCB0] text-[#3F6212] text-[10px] font-extrabold shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Settled</span>
                      </span>
                    )}
                  </div>

                  {/* Transfer Diagram with Avatars */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F4F2] mb-3.5">
                    {/* From Member */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                        style={{ backgroundColor: debtor?.avatarColor || '#0B0B0B' }}
                      >
                        {debtor?.initials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-black/40 uppercase block">From</span>
                        <span className="text-xs font-bold text-[#0B0B0B] truncate block">
                          {debtor?.name}
                        </span>
                      </div>
                    </div>

                    {/* Arrow with amount */}
                    <div className="flex flex-col items-center px-2 shrink-0">
                      <span className="text-xs font-extrabold text-[#3F6212] bg-[#E6FCB0] px-2.5 py-0.5 rounded-full">
                        {formattedAmount}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-black/40 mt-1" />
                    </div>

                    {/* To Member */}
                    <div className="flex items-center gap-2 min-w-0 text-right justify-end">
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-black/40 uppercase block">To</span>
                        <span className="text-xs font-bold text-[#0B0B0B] truncate block">
                          {creditor?.name}
                        </span>
                      </div>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                        style={{ backgroundColor: creditor?.avatarColor || '#0B0B0B' }}
                      >
                        {creditor?.initials}
                      </div>
                    </div>
                  </div>

                  {/* Live Synced Toggle: "Mark as settled" */}
                  <div className="pt-2.5 border-t border-black/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-black/60">
                      {isSettled ? 'Marked as completed' : 'Payment transferred?'}
                    </span>

                    <button
                      onClick={() =>
                        onToggleSettlement(
                          settlement.id,
                          !isSettled,
                          settlement.fromId,
                          settlement.toId,
                          settlement.amount
                        )
                      }
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
                        isSettled
                          ? 'bg-[#C4F96B] text-[#0B0B0B] border border-black/10'
                          : 'bg-[#0B0B0B] text-white hover:bg-black/85'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition ${
                          isSettled ? 'bg-[#0B0B0B] text-[#C4F96B]' : 'border border-white/40'
                        }`}
                      >
                        {isSettled && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{isSettled ? 'Marked Settled' : 'Mark as settled'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button helper */}
      <div className="pt-2 text-center">
        <PrimaryButton onClick={onOpenAddExpense} fullWidth>
          Add Another Expense
        </PrimaryButton>
      </div>
    </div>
  );
};
