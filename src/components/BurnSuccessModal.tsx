import { useState } from "react";
import { X, Share2, Copy, Check } from "lucide-react";
import { sound } from "../utils/audio";

interface ReclaimSummary {
  itemCount: number;
  solReclaimed: number;
  protocolFeePaid: number;
  netReclaimed: number;
  rewardsMinted: number;
}

interface BurnSuccessModalProps {
  showBurnSuccess: boolean;
  setShowBurnSuccess: (show: boolean) => void;
  reclaimSummary: ReclaimSummary;
  coinSymbol: string;
}

export default function BurnSuccessModal({
  showBurnSuccess,
  setShowBurnSuccess,
  reclaimSummary,
  coinSymbol,
}: BurnSuccessModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const shareText = `🔥 SOL reclaimed from the void! Just purged ${reclaimSummary.itemCount} junk accounts on Solana via @BurnerSol, reclaiming a net +${reclaimSummary.netReclaimed.toFixed(5)} SOL and earning +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}! Clear your wallet storage now at https://burner-sol.io 🚀`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    sound.playSuccessChime();
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!showBurnSuccess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="burn-success-title">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-flame-orange p-8 rounded-none relative [box-shadow:0_30px_60px_rgba(0,0,0,0.85)] space-y-6">

        {/* Close button */}
        <button
          onClick={() => setShowBurnSuccess(false)}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all pointer-events-auto"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon header */}
        <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
          <div className="w-12 h-12 bg-flame-orange transform rotate-45 flex items-center justify-center border border-black animate-pulse">
            <img src="/fire.gif" alt="Flame" className="w-5 h-5 object-contain -rotate-45" loading="lazy" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 id="burn-success-title" className="font-display font-bold italic text-white text-xl tracking-wide uppercase mt-4">
              INCINERATION COMPLETED
            </h3>
            <p className="text-xs text-emerald-400 uppercase font-mono tracking-widest font-bold">
              Rent Recovered in SOL Securely
            </p>
          </div>
        </div>

        {/* Reclaim Details List */}
        <div className="bg-white/[0.02] border border-white/10 p-5 rounded-none space-y-2.5 font-mono text-xs text-left">
          <div className="flex justify-between items-center text-slate-400">
            <span>ACCOUNTS CLOSED:</span>
            <span className="text-white font-bold">{reclaimSummary.itemCount} ACCOUNTS MELTED</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>GROSS SOL RECLAIMED:</span>
            <span className="text-slate-300 font-bold">
              +{reclaimSummary.solReclaimed.toFixed(5)} SOL
            </span>
          </div>

          <div className="flex justify-between items-center text-red-400/80 text-[11px]">
            <span>DYNAMIC PROTOCOL COMMISSION:</span>
            <span>
              -{reclaimSummary.protocolFeePaid.toFixed(5)} SOL
            </span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
            <span className="text-emerald-400 font-bold">RECOVERED RAW RENT:</span>
            <span className="text-emerald-400 font-bold text-sm flex items-center gap-0.5">
              +{reclaimSummary.netReclaimed.toFixed(5)} SOL
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-200">
            <span className="text-indigo-300 font-bold">BURNER EMITTED:</span>
            <span className="text-white font-bold animate-pulse text-indigo-400 font-mono">
              +{reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} {coinSymbol}
            </span>
          </div>

          <p className="text-[9px] text-slate-500 pt-3 font-sans tracking-wide leading-relaxed text-center uppercase">
            MELTED TARGET ACCOUNT DATA ERASED FROM LEDGER REGISTRY CONSTANTS. RECLAIMED SOL RENT APPLIED SUCCESSFULLY TO THE WALLET BALANCE.
          </p>
        </div>

        {/* Share Achievement Panel */}
        <div className="border border-white/5 bg-[#050505] p-3.5 space-y-3 text-left">
          <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <Share2 className="w-3 h-3 text-indigo-400 shrink-0" />
            PROPAGATE TO SOCIAL LAYERS
          </span>

          {/* Shared Text Preview Frame */}
          <div
            className="bg-black border border-white/5 p-2 font-mono text-[9.5px] text-slate-400 rounded-none leading-relaxed select-none relative overflow-hidden group cursor-pointer"
            onClick={handleCopy}
          >
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 border border-white/10 text-[8px] text-white">
              CLICK TO COPY
            </div>
            "Just purged {reclaimSummary.itemCount} junk accounts on Solana via @BurnerSol, reclaiming +{reclaimSummary.netReclaimed.toFixed(5)} SOL and earning +{reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${coinSymbol}!..."
          </div>

          {/* Share Interaction Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className={`py-1.5 border leading-none text-[9px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                isCopied
                  ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 animate-pulse"
                  : "bg-[#0b0b0b]/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
              }`}
              style={{ cursor: "pointer" }}
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  COPIED!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                  COPY TEXT
                </>
              )}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playHoverPluck()}
              aria-label="Share on X (Twitter)"
              className="py-1.5 bg-[#0b0b0b]/80 border border-white/10 text-slate-300 hover:text-white hover:border-[#1d9bf0]/40 hover:bg-[#1d9bf0]/10 leading-none text-[9px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
              style={{ cursor: "pointer" }}
            >
              <Share2 className="w-3 h-3 text-[#1d9bf0] shrink-0" aria-hidden="true" />
              SHARE ON X
            </a>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setShowBurnSuccess(false)}
          className="w-full py-3.5 rounded-none font-display font-bold text-xs text-white bg-flame-orange hover:bg-orange-600 tracking-[0.2em] uppercase transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          FURNACE VENT CLOSED
        </button>
      </div>
    </div>
  );
}
