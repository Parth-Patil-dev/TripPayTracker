import React, { useState } from 'react';
import { TripMember, getCurrencySymbol } from '../types';
import { 
  Share2, 
  Plus, 
  Copy, 
  Check, 
  ChevronDown, 
  MessageCircle, 
  Compass, 
  Wifi 
} from 'lucide-react';

interface HeaderPanelProps {
  tripName: string;
  baseCurrency?: string;
  joinCode: string;
  members: TripMember[];
  onOpenTripSwitcher: () => void;
  onOpenInvite: () => void;
}

export const HeaderPanel: React.FC<HeaderPanelProps> = ({
  tripName,
  baseCurrency = 'INR',
  joinCode,
  members,
  onOpenTripSwitcher,
  onOpenInvite,
}) => {
  const [copied, setCopied] = useState(false);
  const currencySymbol = getCurrencySymbol(baseCurrency);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Hey! Join our family trip "${tripName}" on TripSplit!\n\n🔑 Join Code: *${joinCode}*\nCurrency: ${baseCurrency} (${currencySymbol})\n\nOpen app: ${window.location.origin}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <header className="px-4 pt-3 pb-2">
      <div className="relative overflow-hidden bg-[#C4F96B] rounded-[28px] p-5 shadow-sm lime-grid-pattern border border-black/5">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#E6FCB0] rounded-full blur-2xl opacity-70 pointer-events-none" />

        {/* Top row: Trip Switcher + Live Sync indicator */}
        <div className="flex items-center justify-between mb-3.5 relative z-10">
          {/* Trip Switcher Button */}
          <button
            onClick={onOpenTripSwitcher}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 hover:bg-black/15 backdrop-blur-xs text-xs font-bold text-[#0B0B0B] transition active:scale-95"
            title="Switch Trip or Manage Trips"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="truncate max-w-[130px]">{tripName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-black/60" />
          </button>

          {/* Real-time Live Sync Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-xs text-[11px] font-semibold text-[#0B0B0B] border border-black/5">
            <span className="w-2 h-2 rounded-full bg-[#3F6212] animate-pulse" />
            <span>LIVE SYNC</span>
          </div>
        </div>

        {/* Trip Title & Currency */}
        <div className="relative z-10 mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B0B0B] tracking-tight leading-tight">
              {tripName}
            </h1>
            <span className="text-xs font-extrabold text-[#3F6212] bg-[#E6FCB0] px-2 py-0.5 rounded-full border border-black/5">
              {currencySymbol} {baseCurrency}
            </span>
          </div>
          <p className="text-xs font-medium text-black/70 mt-1">
            {members.length} {members.length === 1 ? 'member' : 'family members'} • Real-time phone sync
          </p>
        </div>

        {/* Join Code Banner with Copy and WhatsApp Share */}
        <div className="relative z-10 mb-4 p-2.5 sm:p-3 bg-black/10 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border border-black/5">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-black/60 shrink-0">
              JOIN CODE
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-[#0B0B0B] tracking-widest bg-white/90 px-2 py-0.5 rounded-lg border border-black/10 shadow-2xs">
              {joinCode}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            {/* Copy button */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-full bg-white text-[#0B0B0B] text-xs font-semibold hover:bg-white/90 transition active:scale-95 shadow-2xs border border-black/10"
              title="Copy 6-character code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3F6212] stroke-[3]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-black/70" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* WhatsApp Share button */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-[#0B0B0B] text-white text-xs font-semibold hover:bg-black/85 transition active:scale-95 shadow-2xs"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#C4F96B]" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Members Avatar Row */}
        <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-black/10">
          <div className="flex items-center -space-x-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="relative group cursor-pointer transition-transform hover:scale-105 hover:z-20"
                title={`${member.name} (${member.role || 'Member'})`}
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#C4F96B] shadow-xs"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#C4F96B] shadow-xs"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.initials}
                  </div>
                )}
                {member.isCurrentUser && (
                  <span 
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#0B0B0B] border-2 border-[#C4F96B] rounded-full" 
                    title="You"
                  />
                )}
              </div>
            ))}

            {/* Plus add member button */}
            <button
              onClick={onOpenInvite}
              className="w-9 h-9 rounded-full bg-black/10 border-2 border-[#C4F96B] text-[#0B0B0B] flex items-center justify-center hover:bg-black/20 transition active:scale-95 text-xs font-bold"
              title="Invite or add family member"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black/55">
              Live Group
            </span>
            <div className="text-xs font-extrabold text-[#0B0B0B]">
              {members.length} {members.length === 1 ? 'person' : 'people'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
