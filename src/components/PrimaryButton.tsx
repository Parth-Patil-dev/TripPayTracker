import React from 'react';
import { Zap } from 'lucide-react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children = 'Quick Add Expense',
  icon,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-[#0B0B0B] text-white text-sm font-semibold hover:bg-black/85 active:scale-95 transition-all shadow-sm ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      <span className="w-6 h-6 rounded-full bg-[#C4F96B] flex items-center justify-center shrink-0">
        {icon || <Zap className="w-3.5 h-3.5 text-[#0B0B0B]" fill="currentColor" />}
      </span>
      <span>{children}</span>
    </button>
  );
};
