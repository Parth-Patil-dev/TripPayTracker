import React, { useState } from 'react';
import { X, Check, Plus, LogOut, ChevronRight, Compass } from 'lucide-react';
import { SavedTripInfo, getCurrencySymbol } from '../types';

interface TripSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: SavedTripInfo[];
  activeTripId: string;
  onSelectTrip: (tripId: string) => void;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  onLeaveTrip: (tripId: string) => void;
}

export const TripSwitcherModal: React.FC<TripSwitcherModalProps> = ({
  isOpen,
  onClose,
  savedTrips,
  activeTripId,
  onSelectTrip,
  onOpenCreate,
  onOpenJoin,
  onLeaveTrip,
}) => {
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#C4F96B] flex items-center justify-center text-[#0B0B0B]">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-[#0B0B0B] tracking-tight">
              Your Family Trips
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4F2] text-black/60 hover:text-black flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Saved Trips */}
        <div className="mt-4 space-y-2.5">
          {savedTrips.map((trip) => {
            const isActive = trip.id === activeTripId;
            const currencySymbol = getCurrencySymbol(trip.baseCurrency);

            return (
              <div
                key={trip.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-[#C4F96B]/20 border-[#0B0B0B] shadow-xs'
                    : 'bg-[#F4F4F2] border-transparent hover:bg-black/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => {
                      onSelectTrip(trip.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer pr-3"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#0B0B0B] truncate">
                        {trip.name}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#0B0B0B] text-[#C4F96B]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-black/55 mt-0.5 font-medium">
                      Code: <strong className="font-mono text-black">{trip.joinCode}</strong> • Currency: {currencySymbol} ({trip.baseCurrency})
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {confirmLeaveId === trip.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in">
                        <button
                          onClick={() => {
                            onLeaveTrip(trip.id);
                            setConfirmLeaveId(null);
                          }}
                          className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition"
                        >
                          Confirm Leave
                        </button>
                        <button
                          onClick={() => setConfirmLeaveId(null)}
                          className="px-2 py-1 rounded-full bg-black/10 text-black text-[11px] font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmLeaveId(trip.id)}
                        className="p-1.5 text-black/35 hover:text-rose-600 rounded-full transition"
                        title="Leave this trip"
                        aria-label="Leave trip"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons: Create New or Join Trip */}
        <div className="mt-5 pt-4 border-t border-black/5 space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenCreate();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0B0B] text-white text-xs font-bold hover:bg-black/90 transition shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C4F96B] flex items-center justify-center text-[#0B0B0B]">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>Create Another Trip</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C4F96B]" />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenJoin();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F4F4F2] text-[#0B0B0B] text-xs font-bold hover:bg-black/10 transition border border-black/5"
          >
            <div className="flex items-center gap-2">
              <span>Join with 6-Digit Code</span>
            </div>
            <ChevronRight className="w-4 h-4 text-black/40" />
          </button>
        </div>
      </div>
    </div>
  );
};
