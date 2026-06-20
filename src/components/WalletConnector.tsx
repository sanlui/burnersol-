import { useSafeWallet } from "../providers/SolanaWalletProvider";
import { Wallet } from "lucide-react";
import { sound } from "../utils/audio";

export default function WalletConnector() {
  const { publicKey, connecting, connected, disconnecting, disconnect, setVisible } = useSafeWallet();

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 5)}...${publicKey.toBase58().slice(-4)}`
    : null;

  if (connecting) {
    return (
      <button
        type="button"
        disabled
        className="flex border border-flame-orange/40 px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] items-center gap-2 bg-flame-orange/10 text-flame-orange transition-all shrink-0 font-bold opacity-70"
      >
        <div className="w-3.5 h-3.5 border-2 border-flame-orange/30 border-t-flame-orange rounded-full animate-spin" />
        <span>CONNECTING...</span>
      </button>
    );
  }

  if (connected && publicKey) {
    return (
      <button
        type="button"
        onClick={() => { sound.playHoverPluck(); disconnect(); }}
        disabled={disconnecting}
        aria-label={`Connected to ${shortAddress}. Click to disconnect.`}
        className="flex border border-emerald-500/30 hover:border-red-500/60 px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] items-center gap-2 bg-emerald-950/20 hover:bg-red-950/20 text-emerald-400 hover:text-red-400 transition-all shrink-0 cursor-pointer font-bold"
      >
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
        <span>{shortAddress}</span>
        {disconnecting && (
          <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => { sound.playHoverPluck(); setVisible(true); }}
      aria-label="Connect Solana wallet"
      className="flex border border-flame-orange/40 hover:border-flame-orange px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] items-center gap-2 bg-flame-orange/10 text-flame-orange transition-all shrink-0 cursor-pointer font-bold animate-pulse"
    >
      <Wallet className="w-3.5 h-3.5 shrink-0" />
      <span>CONNECT WALLET</span>
    </button>
  );
}

export function dispatchOpenWalletModal() {
  window.dispatchEvent(new CustomEvent("burner:openWalletModal"));
}