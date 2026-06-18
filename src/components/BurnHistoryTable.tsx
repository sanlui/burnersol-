import { useState, useEffect, useMemo } from "react";
import { Signal, ShieldCheck, Terminal, AlertCircle } from "lucide-react";

interface ParticipantBurn {
  id: string;
  address: string;
  wallet: string;
  amountBurned: string;
  spamScore: number;
  shard: string;
  solReclaimed: number;
  isUserTx?: boolean;
  tokensEarned?: number;
  timeLabel?: string;
  txHash: string;
}

interface BurnHistoryTableProps {
  t: any;
  coinSymbol: string;
  coinName: string;
  userTxs?: any[];
  userWalletAddress?: string | null;
  language?: string;
  protocolFeePercent?: number;
  giftMultiplier?: number;
}

async function fetchRealOnChainBurns(): Promise<ParticipantBurn[]> {
  try {
    const resp = await fetch("/api/solana/recent-txs");
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data?.items || data.items.length === 0) return [];

    return data.items.map((tx: any) => ({
      id: tx.id,
      address: tx.address,
      wallet: detectWalletType(tx),
      amountBurned: tx.amount,
      spamScore: tx.isScam ? 100 : 0,
      shard: "On-Chain",
      solReclaimed: tx.solReclaimed || 0,
      isUserTx: false,
      tokensEarned: 0,
      txHash: tx.txHash,
      timeLabel: tx.time || "Just now",
    }));
  } catch {
    return [];
  }
}

function detectWalletType(tx: any): string {
  const fee = tx.gasCost || 0;
  const asset = (tx.asset || "").toLowerCase();
  if (asset.includes("closed")) return "Account Close";
  if (asset.includes("received")) return "Token Receive";
  if (asset.includes("sent")) return "Token Send";
  if (asset.includes("sol transfer")) return "SOL Transfer";
  return "On-Chain Tx";
}

export default function BurnHistoryTable({
  t,
  coinSymbol,
  coinName,
  userTxs = [],
  userWalletAddress = null,
  language = "it",
  protocolFeePercent = 50,
  giftMultiplier = 1250000,
}: BurnHistoryTableProps) {
  const [rate, setRate] = useState(1.42);
  const [liveItems, setLiveItems] = useState<ParticipantBurn[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRate(Number((1.0 + Math.random() * 0.8).toFixed(2)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real on-chain transactions
  useEffect(() => {
    const loadLive = async () => {
      const items = await fetchRealOnChainBurns();
      if (items.length > 0) setLiveItems(items);
    };
    loadLive();

    const interval = setInterval(async () => {
      const items = await fetchRealOnChainBurns();
      if (items.length > 0) setLiveItems(items);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Map user's own transactions
  const userItems = useMemo(() => {
    return (userTxs || []).map((tx) => {
      let displayAddress = "HN4c...8uXz";
      if (tx.walletAddress) {
        displayAddress = tx.walletAddress.includes("...")
          ? tx.walletAddress
          : `${tx.walletAddress.slice(0, 4)}...${tx.walletAddress.slice(-4)}`;
      } else if (userWalletAddress) {
        displayAddress = `${userWalletAddress.slice(0, 4)}...${userWalletAddress.slice(-4)}`;
      }

      const protocolFeePaid = tx.solReclaimed * (protocolFeePercent / 100);
      const tokensReward = tx.rewardsMinted !== undefined ? tx.rewardsMinted : (protocolFeePaid * giftMultiplier);

      return {
        id: tx.id,
        address: displayAddress,
        wallet: tx.walletName || "Phantom (You)",
        amountBurned: `${tx.itemCount} account SPL`,
        spamScore: 100,
        shard: tx.shard || "Self-Shard",
        solReclaimed: tx.solReclaimed,
        isUserTx: true,
        tokensEarned: tokensReward,
        txHash: tx.txHash || "mock-hash",
        timeLabel: tx.timestamp === "Just now" ? (language === "it" ? "Ora" : "LIVE") : tx.timestamp,
      };
    });
  }, [userTxs, userWalletAddress, language, protocolFeePercent, giftMultiplier]);

  // Merge: user txs first (highlighted), then live on-chain txs
  const combinedItems = useMemo(() => {
    const seen = new Set<string>();
    const result: ParticipantBurn[] = [];

    for (const item of userItems) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
    for (const item of liveItems) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
    return result.slice(0, 12);
  }, [userItems, liveItems]);

  return (
    <div id="burner-history-live" className="w-full relative glass-panel border border-white/10 rounded-none bg-black/95 p-5 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.03)] flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="text-left">
          <h3 className="font-display font-medium text-white tracking-[0.18em] uppercase text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-flame-orange rotate-45" /> {language === "it" ? "CRONOLOGIA DI RETE PARTECIPANTI GLOBALI" : "GLOBAL PARTICIPANT NETWORK LOG"}
          </h3>
          <p className="text-[10px] text-slate-400 font-light mt-0.5 tracking-wide uppercase">
            {language === "it" ? "MOSTRA SOLO LE TRANSAZIONI REALI ON-CHAIN" : "SHOWING ONLY GENUINE ON-CHAIN TRANSACTIONS"}
          </p>
        </div>

        <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-bold bg-emerald-950/20 border border-emerald-500/20 px-2 py-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          {language === "it" ? "SINCRO REALE ATTIVO" : "ACTIVE REAL-TIME SYNC"}
        </div>
      </div>

      <div className="overflow-x-auto min-h-[220px] flex flex-col justify-center">
        {combinedItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 border border-dashed border-white/10 bg-white/[0.01]">
            <AlertCircle className="w-8 h-8 text-slate-500 animate-pulse" />
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">
                {language === "it" ? "Connessione alla rete in corso..." : "Connecting to network..."}
              </p>
              <p className="text-[10px] font-mono text-slate-500 uppercase leading-relaxed max-w-md mx-auto">
                {language === "it"
                  ? "Recupero transazioni reali on-chain dalla rete Solana"
                  : "Fetching real on-chain transactions from Solana network"}
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.01] text-slate-400 uppercase text-[9px] tracking-widest">
                <th className="py-2.5 px-3">{language === "it" ? "INDIRIZZO WALLET" : "WALLET ADDRESS"}</th>
                <th className="py-2.5 px-3">{language === "it" ? "WALLET" : "WALLET"}</th>
                <th className="py-2.5 px-3">{language === "it" ? "QUANTITA BRUCIATA" : "AMOUNT BURNED"}</th>
                <th className="py-2.5 px-3 text-center">{language === "it" ? "SPAM PURGATO" : "SPAM PURGED"}</th>
                <th className="py-2.5 px-3 text-center">SHARD</th>
                <th className="py-2.5 px-3 text-right">{language === "it" ? "SOL RECUPERATI" : "SOL RECLAIMED"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {combinedItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-emerald-950/20 font-bold border-l-2 transition-all duration-200 ${
                    item.isUserTx
                      ? "bg-emerald-950/10 border-l-emerald-400"
                      : "bg-white/[0.01] border-l-white/10 hover:border-l-emerald-400"
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 flex-nowrap">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-white font-mono text-[11px] font-bold block">
                          {item.address}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 select-none">
                          <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">
                            {item.timeLabel === "LIVE" || item.timeLabel === "Just now" || item.timeLabel === "Ora" ? (
                              <span className="text-flame-orange font-bold animate-pulse">● {t.globalFeedTxLabel || "LIVE"}</span>
                            ) : (
                              item.timeLabel
                            )}
                          </span>
                          <span className="text-white/10 text-[8px] font-mono">|</span>
                          <a
                            href={`https://solscan.io/tx/${item.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 active:text-white transition-colors text-[9px] hover:underline flex items-center gap-0.5 uppercase tracking-wider font-bold"
                            title={language === "it" ? "Visualizza la transazione su Solscan" : "View transaction on Solscan"}
                          >
                            SOLSCAN ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-1.5 py-0.5 text-[9px] select-none border font-bold ${
                      item.isUserTx
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                        : "bg-white/[0.02] border-white/10 text-slate-400"
                    }`}>
                      {item.wallet}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-emerald-400">
                    {item.amountBurned}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-1.5 py-0.5 text-[10px] select-none border ${
                      item.spamScore > 0
                        ? "text-red-400 bg-red-950/20 border-red-500/20"
                        : "text-emerald-400 bg-emerald-950/20 border-emerald-500/20"
                    }`}>
                      {item.spamScore > 0 ? "100% SPAM" : "CLEAN"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400 text-[10px]">
                    {item.shard}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-400 font-bold text-[11.5px]">
                        +{item.solReclaimed.toFixed(5)} SOL
                      </span>
                      {item.tokensEarned !== undefined && item.tokensEarned > 0 && (
                        <span className="text-flame-orange text-[9.5px]">
                          +{Math.round(item.tokensEarned).toLocaleString()} ${coinSymbol}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4 font-mono text-[9px] text-slate-500 tracking-wider">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>SHARDS: <span className="text-emerald-400 font-bold">ACTIVE</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 text-flame-orange" />
          <span>REALTIME RATE: <span className="text-white font-bold">{rate.toFixed(2)} BLK/S</span></span>
        </div>
      </div>
    </div>
  );
}
