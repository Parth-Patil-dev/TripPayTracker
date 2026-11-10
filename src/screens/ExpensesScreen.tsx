import React, { useState } from 'react';
import { 
  TripMember, 
  ExpenseItem, 
  ExpenseCategory, 
  formatMinorUnits,
  getCurrencySymbol 
} from '../types';
import { exportExpensesToCSV } from '../utils/csvExport';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { 
  Search, 
  Plus, 
  Utensils, 
  Hotel, 
  Plane, 
  Fuel, 
  ShoppingBag, 
  Ticket, 
  Receipt, 
  Calendar, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  Download,
  Image as ImageIcon,
  Check,
  Globe
} from 'lucide-react';

interface ExpensesScreenProps {
  expenses: ExpenseItem[];
  members: TripMember[];
  currentUid: string | null;
  tripName?: string;
  baseCurrency?: string;
  currencySymbol?: string;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food':
      return <Utensils className="w-4 h-4" />;
    case 'Stay':
      return <Hotel className="w-4 h-4" />;
    case 'Travel':
      return <Plane className="w-4 h-4" />;
    case 'Fuel':
      return <Fuel className="w-4 h-4" />;
    case 'Shopping':
      return <ShoppingBag className="w-4 h-4" />;
    case 'Tickets':
      return <Ticket className="w-4 h-4" />;
    default:
      return <Receipt className="w-4 h-4" />;
  }
};

const CATEGORY_CHIPS = [
  'All',
  'Food',
  'Stay',
  'Travel',
  'Fuel',
  'Shopping',
  'Tickets',
  'Other',
];

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  expenses,
  members,
  currentUid,
  tripName = 'Family Trip',
  baseCurrency = 'INR',
  currencySymbol = '₹',
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<ExpenseItem | null>(null);
  const [hasExported, setHasExported] = useState(false);

  // Filtered expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFilteredMinor = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Helper to format date labels (Today, Yesterday, then Date)
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const getDateGroupLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      // Fallback
    }
    return dateStr;
  };

  // Group by date
  const groups: { [date: string]: ExpenseItem[] } = {};
  filteredExpenses.forEach((exp) => {
    const d = exp.date || todayStr;
    if (!groups[d]) {
      groups[d] = [];
    }
    groups[d].push(exp);
  });

  // Sorted date keys descending
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await onDeleteExpense(deletingId);
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    exportExpensesToCSV(expenses, members, tripName, baseCurrency);
    setHasExported(true);
    setTimeout(() => setHasExported(false), 2500);
  };

  return (
    <div className="space-y-4 px-4 pb-28">
      {/* Search and Category Filter Chips */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 rounded-2xl bg-white border border-black/5 text-xs sm:text-sm font-semibold text-[#0B0B0B] placeholder:text-black/40 focus:outline-hidden focus:ring-2 focus:ring-[#0B0B0B] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Horizontal Scroll Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORY_CHIPS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                  isActive
                    ? 'bg-[#0B0B0B] text-white shadow-xs'
                    : 'bg-white text-black/60 hover:text-black border border-black/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Banner with CSV Export & Add Button */}
      <div className="bg-[#F4F4F2] rounded-[24px] p-3.5 border border-black/5 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-black/50 block">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} ({baseCurrency})
          </span>
          <div className="text-base sm:text-lg font-extrabold text-[#0B0B0B]">
            {formatMinorUnits(totalFilteredMinor, currencySymbol)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={expenses.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-2xs active:scale-95 ${
              hasExported
                ? 'bg-[#C4F96B] text-[#0B0B0B]'
                : 'bg-white hover:bg-black/5 text-[#0B0B0B] border border-black/10 disabled:opacity-40'
            }`}
            title="Download all trip expenses as CSV spreadsheet"
          >
            {hasExported ? (
              <Check className="w-3.5 h-3.5 text-[#3F6212]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-black/70" />
            )}
            <span>{hasExported ? 'Downloaded!' : 'Export CSV'}</span>
          </button>

          {/* Add Expense Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B0B0B] text-white text-xs font-semibold hover:bg-black/90 transition shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#C4F96B]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Expenses List Grouped by Date */}
      {filteredExpenses.length === 0 ? (
        expenses.length === 0 ? (
          <div className="bg-white rounded-[26px] p-8 text-center border border-black/5 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E6FCB0] text-[#3F6212] flex items-center justify-center mx-auto shadow-xs">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-extrabold text-[#0B0B0B]">No expenses recorded yet</p>
              <p className="text-xs text-black/55 mt-1 max-w-xs mx-auto leading-relaxed">
                Add food, stay, fuel, or tickets. Every expense is automatically shared equally with all family members.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenAddExpense}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0B0B0B] text-white text-xs font-bold hover:bg-black/90 active:scale-95 transition shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#C4F96B]" />
                <span>Add First Trip Expense</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[26px] p-8 text-center border border-black/5 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F4F4F2] flex items-center justify-center mx-auto text-black/40">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0B0B0B]">No matching expenses</p>
              <p className="text-xs text-black/50 mt-1">
                No results found for &ldquo;{searchQuery || selectedCategory}&rdquo;. Try another keyword.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-full bg-[#F4F4F2] hover:bg-black/10 text-xs font-bold text-[#0B0B0B] transition"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => {
            const dateExpenses = groups[dateKey];
            const dateTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B0B0B]">
                      {getDateGroupLabel(dateKey)}
                    </span>
                    <span className="text-[10px] text-black/40 font-medium">
                      ({dateExpenses.length})
                    </span>
                  </div>
                  <span className="text-xs font-bold text-black/60">
                    {formatMinorUnits(dateTotal, currencySymbol)}
                  </span>
                </div>

                {/* Items in Date Group */}
                <div className="space-y-2">
                  {dateExpenses.map((item) => {
                    const payer = members.find((m) => m.id === item.paidBy);
                    const isPayerCurrentUser = payer?.isCurrentUser || payer?.uid === currentUid;
                    const canEdit = item.createdBy === currentUid;
                    const sharePerMemberBase = item.amount / Math.max(1, members.length);
                    const isForeign = item.currency && item.currency !== baseCurrency && item.originalAmount;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-[22px] p-4 border border-black/5 shadow-2xs hover:border-black/15 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: Icon, Receipt Thumbnail, & Info */}
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Category Icon or Receipt preview */}
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-2xl bg-[#F4F4F2] text-[#0B0B0B] flex items-center justify-center border border-black/5 group-hover:bg-[#E6FCB0] transition-colors">
                                {getCategoryIcon(item.category)}
                              </div>

                              {/* Small receipt badge indicator if attached */}
                              {item.receiptImage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingReceiptExpense(item);
                                  }}
                                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0B0B0B] text-[#C4F96B] flex items-center justify-center shadow-xs hover:scale-110 transition"
                                  title="View attached receipt photo"
                                >
                                  <ImageIcon className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-[#0B0B0B] truncate">
                                {item.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-medium text-black/55">
                                  {payer
                                    ? isPayerCurrentUser
                                      ? 'You paid'
                                      : `${payer.shortName} paid`
                                    : 'Paid'}
                                </span>
                                <span className="text-black/30">•</span>
                                <span className="text-[10px] font-bold text-[#3F6212] bg-[#E6FCB0] px-1.5 py-0.2 rounded-md">
                                  {item.category}
                                </span>
                                {item.receiptImage && (
                                  <>
                                    <span className="text-black/30">•</span>
                                    <button
                                      type="button"
                                      onClick={() => setViewingReceiptExpense(item)}
                                      className="text-[10px] font-bold text-[#3F6212] hover:underline flex items-center gap-0.5"
                                    >
                                      <span>Photo</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount & Member share */}
                          <div className="text-right shrink-0">
                            {isForeign ? (
                              <div>
                                <span className="text-base font-extrabold text-[#0B0B0B] block">
                                  {getCurrencySymbol(item.currency)}{((item.originalAmount || 0) / 100).toFixed(2)}
                                </span>
                                <div className="text-[11px] font-semibold text-[#3F6212]">
                                  ≈ {formatMinorUnits(item.amount, currencySymbol)}
                                </div>
                                <div className="text-[9px] text-black/40">
                                  {formatMinorUnits(sharePerMemberBase, currencySymbol)} / ea
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-base font-extrabold text-[#0B0B0B]">
                                  {formatMinorUnits(item.amount, currencySymbol)}
                                </span>
                                <div className="text-[10px] font-semibold text-black/45">
                                  {formatMinorUnits(sharePerMemberBase, currencySymbol)} / ea
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Attached receipt quick strip thumbnail */}
                        {item.receiptImage && (
                          <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setViewingReceiptExpense(item)}
                              className="inline-flex items-center gap-2 p-1 rounded-xl hover:bg-black/5 transition text-left"
                            >
                              <img
                                src={item.receiptImage}
                                alt="Receipt thumbnail"
                                className="w-8 h-8 rounded-lg object-cover border border-black/10 shrink-0"
                              />
                              <span className="text-[11px] font-bold text-[#0B0B0B] hover:text-[#3F6212]">
                                View Receipt Photo
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Edit / Delete Footer for creator */}
                        {canEdit && (
                          <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-black/40">
                              Created by you
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEditExpense(item)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F4F2] text-[#0B0B0B] text-[11px] font-bold hover:bg-black/10 transition"
                              >
                                <Edit3 className="w-3 h-3 text-black/70" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setDeletingId(item.id)}
                                className="p-1 text-black/40 hover:text-rose-600 rounded-full transition"
                                title="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#0B0B0B]">
              Delete this expense?
            </h3>
            <p className="text-xs text-black/60 mt-1 leading-relaxed">
              This will permanently remove the expense and recalculate all family balances in real time.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-full bg-[#F4F4F2] text-[#0B0B0B] text-xs font-bold hover:bg-black/10 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Size Receipt Viewer Modal */}
      <ReceiptViewerModal
        isOpen={Boolean(viewingReceiptExpense)}
        onClose={() => setViewingReceiptExpense(null)}
        expense={viewingReceiptExpense}
        members={members}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
