import React, { useState, useEffect, useRef } from 'react';
import { 
  TripMember, 
  ExpenseCategory, 
  ExpenseItem, 
  getCurrencySymbol 
} from '../types';
import { 
  POPULAR_CURRENCIES, 
  fetchLiveExchangeRate, 
  getCurrencyInfo 
} from '../utils/currency';
import { compressImageFile } from '../utils/imageCompressor';
import { 
  X, 
  Utensils, 
  Hotel, 
  Plane, 
  Fuel, 
  ShoppingBag, 
  Ticket, 
  Receipt, 
  Zap, 
  Calendar, 
  Trash2, 
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  Globe
} from 'lucide-react';

interface ExpenseBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  members: TripMember[];
  currentUid: string | null;
  baseCurrency?: string;
  currencySymbol?: string;
  initialExpense?: ExpenseItem | null;
  onSaveExpense: (expense: {
    title: string;
    amount: number; // in integer minor units of base currency
    category: ExpenseCategory;
    date: string;
    paidBy: string;
    currency?: string;
    originalAmount?: number;
    exchangeRate?: number;
    receiptImage?: string;
  }) => Promise<void>;
  onDeleteExpense?: (expenseId: string) => Promise<void>;
}

export const CATEGORIES: { id: ExpenseCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'Food', label: 'Food', icon: Utensils },
  { id: 'Stay', label: 'Stay', icon: Hotel },
  { id: 'Travel', label: 'Travel', icon: Plane },
  { id: 'Fuel', label: 'Fuel', icon: Fuel },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'Tickets', label: 'Tickets', icon: Ticket },
  { id: 'Other', label: 'Other', icon: Receipt },
];

export const ExpenseBottomSheet: React.FC<ExpenseBottomSheetProps> = ({
  isOpen,
  onClose,
  members,
  currentUid,
  baseCurrency = 'INR',
  currencySymbol = '₹',
  initialExpense,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const isEditing = Boolean(initialExpense);

  // Form states
  const [title, setTitle] = useState('');
  const [majorAmount, setMajorAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState<string>('');

  // Multi-currency states
  const [selectedCurrency, setSelectedCurrency] = useState<string>(baseCurrency);
  const [exchangeRate, setExchangeRate] = useState<string>('1.0');
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [rateSourceNotice, setRateSourceNotice] = useState<string | null>(null);

  // Receipt states
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptSizeKb, setReceiptSizeKb] = useState<number | null>(null);
  const [isCompressingReceipt, setIsCompressingReceipt] = useState(false);
  const [previewReceiptFull, setPreviewReceiptFull] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync state when opened or initialExpense changes
  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setCategory(initialExpense.category || 'Food');
      setDate(initialExpense.date || new Date().toISOString().split('T')[0]);
      setPaidBy(initialExpense.paidBy || members[0]?.id || '');

      const expCurrency = initialExpense.currency || baseCurrency;
      setSelectedCurrency(expCurrency);

      if (expCurrency !== baseCurrency && initialExpense.originalAmount) {
        setMajorAmount((initialExpense.originalAmount / 100).toFixed(2));
        setExchangeRate(String(initialExpense.exchangeRate || 1.0));
      } else {
        setMajorAmount((initialExpense.amount / 100).toFixed(2));
        setExchangeRate('1.0');
      }

      setReceiptImage(initialExpense.receiptImage || null);
      if (initialExpense.receiptImage) {
        setReceiptSizeKb(Math.round((initialExpense.receiptImage.length * 0.75) / 1024));
      } else {
        setReceiptSizeKb(null);
      }
    } else {
      setTitle('');
      setMajorAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedCurrency(baseCurrency);
      setExchangeRate('1.0');
      setRateSourceNotice(null);
      setReceiptImage(null);
      setReceiptSizeKb(null);

      // Default "Paid by" to current user
      const currentUserMember = members.find((m) => m.isCurrentUser || m.uid === currentUid);
      setPaidBy(currentUserMember ? currentUserMember.id : (members[0]?.id || ''));
    }
    setShowDeleteConfirm(false);
    setErrorMessage(null);
    setPreviewReceiptFull(false);
  }, [initialExpense, isOpen, members, currentUid, baseCurrency]);

  // When currency changes, attempt prefilling exchange rate
  const handleCurrencyChange = async (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    if (newCurrency === baseCurrency) {
      setExchangeRate('1.0');
      setRateSourceNotice(null);
      return;
    }

    // Fetch live rate
    setIsFetchingRate(true);
    setRateSourceNotice(null);
    try {
      const result = await fetchLiveExchangeRate(newCurrency, baseCurrency);
      if (result) {
        setExchangeRate(String(result.rate));
        if (result.source === 'frankfurter') {
          setRateSourceNotice(`Live rate prefilled from European Central Bank`);
        } else if (result.source === 'open-exchange') {
          setRateSourceNotice(`Live rate prefilled from open exchange API`);
        } else {
          setRateSourceNotice(`Estimated offline rate prefilled`);
        }
      } else {
        setRateSourceNotice(`Could not fetch live rate. Enter rate manually below.`);
      }
    } catch {
      setRateSourceNotice(`Could not fetch live rate. Enter rate manually below.`);
    } finally {
      setIsFetchingRate(false);
    }
  };

  // Manual refresh of live rate
  const handleRefreshRate = async () => {
    if (selectedCurrency === baseCurrency) return;
    setIsFetchingRate(true);
    try {
      const result = await fetchLiveExchangeRate(selectedCurrency, baseCurrency);
      if (result) {
        setExchangeRate(String(result.rate));
        setRateSourceNotice(`Updated: 1 ${selectedCurrency} = ${result.rate} ${baseCurrency}`);
      } else {
        setRateSourceNotice(`Could not update live rate. You can edit the rate manually.`);
      }
    } catch {
      setRateSourceNotice(`Network error. Please adjust rate manually.`);
    } finally {
      setIsFetchingRate(false);
    }
  };

  // Image compression handler
  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingReceipt(true);
    setErrorMessage(null);
    try {
      const compressed = await compressImageFile(file, 800, 0.6);
      setReceiptImage(compressed.dataUrl);
      setReceiptSizeKb(compressed.sizeKb);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process receipt image.');
    } finally {
      setIsCompressingReceipt(false);
      // Reset input value so same photo can be picked again if desired
      if (e.target) e.target.value = '';
    }
  };

  if (!isOpen) return null;

  // Amount & Split computations
  const isForeign = selectedCurrency !== baseCurrency;
  const parsedMajorAmount = parseFloat(majorAmount) || 0;
  const parsedExchangeRate = parseFloat(exchangeRate) || 1.0;

  // Converted base amount in major units
  const convertedBaseMajor = isForeign
    ? Number((parsedMajorAmount * parsedExchangeRate).toFixed(2))
    : parsedMajorAmount;

  // Integer minor units (e.g. 150.50 -> 15050 paise)
  const convertedBaseMinor = Math.round(convertedBaseMajor * 100);
  const memberCount = Math.max(1, members.length);
  const previewPerMemberBase = (convertedBaseMajor / memberCount).toFixed(2);

  const activeCurrencySymbol = getCurrencySymbol(selectedCurrency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Please enter an expense title.');
      return;
    }
    if (parsedMajorAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount.');
      return;
    }
    if (isForeign && (isNaN(parsedExchangeRate) || parsedExchangeRate <= 0)) {
      setErrorMessage('Please enter a valid positive exchange rate.');
      return;
    }
    if (!paidBy) {
      setErrorMessage('Please select who paid for this expense.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const originalMinor = isForeign ? Math.round(parsedMajorAmount * 100) : undefined;
    const rateNumber = isForeign ? parsedExchangeRate : undefined;

    try {
      await onSaveExpense({
        title: title.trim(),
        amount: convertedBaseMinor,
        category,
        date,
        paidBy,
        currency: selectedCurrency,
        originalAmount: originalMinor,
        exchangeRate: rateNumber,
        receiptImage: receiptImage || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialExpense || !onDeleteExpense) return;
    setLoading(true);
    try {
      await onDeleteExpense(initialExpense.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      {/* Bottom Sheet Container */}
      <div 
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 flex flex-col"
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-black/15 mx-auto mb-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#C4F96B] flex items-center justify-center text-[#0B0B0B]">
              <Zap className="w-4 h-4" fill="currentColor" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-[#0B0B0B] tracking-tight">
                {isEditing ? 'Edit Expense' : 'Add Trip Expense'}
              </h2>
              <p className="text-[11px] text-black/50">
                Split equally among all {memberCount} members in {baseCurrency}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4F2] text-black/60 hover:text-black flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Currency Selector Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black/60 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-black/50" />
                Payment Currency
              </label>
              <span className="text-[11px] font-semibold text-black/50">
                Trip base: <strong className="text-[#0B0B0B]">{baseCurrency}</strong>
              </span>
            </div>

            {/* Quick Currency Selection Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {POPULAR_CURRENCIES.slice(0, 8).map((cur) => {
                const isSelected = selectedCurrency === cur.code;
                return (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => handleCurrencyChange(cur.code)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                      isSelected
                        ? 'bg-[#0B0B0B] text-white shadow-xs'
                        : 'bg-[#F4F4F2] text-black/70 hover:bg-black/10'
                    }`}
                  >
                    <span>{cur.flag}</span>
                    <span>{cur.code}</span>
                  </button>
                );
              })}

              {/* Full select dropdown */}
              <div className="relative shrink-0">
                <select
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-full bg-[#F4F4F2] text-black/80 font-bold text-xs border border-black/10 focus:outline-hidden"
                >
                  <option value={selectedCurrency}>More ({selectedCurrency})...</option>
                  {POPULAR_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Big Amount Card */}
          <div className="bg-[#F4F4F2] rounded-[24px] p-4 text-center border border-black/5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-black/50 block mb-1">
              {isForeign ? `Amount in ${selectedCurrency}` : 'Expense Amount'}
            </span>
            <div className="relative inline-flex items-center justify-center">
              <span className="text-2xl font-extrabold text-[#0B0B0B] mr-1">
                {activeCurrencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={majorAmount}
                onChange={(e) => setMajorAmount(e.target.value)}
                autoFocus={!isEditing}
                required
                className="w-48 text-3xl sm:text-4xl font-extrabold text-[#0B0B0B] bg-transparent text-center focus:outline-hidden placeholder:text-black/25"
              />
            </div>

            {/* Split Equal Tag */}
            {parsedMajorAmount > 0 && !isForeign && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C4F96B] text-[#0B0B0B] text-xs font-bold">
                <span>{currencySymbol}{previewPerMemberBase} / person</span>
                <span className="opacity-60">•</span>
                <span>{memberCount} members equal split</span>
              </div>
            )}
          </div>

          {/* Multi-Currency Exchange Rate Box */}
          {isForeign && (
            <div className="bg-[#E6FCB0]/50 border border-[#C4F96B] rounded-[24px] p-3.5 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3F6212] flex items-center gap-1">
                  Exchange Rate to {baseCurrency}
                </span>
                <button
                  type="button"
                  onClick={handleRefreshRate}
                  disabled={isFetchingRate}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-[11px] font-bold text-[#3F6212] transition shadow-2xs"
                  title="Refetch live rate"
                >
                  <RefreshCw className={`w-3 h-3 ${isFetchingRate ? 'animate-spin' : ''}`} />
                  <span>{isFetchingRate ? 'Fetching...' : 'Live Rate'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-black/70 whitespace-nowrap">
                  1 {selectedCurrency} =
                </span>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-bold text-[#0B0B0B] focus:outline-hidden focus:ring-2 focus:ring-[#0B0B0B]"
                />
                <span className="text-xs font-bold text-black/70">{baseCurrency}</span>
              </div>

              {rateSourceNotice && (
                <p className="text-[10px] font-medium text-[#3F6212]/90">
                  {rateSourceNotice}
                </p>
              )}

              {/* Converted Summary */}
              {parsedMajorAmount > 0 && (
                <div className="pt-2 border-t border-[#3F6212]/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-black/60 uppercase">
                      Converted Base Amount
                    </span>
                    <div className="text-sm font-extrabold text-[#0B0B0B]">
                      ≈ {currencySymbol}{convertedBaseMajor.toFixed(2)} {baseCurrency}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-black/60 uppercase">
                      Share per person
                    </span>
                    <div className="text-xs font-bold text-[#3F6212]">
                      {currencySymbol}{previewPerMemberBase} / ea
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-1.5">
              Title / Note
            </label>
            <input
              type="text"
              placeholder="e.g., Highway Dhaba, Resort Booking, Fuel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F2] border border-black/5 text-sm font-semibold text-[#0B0B0B] placeholder:text-black/35 focus:outline-hidden focus:ring-2 focus:ring-[#0B0B0B]"
            />
          </div>

          {/* Category Chips with Icons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition active:scale-95 ${
                      isSelected
                        ? 'bg-[#0B0B0B] text-white shadow-sm'
                        : 'bg-[#F4F4F2] text-black/70 hover:bg-black/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F4F4F2] border border-black/5 text-xs sm:text-sm font-semibold text-[#0B0B0B] focus:outline-hidden focus:ring-2 focus:ring-[#0B0B0B]"
              />
            </div>
          </div>

          {/* Paid By Member Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-2">
              Paid By (Who paid the bill)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-[#F4F4F2] rounded-2xl border border-black/5">
              {members.map((member) => {
                const isPayer = paidBy === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPaidBy(member.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition ${
                      isPayer
                        ? 'bg-[#C4F96B] text-[#0B0B0B] font-bold shadow-xs'
                        : 'bg-white text-black/70 hover:bg-black/5'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.initials}
                    </div>
                    <span className="text-xs truncate">
                      {member.shortName} {member.isCurrentUser ? '(You)' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Receipt Photo Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-2">
              Receipt Photo (Optional)
            </label>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelected}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelected}
              className="hidden"
            />

            {receiptImage ? (
              <div className="flex items-center gap-3 p-3 bg-[#F4F4F2] rounded-2xl border border-black/5">
                <button
                  type="button"
                  onClick={() => setPreviewReceiptFull(true)}
                  className="relative group shrink-0"
                >
                  <img
                    src={receiptImage}
                    alt="Receipt thumbnail"
                    className="w-14 h-14 rounded-xl object-cover border border-black/10 group-hover:opacity-90 transition"
                  />
                  <span className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                    <Eye className="w-4 h-4" />
                  </span>
                </button>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#0B0B0B] block truncate">
                    Receipt attached
                  </span>
                  <span className="text-[11px] text-black/50 block">
                    Compressed ({receiptSizeKb || '~50'} KB) • Stored securely
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewReceiptFull(true)}
                    className="text-[11px] font-bold text-[#3F6212] hover:underline mt-0.5 inline-block"
                  >
                    Tap to view photo
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReceiptImage(null);
                    setReceiptSizeKb(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 text-black/50 hover:text-rose-600 flex items-center justify-center transition border border-black/5 shrink-0"
                  title="Remove receipt"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isCompressingReceipt}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#F4F4F2] hover:bg-black/10 text-xs font-bold text-[#0B0B0B] transition active:scale-98 border border-black/5"
                >
                  <Camera className="w-4 h-4 text-[#3F6212]" />
                  <span>{isCompressingReceipt ? 'Compressing...' : 'Take Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressingReceipt}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#F4F4F2] hover:bg-black/10 text-xs font-bold text-[#0B0B0B] transition active:scale-98 border border-black/5"
                >
                  <ImageIcon className="w-4 h-4 text-black/60" />
                  <span>Choose Gallery</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || isCompressingReceipt}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-[#0B0B0B] text-white text-sm font-semibold hover:bg-black/90 active:scale-98 transition shadow-md disabled:opacity-50"
            >
              <span className="w-6 h-6 rounded-full bg-[#C4F96B] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-[#0B0B0B]" fill="currentColor" />
              </span>
              <span>{loading ? 'Saving...' : isEditing ? 'Update Expense' : 'Save & Split Equally'}</span>
            </button>

            {isEditing && (
              <>
                {showDeleteConfirm ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in">
                    <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      Delete this expense? Balances will be recalculated.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 bg-black/10 text-black rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Expense</span>
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>

      {/* Embedded Full Receipt Preview Modal */}
      {previewReceiptFull && receiptImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative max-w-md w-full bg-[#0B0B0B] rounded-[28px] overflow-hidden p-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white">Receipt Preview</span>
              <button
                onClick={() => setPreviewReceiptFull(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 flex items-center justify-center max-h-[65vh] overflow-auto">
              <img
                src={receiptImage}
                alt="Receipt Full Preview"
                className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-md"
              />
            </div>
            <div className="pt-2 text-center text-xs text-white/50">
              Tap anywhere outside or press Close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
