import React from 'react';
import { TripMember, ExpenseItem, formatMinorUnits } from '../types';
import { Scale, ArrowUpRight, ArrowDownRight, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';

interface BalancesScreenProps {
  members: TripMember[];
  expenses: ExpenseItem[];
  currencySymbol?: string;
  onNavigateToSettle: () => void;
}

export const BalancesScreen: React.FC<BalancesScreenProps> = ({
  members,
  expenses,
  currencySymbol = '₹',
  onNavigateToSettle,
}) => {
  const memberCount = Math.max(1, members.length);
  const totalTripSpentMinor = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Fair share per person = total spent / number of members (exact integer minor units)
  const fairSharePerMemberMinor = Math.round(totalTripSpentMinor / memberCount);

  // Compute balances for every member in minor units
  const memberBalances = members.map((member) => {
    // Total amount paid by this member in integer minor units
    const paid = expenses
      .filter((e) => (e.paidBy || (e as any).paidById) === member.id)
      .reduce((sum, e) => sum + e.amount, 0);

    // Fair share is identical for all members
    const owes = fairSharePerMemberMinor;
    const net = paid - owes;

    return {
      member,
      paid,
      owes,
      net,
    };
  });

  // Calculate highest payer for progress bar scaling
  const maxPaidMinor = Math.max(...memberBalances.map((m) => m.paid), fairSharePerMemberMinor, 100);

  return (
    <div className="space-y-4 px-4 pb-28">
      {/* Balances Summary Banner */}
      <div className="bg-[#0B0B0B] text-white rounded-[24px] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#C4F96B] flex items-center justify-center text-[#0B0B0B]">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C4F96B]">
              Family Balance Sheet
            </span>
          </div>
          <span className="text-[11px] font-semibold text-white/50 bg-white/10 px-2.5 py-0.5 rounded-full">
            {expenses.length} bills recorded
          </span>
        </div>

        {/* Total & Fair Share Equal Split Formula */}
        <div className="grid grid-cols-2 gap-3 mb-4 pt-1">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-semibold uppercase text-white/50 block">
              Total Trip Spent
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-white">
              {formatMinorUnits(totalTripSpentMinor, currencySymbol)}
            </span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-semibold uppercase text-white/50 block">
              Fair Share / Person
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#C4F96B]">
              {formatMinorUnits(fairSharePerMemberMinor, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Settle Up Action Button */}
        <button
          onClick={onNavigateToSettle}
          className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-[#C4F96B] text-[#0B0B0B] text-xs font-bold hover:bg-[#E6FCB0] transition active:scale-95 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span>Settle Up Debts</span>
            <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-semibold">
              Min. transfers
            </span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Member Balance Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-black/50">
            Member Accounts ({members.length})
          </h4>
          <span className="text-[11px] text-black/45 font-medium">
            Fair share: {formatMinorUnits(fairSharePerMemberMinor, currencySymbol)} each
          </span>
        </div>

        {memberBalances.map(({ member, paid, owes, net }) => {
          // In minor units (paise/cents): within 50 units (0.50) is treated as settled
          const isPositive = net >= 50;
          const isNegative = net <= -50;
          const isSettled = !isPositive && !isNegative;

          const percentPaid = Math.min(100, Math.round((paid / maxPaidMinor) * 100));

          return (
            <div
              key={member.id}
              className={`rounded-[22px] p-4.5 border transition-all ${
                member.isCurrentUser
                  ? 'bg-white border-[#0B0B0B] shadow-sm'
                  : 'bg-white border-black/5 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                {/* Member Identity & Avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-xs"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.initials}
                      </div>
                    )}
                    {member.isCurrentUser && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#0B0B0B] text-[#C4F96B] text-[8px] font-extrabold tracking-tight">
                        YOU
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#0B0B0B] leading-tight truncate">
                      {member.name}
                    </h4>
                    <p className="text-xs text-black/50 mt-0.5 font-medium">
                      {member.role || 'Family Member'}
                    </p>
                  </div>
                </div>

                {/* Net Balance Badge (Positive = gets back in green, Negative = owes in red/orange) */}
                <div className="text-right shrink-0">
                  {isSettled ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F4F2] text-black/60 text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3 text-[#3F6212]" />
                      <span>All Even</span>
                    </div>
                  ) : isPositive ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6FCB0] text-[#3F6212] text-xs font-extrabold">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+{formatMinorUnits(net, currencySymbol)}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-extrabold border border-rose-100">
                      <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>-{formatMinorUnits(Math.abs(net), currencySymbol)}</span>
                    </div>
                  )}

                  <p className="text-[10px] font-semibold text-black/45 mt-1">
                    {isSettled
                      ? 'Settled'
                      : isPositive
                      ? 'Gets back'
                      : 'Owes to group'}
                  </p>
                </div>
              </div>

              {/* Paid vs Fair Share Breakdown */}
              <div className="space-y-1.5 pt-2.5 border-t border-black/5">
                <div className="flex justify-between text-xs text-black/60">
                  <span>
                    Total Paid: <strong className="text-[#0B0B0B] font-bold">{formatMinorUnits(paid, currencySymbol)}</strong>
                  </span>
                  <span>
                    Fair Share: <strong className="text-[#0B0B0B] font-bold">{formatMinorUnits(owes, currencySymbol)}</strong>
                  </span>
                </div>

                {/* Visual contribution bar */}
                <div className="w-full h-2 rounded-full bg-[#F4F4F2] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPositive ? 'bg-[#3F6212]' : isNegative ? 'bg-amber-500' : 'bg-[#C4F96B]'
                    }`}
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
