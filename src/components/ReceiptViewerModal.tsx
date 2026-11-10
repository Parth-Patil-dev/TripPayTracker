import React from 'react';
import { X, Download, Calendar, User, Tag, Zap } from 'lucide-react';
import { ExpenseItem, TripMember, formatMinorUnits, getCurrencySymbol } from '../types';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseItem | null;
  members: TripMember[];
  currencySymbol?: string;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  expense,
  members,
  currencySymbol = '₹',
}) => {
  if (!isOpen || !expense || !expense.receiptImage) return null;

  const payer = members.find((m) => m.id === expense.paidBy);
  const payerName = payer ? payer.name : 'Unknown';
  const hasForeignCurrency = expense.currency && expense.originalAmount && expense.currency !== 'INR';

  const handleDownload = () => {
    if (!expense.receiptImage) return;
    const a = document.createElement('a');
    a.href = expense.receiptImage;
    const cleanTitle = expense.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `Receipt_${cleanTitle}_${expense.date}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Modal Card */}
      <div className="w-full max-w-lg bg-[#0B0B0B] text-white rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-full bg-[#C4F96B] text-[#0B0B0B] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" fill="currentColor" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold truncate">{expense.title}</h3>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-white/40" />
                  {expense.date}
                </span>
                <span>•</span>
                <span className="text-[#C4F96B] font-semibold">{expense.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Download Receipt"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Image Display */}
        <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/40 min-h-[260px]">
          <img
            src={expense.receiptImage}
            alt={`Receipt for ${expense.title}`}
            className="max-h-[58vh] w-auto max-w-full rounded-2xl object-contain shadow-md border border-white/5"
          />
        </div>

        {/* Footer Info */}
        <div className="p-4 sm:p-5 bg-[#141414] border-t border-white/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-white/60 mb-0.5">
              <User className="w-3 h-3 text-white/40" />
              <span>Paid by <strong className="text-white">{payerName}</strong></span>
            </div>
            {hasForeignCurrency && (
              <span className="text-[11px] text-white/50 block">
                Original: {getCurrencySymbol(expense.currency)}{((expense.originalAmount || 0) / 100).toFixed(2)} {expense.currency}
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-lg font-extrabold text-[#C4F96B]">
              {formatMinorUnits(expense.amount, currencySymbol)}
            </span>
            <span className="text-[10px] text-white/40 block">Trip Base Total</span>
          </div>
        </div>
      </div>
    </div>
  );
};
