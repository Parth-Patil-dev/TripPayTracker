import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="mx-4 mb-3 p-3 bg-white rounded-2xl border border-black/5 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#C4F96B] flex items-center justify-center shrink-0 text-[#0B0B0B]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0B0B0B] truncate">Install TripSplit on Phone</p>
            <p className="text-[11px] text-black/55 truncate">Fast offline access & home screen icon</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0B0B] text-white text-xs font-medium hover:bg-black/90 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#C4F96B]" />
              <span>Install</span>
            </button>
          )}

          {isIOS && !isInstallable && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0B0B] text-white text-xs font-medium hover:bg-black/90 transition shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C4F96B]" />
              <span>Add to Home</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-black/40 hover:text-black/70 rounded-full transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C4F96B] flex items-center justify-center text-[#0B0B0B] mb-2 font-bold text-xl">
                ⚡
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-2 text-black/40 hover:text-black/70 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-[#0B0B0B] tracking-tight">
              Install on iPhone or iPad
            </h3>
            <p className="mt-1 text-xs text-black/60 leading-relaxed">
              Install TripSplit for a fullscreen app experience on your family trip.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F4F4F2]">
                <div className="w-6 h-6 rounded-full bg-black text-[#C4F96B] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-black/80">
                  Tap the <strong className="text-black">Share</strong> icon <Share2 className="w-3.5 h-3.5 inline mx-1 text-black/70" /> in Safari’s bottom toolbar.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F4F4F2]">
                <div className="w-6 h-6 rounded-full bg-black text-[#C4F96B] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-black/80">
                  Scroll down the menu and tap <strong className="text-black">"Add to Home Screen"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F4F4F2]">
                <div className="w-6 h-6 rounded-full bg-black text-[#C4F96B] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-black/80">
                  Tap <strong className="text-black">Add</strong> in the top right corner. You’re ready!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full rounded-full bg-[#0B0B0B] py-3 text-xs font-semibold text-white hover:bg-black/80 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
