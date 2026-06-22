import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { useSafeWallet } from "../providers/SolanaWalletProvider";
import { sound } from "../utils/audio";

interface HeaderProps {
  walletBalance: number;
}

const SOL_MINT = "So11111111111111111111111111111111111111112";

export default function Header({ walletBalance }: HeaderProps) {
  const { publicKey, connecting, connected, disconnecting, disconnect, setVisible } =
    useSafeWallet();
  const [solPrice, setSolPrice] = useState<number>(-1);

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 5)}...${publicKey.toBase58().slice(-4)}`
    : null;

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`https://api.jup.ag/price/v2?ids=${SOL_MINT}`, { signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) {
          setSolPrice(-1);
          return;
        }
        const data = await res.json();
        const price = data?.data?.[SOL_MINT]?.price;
        if (price) setSolPrice(Number(price));
        else setSolPrice(-1);
      } catch {
        setSolPrice(-1);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-white/10 bg-[#060606e5] backdrop-blur-lg sticky top-0 z-40" role="banner">
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-flame-orange/40 to-transparent" aria-hidden="true" />
      <div className="max-w-[1350px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" aria-label="BurnerSOL home" className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 bg-flame-orange rounded-none transform rotate-45 flex items-center justify-center border border-black shadow-lg" aria-hidden="true">
              <div className="w-4 h-4 bg-black rounded-none"></div>
            </div>
            <div className="flex flex-col ml-1 text-left">
              <span className="font-display font-black text-white text-base tracking-tighter uppercase italic leading-none">
                BURNERSOL
              </span>
              <span className="text-[8px] text-flame-orange font-mono tracking-[0.2em] leading-none mt-1 uppercase">
                SCARCITY CRUCIBLE
              </span>
            </div>
          </a>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4 shrink-0" aria-label="Wallet connection">
          {solPrice >= 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 text-[11px] font-mono bg-white/[0.02]" role="status" aria-live="polite">
              <TrendingUp className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              <span className="text-emerald-400 font-bold">${solPrice.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-3 py-1.5 border border-white/10 text-[11px] font-mono bg-white/[0.02]" role="status" aria-label={`SOL balance: ${walletBalance.toFixed(2)}`}>
            <span className="text-white font-bold">
              {walletBalance.toFixed(2)}
            </span>
            <span className="text-[9px] text-slate-500 font-bold">SOL</span>
          </div>

          {connecting ? (
            <button
              type="button"
              disabled
              aria-label="Connecting wallet"
              className="flex border border-flame-orange/40 px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] items-center gap-2 bg-flame-orange/10 text-flame-orange transition-all shrink-0 font-bold opacity-70"
            >
              <div className="w-3.5 h-3.5 border-2 border-flame-orange/30 border-t-flame-orange rounded-full animate-spin" aria-hidden="true" />
              <span>CONNECTING...</span>
            </button>
          ) : connected && publicKey ? (
            <button
              type="button"
              onClick={() => { sound.playHoverPluck(); disconnect(); }}
              disabled={disconnecting}
              aria-label={`Connected to ${shortAddress}. Click to disconnect.`}
              className="flex border border-emerald-500/30 hover:border-red-500/60 px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] items-center gap-2 bg-emerald-950/20 hover:bg-red-950/20 text-emerald-400 hover:text-red-400 transition-all shrink-0 cursor-pointer font-bold"
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" aria-hidden="true" />
              <span>{shortAddress}</span>
              {disconnecting && (
                <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" aria-hidden="true" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { sound.playHoverPluck(); setVisible(true); }}
              aria-label="Connect Solana wallet"
              className="flex border border-flame-orange/40 hover:border-flame-orange px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] items-center gap-2 bg-flame-orange/10 text-flame-orange transition-all shrink-0 cursor-pointer font-bold animate-pulse"
            >
              <span>CONNECT WALLET</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
