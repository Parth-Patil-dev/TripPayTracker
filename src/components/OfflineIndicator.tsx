import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <aside
      aria-label="Network status"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300"
    >
      {!isOnline ? (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0B0B] text-white border border-amber-400/40 shadow-xl text-xs font-bold backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span className="tracking-tight text-white/95">Offline — will sync</span>
        </div>
      ) : wasOffline ? (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0B0B] text-white border border-[#C4F96B]/50 shadow-xl text-xs font-bold backdrop-blur-md animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#C4F96B]" />
          <span className="tracking-tight text-white/95">Back online — syncing</span>
        </div>
      ) : null}
    </aside>
  );
};
