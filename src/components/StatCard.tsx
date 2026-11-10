import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  changeBadgeText: string;
  isPositiveChange?: boolean;
  isHighlighted?: boolean;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  changeBadgeText,
  isPositiveChange = true,
  isHighlighted = false,
  subtext,
}) => {
  if (isHighlighted) {
    return (
      <div className="relative overflow-hidden bg-[#C4F96B] rounded-[20px] sm:rounded-[22px] p-3 sm:p-4 border border-black/5 shadow-xs transition-transform hover:-translate-y-0.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-full bg-black text-[#C4F96B] flex items-center justify-center shrink-0">
              {icon}
            </div>
            
            <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#0B0B0B] text-white text-[9px] sm:text-[10px] font-bold tracking-tight truncate max-w-[85px]">
              {isPositiveChange ? (
                <ArrowUpRight className="w-2.5 h-2.5 text-[#C4F96B] shrink-0" />
              ) : (
                <ArrowDownRight className="w-2.5 h-2.5 text-[#C4F96B] shrink-0" />
              )}
              <span className="truncate">{changeBadgeText}</span>
            </div>
          </div>

          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-black/60 block truncate">
              {label}
            </span>
            <div className="text-sm sm:text-lg md:text-xl font-extrabold text-[#0B0B0B] tracking-tight truncate" title={value}>
              {value}
            </div>
          </div>
        </div>

        {subtext && (
          <p className="text-[10px] font-medium text-black/65 pt-1 truncate">
            {subtext}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#F4F4F2] rounded-[20px] sm:rounded-[22px] p-3 sm:p-4 border border-black/5 shadow-xs transition-transform hover:-translate-y-0.5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 rounded-full bg-white text-[#0B0B0B] flex items-center justify-center shadow-xs shrink-0">
            {icon}
          </div>
          
          <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#C4F96B] text-[#0B0B0B] text-[9px] sm:text-[10px] font-bold tracking-tight truncate max-w-[85px]">
            {isPositiveChange ? (
              <ArrowUpRight className="w-2.5 h-2.5 text-[#3F6212] shrink-0" />
            ) : (
              <ArrowDownRight className="w-2.5 h-2.5 text-[#3F6212] shrink-0" />
            )}
            <span className="truncate">{changeBadgeText}</span>
          </div>
        </div>

        <div className="space-y-0.5 min-w-0">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-black/50 block truncate">
            {label}
          </span>
          <div className="text-sm sm:text-lg md:text-xl font-extrabold text-[#0B0B0B] tracking-tight truncate" title={value}>
            {value}
          </div>
        </div>
      </div>

      {subtext && (
        <p className="text-[10px] font-medium text-black/60 pt-1 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};
