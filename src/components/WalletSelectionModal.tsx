import React from "react";
import { X } from "lucide-react";
import { EIP6963Wallet } from "../hooks/useEIP6963Wallets";
import { getIconForRdns, getNameForRdns } from "../hooks/useEIP6963Wallets";

interface WalletSelectionModalProps {
  wallets: EIP6963Wallet[];
  onSelect: (wallet: EIP6963Wallet) => void;
  onClose: () => void;
  connectingWallet: string | null;
  error: string | null;
  language: "en" | "it";
}

export default function WalletSelectionModal({
  wallets,
  onSelect,
  onClose,
  connectingWallet,
  error,
  language,
}: WalletSelectionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-sm border border-white/10 bg-[#060606] p-5 space-y-4"
        style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.85)" }}
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-flame-orange/0 via-flame-orange to-flame-orange/0" />

        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-left">
            <div className="w-2 h-2 bg-flame-orange rounded-full animate-pulse" />
            <h3 className="font-display font-medium text-white tracking-widest uppercase text-[10px]">
              {language === "it" ? "SELEZIONA WALLET" : "SELECT WALLET"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/5 text-slate-500 hover:text-white transition-colors border border-transparent hover:border-white/15"
            style={{ cursor: "pointer" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 border border-rose-500/30 bg-rose-950/20 text-rose-400 text-[10px] font-mono text-left">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {wallets.map((wallet) => {
            const isConnecting = connectingWallet === wallet.rdns;
            return (
              <button
                key={wallet.rdns}
                type="button"
                onClick={() => onSelect(wallet)}
                disabled={isConnecting}
                className="w-full p-3 flex items-center justify-between bg-white/[0.01] hover:bg-white/5 border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ cursor: isConnecting ? "not-allowed" : "pointer" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    {wallet.icon.startsWith("data:image") ? (
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className="w-8 h-8"
                      />
                    ) : (
                      getIconForRdns(wallet.rdns)
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      {wallet.name || getNameForRdns(wallet.rdns)}
                    </p>
                  </div>
                </div>
                {isConnecting ? (
                  <div className="w-4 h-4 border-2 border-flame-orange/30 border-t-flame-orange rounded-full animate-spin" />
                ) : (
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[9px] text-slate-500 leading-relaxed font-light text-left">
          {language === "it"
            ? "Solo i wallet installati come estensione del browser vengono rilevati."
            : "Only browser extension wallets that have been installed are detected."}
        </p>
      </div>
    </div>
  );
}