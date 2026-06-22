import { Flame, AlertTriangle } from "lucide-react";
import { TrashItem } from "../types";

interface BurnConfirmModalProps {
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  items: TrashItem[];
  totalReclaimSol: number;
  protocolFeeSol: number;
  netReclaimSol: number;
  onConfirm: () => void;
  isProcessing: boolean;
}

export default function BurnConfirmModal({
  showConfirm,
  setShowConfirm,
  items,
  totalReclaimSol,
  protocolFeeSol,
  netReclaimSol,
  onConfirm,
  isProcessing,
}: BurnConfirmModalProps) {
  if (!showConfirm) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="burn-confirm-title">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-flame-orange p-6 rounded-none relative [box-shadow:0_30px_60px_rgba(0,0,0,0.85)] space-y-5">
        
        {/* Close button */}
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="w-10 h-10 bg-flame-orange/20 border border-flame-orange/40 flex items-center justify-center">
            <Flame className="w-5 h-5 text-flame-orange" />
          </div>
          <div>
            <h3 id="burn-confirm-title" className="font-display font-bold text-white text-lg tracking-wide uppercase">
              Combustion Ready
            </h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              {items.length} account{items.length > 1 ? "s" : ""} queued
            </p>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-black/50 border border-white/5 p-4 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider">Est. Network Fee</span>
            <span className="text-slate-300">~0.000005 SOL</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider">Accounts to Close</span>
            <span className="text-white">{items.length}</span>
          </div>

          <div className="border-t border-white/10 pt-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">Total Reclaimable</span>
              <span className="text-emerald-400 font-bold">+{totalReclaimSol.toFixed(5)} SOL</span>
            </div>
            
            <div className="flex justify-between items-center text-red-400/80 text-[10px]">
              <span className="uppercase tracking-wider">Protocol Fee (1.5%)</span>
              <span>-{protocolFeeSol.toFixed(5)} SOL</span>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-2">
              <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">Net Recovery</span>
              <span className="text-emerald-400 font-bold text-sm">+{netReclaimSol.toFixed(5)} SOL</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 text-[10px] text-amber-500/80 bg-amber-500/5 border border-amber-500/20 p-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-mono leading-relaxed">
            Account data will be permanently destroyed. This action cannot be undone after confirmation.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isProcessing}
            className="py-3 border border-white/20 text-slate-300 font-mono text-[10px] uppercase tracking-wider hover:bg-white/5 transition-all disabled:opacity-30"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="py-3 bg-flame-orange text-white font-mono text-[10px] uppercase tracking-wider hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>Confirm</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}