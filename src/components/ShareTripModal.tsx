import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Users, Sparkles, Smartphone } from 'lucide-react';
import { TripMember, getCurrencySymbol } from '../types';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripName: string;
  joinCode: string;
  baseCurrency?: string;
  members: TripMember[];
  onAddMember?: (name: string, role: string) => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  tripName,
  joinCode,
  baseCurrency = 'INR',
  members,
  onAddMember,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const currencySymbol = getCurrencySymbol(baseCurrency);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}?code=${joinCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `Hey! Join our family trip "${tripName}" on TripSplit!\n\n🔑 Join Code: *${joinCode}*\nCurrency: ${baseCurrency} (${currencySymbol})\n\nOpen app: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#C4F96B] flex items-center justify-center text-[#0B0B0B]">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-[#0B0B0B] tracking-tight">
              Invite Family & Sync
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4F2] text-black/60 hover:text-black flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Join Code Highlight */}
        <div className="mt-4 p-5 rounded-[22px] bg-[#C4F96B] lime-grid-pattern border border-black/5 text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-black/60 block mb-1">
            Trip Join Code
          </span>
          <div className="font-mono text-3xl font-extrabold text-[#0B0B0B] tracking-widest my-1">
            {joinCode}
          </div>
          <p className="text-xs text-black/70 mt-1">
            Share this 6-character code with your family members to sync balances.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0B0B0B] text-xs font-bold hover:bg-white/90 transition shadow-xs"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3F6212] stroke-[3]" />
                  <span>Copied Code</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B0B0B] text-white text-xs font-bold hover:bg-black/90 transition shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#C4F96B]" />
              <span>Share WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Web Link Option */}
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-black/50 block mb-1.5">
            Direct Invite Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#F4F4F2] text-xs font-medium text-black/70 truncate border border-black/5"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3.5 py-2.5 rounded-2xl bg-[#0B0B0B] text-white text-xs font-semibold hover:bg-black/85 transition shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C4F96B]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Members List */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
              Synced Members ({members.length})
            </label>
            <span className="text-[10px] font-bold text-[#3F6212] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F6212] animate-pulse" />
              Live on Firestore
            </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F4F4F2]">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.initials}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0B0B0B]">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-black/50 ml-1.5 font-medium">
                      ({m.role || 'Member'})
                    </span>
                  </div>
                </div>
                {m.isCurrentUser && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B0B0B] text-[#C4F96B]">
                    YOU
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
