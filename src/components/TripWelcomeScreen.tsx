import React, { useState } from 'react';
import { Zap, Plus, Users, ArrowRight, Compass, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../types';

interface TripWelcomeScreenProps {
  onCreateTrip: (name: string, currency: string, creatorName: string) => Promise<void>;
  onJoinTrip: (code: string, memberName: string) => Promise<void>;
  defaultUserName?: string;
}

const POPULAR_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (Indian Rupee)' },
  { code: 'USD', symbol: '$', label: 'USD (US Dollar)' },
  { code: 'EUR', symbol: '€', label: 'EUR (Euro)' },
  { code: 'GBP', symbol: '£', label: 'GBP (British Pound)' },
  { code: 'AED', symbol: 'AED', label: 'AED (UAE Dirham)' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (Singapore Dollar)' },
  { code: 'THB', symbol: '฿', label: 'THB (Thai Baht)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (Japanese Yen)' },
];

export const TripWelcomeScreen: React.FC<TripWelcomeScreenProps> = ({
  onCreateTrip,
  onJoinTrip,
  defaultUserName = '',
}) => {
  const [mode, setMode] = useState<'landing' | 'create' | 'join'>('landing');

  // Create form state
  const [tripName, setTripName] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [creatorName, setCreatorName] = useState(defaultUserName);

  // Join form state
  const [joinCode, setJoinCode] = useState('');
  const [joinerName, setJoinerName] = useState(defaultUserName);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim() || !creatorName.trim()) {
      setErrorMessage('Please enter both the trip name and your name.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await onCreateTrip(tripName.trim(), baseCurrency, creatorName.trim());
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinerName.trim()) {
      setErrorMessage('Please enter both the 6-character code and your name.');
      return;
    }
    if (joinCode.trim().length !== 6) {
      setErrorMessage('Join code must be exactly 6 characters.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await onJoinTrip(joinCode.trim().toUpperCase(), joinerName.trim());
    } catch (err: any) {
      setErrorMessage(err.message || 'Trip not found or failed to join.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col justify-center max-w-md mx-auto">
      {/* Brand Hero Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C4F96B] text-[#0B0B0B] text-xs font-bold tracking-tight mb-3 border border-black/5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#3F6212] animate-pulse" />
          <span>REAL-TIME FAMILY SYNC</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#0B0B0B] tracking-tight">
          TripSplit
        </h1>
        <p className="text-xs sm:text-sm text-black/60 mt-1 max-w-xs mx-auto">
          Split family expenses without friction. No sign-up required.
        </p>
      </div>

      {/* Mode Switcher / Main View */}
      {mode === 'landing' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Card 1: Create a Trip */}
          <div
            onClick={() => {
              setMode('create');
              setErrorMessage(null);
            }}
            className="group cursor-pointer bg-[#C4F96B] rounded-[26px] p-6 border border-black/5 shadow-sm lime-grid-pattern transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-2xl bg-[#0B0B0B] text-white flex items-center justify-center shadow-xs">
                <Plus className="w-6 h-6 stroke-[2.5] text-[#C4F96B]" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B0B0B] bg-black/10 px-3 py-1 rounded-full">
                New Trip
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#0B0B0B] tracking-tight">
              Create a trip
            </h3>
            <p className="text-xs text-black/70 mt-1 leading-relaxed">
              Start a new family trip, pick your currency (default INR), and get a 6-character code to invite everyone.
            </p>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-black/10">
              <span className="text-xs font-bold text-[#0B0B0B]">Get started</span>
              <div className="w-7 h-7 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-[#C4F96B]" />
              </div>
            </div>
          </div>

          {/* Card 2: Join a Trip */}
          <div
            onClick={() => {
              setMode('join');
              setErrorMessage(null);
            }}
            className="group cursor-pointer bg-white rounded-[26px] p-6 border border-black/5 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-2xl bg-[#F4F4F2] text-[#0B0B0B] flex items-center justify-center border border-black/5">
                <Users className="w-6 h-6 stroke-[2.2]" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-black/50 bg-[#F4F4F2] px-3 py-1 rounded-full">
                Join Group
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#0B0B0B] tracking-tight">
              Join a trip
            </h3>
            <p className="text-xs text-black/60 mt-1 leading-relaxed">
              Got an invite code on WhatsApp? Enter the 6-character code to sync with your family.
            </p>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-black/5">
              <span className="text-xs font-bold text-[#0B0B0B]">Enter code</span>
              <div className="w-7 h-7 rounded-full bg-[#0B0B0B] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-[#C4F96B]" />
              </div>
            </div>
          </div>

          {/* Value Props Pill */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] font-semibold text-black/45">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#3F6212]" />
              Anonymous Auth
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3F6212]" />
              Live Phone Sync
            </span>
          </div>
        </div>
      )}

      {/* Create Trip Form */}
      {mode === 'create' && (
        <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/5">
            <h2 className="text-lg font-extrabold text-[#0B0B0B] tracking-tight">
              Create New Trip
            </h2>
            <button
              onClick={() => {
                setMode('landing');
                setErrorMessage(null);
              }}
              className="text-xs font-semibold text-black/50 hover:text-black"
            >
              Back
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-1.5">
                Trip Name
              </label>
              <input
                type="text"
                placeholder="e.g., Goa Family Vacation, Swiss Alps '26"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                autoFocus
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F2] border border-black/5 text-sm font-semibold text-[#0B0B0B] placeholder:text-black/35 focus:outline-hidden focus:ring-2 focus:ring-[#0B0B0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-1.5">
                Your Name (First Member)
              </label>
              <input
                type="text"
                placeholder="e.g., Alex, Priya, Rohit"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F2] border border-black/5 text-sm font-semibold text-[#0B0B0B] placeholder:text-black/35 focus:outline-hidden focus:ring-2 focus:ring-[#0B0B0B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-black/60">
                  Base Currency
                </label>
                <span className="text-[11px] font-bold text-[#3F6212] bg-[#E6FCB0] px-2 py-0.5 rounded-full">
                  Default: INR (₹)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-[#F4F4F2] rounded-2xl border border-black/5">
                {POPULAR_CURRENCIES.map((c) => {
                  const isSelected = baseCurrency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setBaseCurrency(c.code)}
                      className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                        isSelected
                          ? 'bg-[#0B0B0B] text-white font-bold shadow-xs'
                          : 'bg-white text-black/70 hover:bg-black/5'
                      }`}
                    >
                      <span>
                        {c.symbol} {c.code}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C4F96B]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-[#0B0B0B] text-white text-sm font-semibold hover:bg-black/85 active:scale-98 transition shadow-md disabled:opacity-50"
              >
                <span className="w-6 h-6 rounded-full bg-[#C4F96B] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[#0B0B0B]" fill="currentColor" />
                </span>
                <span>{loading ? 'Creating Trip...' : 'Create & Generate Join Code'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Join Trip Form */}
      {mode === 'join' && (
        <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/5">
            <h2 className="text-lg font-extrabold text-[#0B0B0B] tracking-tight">
              Join Existing Trip
            </h2>
            <button
              onClick={() => {
                setMode('landing');
                setErrorMessage(null);
              }}
              className="text-xs font-semibold text-black/50 hover:text-black"
            >
              Back
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-1.5">
                6-Character Join Code
              </label>
              <input
                type="text"
                placeholder="e.g. 7X8K2M"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                autoFocus
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F2] border border-black/5 text-center text-2xl font-mono font-extrabold text-[#0B0B0B] tracking-widest uppercase placeholder:text-black/30 focus:outline-hidden focus:ring-2 focus:ring-[#0B0B0B]"
              />
              <p className="text-[11px] text-black/50 mt-1 text-center">
                Ask the trip creator for the 6-character code
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul, Sneha, Uncle Joe"
                value={joinerName}
                onChange={(e) => setJoinerName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F4F2] border border-black/5 text-sm font-semibold text-[#0B0B0B] placeholder:text-black/35 focus:outline-hidden focus:ring-2 focus:ring-[#0B0B0B]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-[#0B0B0B] text-white text-sm font-semibold hover:bg-black/85 active:scale-98 transition shadow-md disabled:opacity-50"
              >
                <span className="w-6 h-6 rounded-full bg-[#C4F96B] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[#0B0B0B]" fill="currentColor" />
                </span>
                <span>{loading ? 'Joining Trip...' : 'Join Trip & Sync'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
