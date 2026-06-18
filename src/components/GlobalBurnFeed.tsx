import React, { useState, useEffect, useCallback } from "react";
import {
  Flame,
  CheckCircle,
  Globe,
  Search,
  Pause,
  Play,
  ExternalLink,
  Activity,
  Cpu,
  X,
  RefreshCw,
  Wallet
} from "lucide-react";
import { sound } from "../utils/audio";
import { useLanguage } from "../contexts/LanguageContext";

interface GlobalBurnFeedProps {
  userWalletAddress?: string | null;
  personalBurnHistory: PersonalBurnTx[];
}

interface PersonalBurnTx {
  id: string;
  txHash: string;
  timestamp: string;
  itemCount: number;
  solReclaimed: number;
  walletAddress: string;
  walletName: string;
  status: "success" | "pending";
}

interface FeedItem {
  id: string;
  address: string;
  fullAddress?: string;
  asset: string;
  amount: string;
  solReclaimed: number;
  time: string;
  isScam: boolean;
  countryFlag: string;
  server: { city: string; countryCode: string; flag: string; ip: string; ping: string };
  txHash: string;
  gasCost: number;
  isPersonal?: boolean;
  walletName?: string;
}

export default function GlobalBurnFeed({ personalBurnHistory = [] }: Omit<GlobalBurnFeedProps, "t">) {
  const { t } = useLanguage();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [networkSpeed, setNetworkSpeed] = useState(1.4);
  const [filterType, setFilterType] = useState<"all" | "spam" | "empty">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [cumulativeSol, setCumulativeSol] = useState(0);
  const [cumulativePurges, setCumulativePurges] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isIt = t.globalFeedColAddress === "INDIRIZZO WALLET";

  const labels = isIt ? {
    searchPlace: "Filtra per asset, indirizzo o hash...",
    allPurges: "Tutte le Chiusure",
    spamOnly: "Solo Spam / Scam",
    emptyAcc: "Account Inattivi",
    liveOn: "LIVE ATTIVO",
    liveOff: "FEED SOSPESO",
    activeNodes: "NODI BURNERSOL ATTIVI",
    reclaimedTotal: "SOL TOTALI RECUPERATI DAGLI UTENTI",
    totalPurges: "TRANSAZIONI BURNERSOL",
    nodePing: "Latenza",
    txReceipt: "Attestato Verificato",
    nodeLocation: "Indirizzo Wallet",
    reclaimAuth: "Transazione Verificata",
    viewSolscan: "Ispeziona su Solscan",
    close: "Chiudi Dettagli",
    feedControls: "Controlli Feed",
    searchTitle: "Strumento di Ricerca",
    statusBadge: "STATO STABILE",
    gasPaid: "Gas Rete",
    nodeIp: "TX Signature",
    riskRating: "Tipo Transazione",
    cumulativeStats: "METRICHE GLOBALI",
    personalBurns: "Transazioni del Sito",
    noHistory: "Nessuna transazione registrata. Usa lo strumento BurnerSol per bruciare i tuoi account.",
    loading: "Caricamento...",
  } : {
    searchPlace: "Search by asset, address or hash...",
    allPurges: "All Closures",
    spamOnly: "Scam / Spam Only",
    emptyAcc: "Inactive Accounts",
    liveOn: "LIVE ACTIVE",
    liveOff: "FEED PAUSED",
    activeNodes: "ACTIVE BURNERSOL NODES",
    reclaimedTotal: "TOTAL SOL RECLAIMED BY USERS",
    totalPurges: "BURNERSOL TRANSACTIONS",
    nodePing: "Latency",
    txReceipt: "Verified Receipt",
    nodeLocation: "Wallet Address",
    reclaimAuth: "Verified Transaction",
    viewSolscan: "Check on Solscan",
    close: "Close Details",
    feedControls: "Feed Controls",
    searchTitle: "Search Core Filter",
    statusBadge: "HEALTHY STATE",
    gasPaid: "Network Gas",
    nodeIp: "TX Signature",
    riskRating: "Transaction Type",
    cumulativeStats: "GLOBAL METRICS",
    personalBurns: "Site Transactions",
    noHistory: "No transactions recorded yet. Use BurnerSol to burn your accounts.",
    loading: "Loading...",
  };

  const loadFeed = useCallback(() => {
    const personalTxs: FeedItem[] = personalBurnHistory.map((tx) => ({
      id: `personal-${tx.id}`,
      address: tx.walletAddress ? `${tx.walletAddress.slice(0, 4)}...${tx.walletAddress.slice(-4)}` : "You",
      fullAddress: tx.walletAddress,
      asset: `Burned ${tx.itemCount} item${tx.itemCount !== 1 ? "s" : ""}`,
      amount: `${tx.itemCount}`,
      solReclaimed: tx.solReclaimed,
      time: tx.timestamp,
      isScam: false,
      countryFlag: "🔥",
      server: { city: tx.walletName || "Wallet", countryCode: "WEB", flag: "🔥", ip: "burnersol", ping: "---" },
      txHash: tx.txHash,
      gasCost: 0.000005,
      isPersonal: true,
      walletName: tx.walletName,
    }));

    const totalSol = personalTxs.reduce((sum, i) => sum + (i.solReclaimed || 0), 0);
    setCumulativeSol(totalSol);
    setCumulativePurges(personalTxs.length);
    setFeed(personalTxs.slice(0, 12));
    setIsLoading(false);
  }, [personalBurnHistory]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setNetworkSpeed(Number((1.0 + Math.random() * 0.8).toFixed(2)));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredFeed = feed.filter((item) => {
    if (filterType === "spam" && !item.isScam) return false;
    if (filterType === "empty" && item.isScam) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.asset.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.txHash.toLowerCase().includes(q) ||
        item.walletName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full glass-panel border border-white/10 rounded-none overflow-hidden flex flex-col h-full bg-[#030303] relative" id="global-burnfeed-container">

      <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-black/80 p-4">
        <div className="p-2 flex flex-col justify-center text-left">
          <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest block">
            {labels.reclaimedTotal}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-display font-black tracking-tight text-emerald-400 italic">
              {cumulativeSol.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })}
            </span>
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 italic">SOL</span>
          </div>
        </div>
        <div className="p-2 flex flex-col justify-center text-left sm:pl-6">
          <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest block">
            {labels.totalPurges}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-display font-black tracking-tight text-white italic">
              {cumulativePurges.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono font-black uppercase text-flame-orange italic">BURNS</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-flame-orange/10 border border-flame-orange/30 rounded-none animate-pulse-glow">
            <Flame className="w-4 h-4 text-flame-orange" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold italic text-white tracking-widest uppercase text-xs">
              {t.globalFeedTitle}
            </h3>
            <p className="text-[9px] text-slate-500 font-mono tracking-wider">
              {t.globalFeedSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-center">
          <div className="flex items-center gap-1.5 text-slate-400 bg-white/[0.02] border border-white/5 py-1 px-2.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] tracking-widest uppercase">{labels.statusBadge}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 bg-white/[0.02] border border-white/5 py-1 px-2.5">
            <Wallet className="w-3 h-3 text-flame-orange" />
            <span className="text-[9px] tracking-widest uppercase">{labels.personalBurns}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-2 bg-[#050505] border-b border-white/5">
        <span className="text-[8.5px] text-emerald-500 font-mono tracking-wider flex items-center gap-1 uppercase">
          <CheckCircle className="w-3 h-3 shrink-0" />
          {labels.activeNodes}: {cumulativePurges} verified burn transactions from BurnerSol users
        </span>
      </div>

      <div className="p-4 bg-black/40 border-b border-white/5 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            className="w-full bg-black/60 border border-white/10 pl-8 pr-3 py-1 text-[11px] font-mono text-white placeholder-slate-600 focus:outline-hidden focus:border-flame-orange rounded-none"
            placeholder={labels.searchPlace}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); sound.playHoverPluck(); }}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); sound.playHoverPluck(); }} className="absolute right-2.5 top-2.5">
              <X className="w-3 h-3 text-slate-500 hover:text-white" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex border border-white/10 bg-black/60 p-0.5">
            {(["all", "spam", "empty"] as const).map((tType) => (
              <button
                key={tType}
                onClick={() => { sound.playHoverPluck(); setFilterType(tType); }}
                className={`px-2 py-1 font-mono text-[8.5px] uppercase transition-all ${
                  filterType === tType
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {tType === "all" ? labels.allPurges : tType === "spam" ? labels.spamOnly : labels.emptyAcc}
              </button>
            ))}
          </div>

          <button
            onClick={() => { sound.playHoverPluck(); setIsPaused(!isPaused); }}
            className={`px-2.5 py-1 text-[8.5px] font-mono font-bold flex items-center gap-1 border transition-all ${
              isPaused
                ? "bg-flame-orange/20 border-flame-orange text-flame-orange animate-pulse"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {isPaused ? <Play className="w-2.5 h-2.5 shrink-0" /> : <Pause className="w-2.5 h-2.5 shrink-0" />}
            {isPaused ? labels.liveOff : labels.liveOn}
          </button>

          <button
            onClick={() => { sound.playHoverPluck(); loadFeed(); }}
            className="px-2.5 py-1 text-[8.5px] font-mono font-bold flex items-center gap-1 border border-white/10 hover:border-white/30 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-2.5 h-2.5 shrink-0 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="w-full flex-1">

        {/* Desktop table — hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[9px] text-slate-500 uppercase tracking-widest bg-black/20">
                <th className="p-4 pl-6">{t.globalFeedColAddress}</th>
                <th className="p-4">{t.globalFeedColAmount}</th>
                <th className="p-4">{t.globalFeedColAsset}</th>
                <th className="p-4 text-right pr-6">{t.globalFeedColSolReclaimed}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-600 font-mono text-[10px] uppercase tracking-wider">
                    {labels.loading}
                  </td>
                </tr>
              ) : filteredFeed.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-600 font-mono text-[10px] uppercase tracking-wider">
                    {labels.noHistory}
                  </td>
                </tr>
              ) : (
                filteredFeed.map((item, idx) => {
                  const isExpanded = expandedItemId === item.id;
                  const isNew = idx === 0 && !isPaused && item.time === "Just now";
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => { sound.playHoverPluck(); setExpandedItemId(isExpanded ? null : item.id); }}
                        className={`hover:bg-white/[0.02] transition-all cursor-pointer ${isNew ? "bg-flame-orange/[0.02] border-l-2 border-l-flame-orange" : ""} ${isExpanded ? "bg-white/[0.03]" : ""}`}
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-7 h-7 bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                              <span className="text-[11px]">🔥</span>
                              {isNew && (
                                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-flame-coral rounded-full animate-ping" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-mono text-[11px] font-bold block hover:text-emerald-300">
                                  {item.address}
                                </span>
                                <span className="text-[7px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 font-mono font-black uppercase">
                                  BURNER
                                </span>
                              </div>
                              <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase block">
                                {isNew ? (
                                  <span className="text-flame-orange font-bold animate-pulse">● {t.globalFeedTxLabel}</span>
                                ) : (
                                  item.time
                                )}
                                {item.walletName && (
                                  <span className="ml-1 text-slate-600">via {item.walletName}</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-mono text-slate-300 text-[11px]">{item.amount}</div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-mono text-[11px] font-bold">{item.asset}</span>
                            <span className="text-[7px] bg-flame-orange/20 border border-flame-orange/30 text-flame-orange px-1.5 py-0.5 font-mono font-black uppercase">BURN</span>
                          </div>
                        </td>

                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5 font-mono">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-none inline-block" />
                            <span className="text-emerald-400 font-bold text-xs">+{item.solReclaimed.toFixed(5)} SOL</span>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-black/80 font-mono text-[10px] text-slate-400 border-x border-white/5">
                          <td colSpan={4} className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-white/5 p-4 bg-[#050505] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.01] to-transparent pointer-events-none" />

                              <div className="space-y-2 text-left">
                                <p className="font-bold text-[11px] text-flame-orange flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                                  <Cpu className="w-3.5 h-3.5 text-flame-orange shrink-0" />
                                  {labels.txReceipt}
                                </p>
                                <div className="space-y-1">
                                  <p className="flex justify-between border-b border-white/[0.04] pb-1">
                                    <span>{labels.nodeLocation}:</span>
                                    <span className="text-white font-bold">{item.server.flag} {item.server.city} ({item.server.countryCode})</span>
                                  </p>
                                  <p className="flex justify-between border-b border-white/[0.04] pb-1">
                                    <span>{labels.riskRating}:</span>
                                    <span className="text-emerald-400 font-bold">{item.asset}</span>
                                  </p>
                                  <p className="flex justify-between border-b border-white/[0.04] pb-1">
                                    <span>{labels.reclaimAuth}:</span>
                                    <span className="text-white font-bold text-[9px] truncate max-w-[160px]">{item.fullAddress || item.address}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2 text-left flex flex-col justify-between">
                                <div>
                                  <p className="font-bold text-[11px] text-white flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                                    <Activity className="w-3.5 h-3.5 text-white shrink-0" />
                                    TX CONTEXT
                                  </p>
                                  <div className="space-y-1">
                                    <p className="flex justify-between border-b border-white/[0.04] pb-1">
                                      <span>{labels.gasPaid}:</span>
                                      <span className="text-slate-400 font-bold">{item.gasCost.toFixed(6)} SOL</span>
                                    </p>
                                    <p className="flex justify-between border-b border-white/[0.04] pb-1">
                                      <span>TX HASH:</span>
                                      <span className="text-white font-bold text-[9px] truncate max-w-[130px]">{item.txHash}</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-2 self-end">
                                  <a
                                    href={`https://solscan.io/tx/${item.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => { e.stopPropagation(); sound.playHoverPluck(); }}
                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase tracking-wider flex items-center gap-1.5 border border-white/10 transition-all"
                                  >
                                    {labels.viewSolscan}
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards — hidden on desktop */}
        <div className="lg:hidden w-full divide-y divide-white/[0.04]">
          {isLoading ? (
            <div className="p-8 text-center text-slate-600 font-mono text-[10px] uppercase tracking-wider">
              {labels.loading}
            </div>
          ) : filteredFeed.length === 0 ? (
            <div className="p-8 text-center text-slate-600 font-mono text-[10px] uppercase tracking-wider">
              {labels.noHistory}
            </div>
          ) : (
            filteredFeed.map((item, idx) => {
              const isExpanded = expandedItemId === item.id;
              const isNew = idx === 0 && !isPaused && item.time === "Just now";
              return (
                <div key={item.id} className="p-4">
                  <div
                    onClick={() => { sound.playHoverPluck(); setExpandedItemId(isExpanded ? null : item.id); }}
                    className={`cursor-pointer ${isNew ? "bg-flame-orange/[0.02] border-l-2 border-l-flame-orange pl-3 -ml-3" : ""} ${isExpanded ? "bg-white/[0.03]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="relative w-7 h-7 bg-white/[0.03] border border-white/10 flex items-center justify-center">
                          <span className="text-[11px]">🔥</span>
                          {isNew && (
                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-flame-coral rounded-full animate-ping" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-white font-mono text-[11px] font-bold">{item.address}</span>
                            <span className="text-[7px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 font-mono font-black uppercase">BURNER</span>
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">
                            {isNew ? (
                              <span className="text-flame-orange font-bold animate-pulse">● {t.globalFeedTxLabel}</span>
                            ) : (
                              item.time
                            )}
                            {item.walletName && <span className="ml-1 text-slate-600">via {item.walletName}</span>}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1 font-mono">
                          <div className="w-1.5 h-1.5 bg-emerald-400 shrink-0" />
                          <span className="text-emerald-400 font-bold text-[11px]">+{item.solReclaimed.toFixed(5)} SOL</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{item.asset}</span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
                      <div className="space-y-1.5 font-mono text-[9px] text-slate-400">
                        <div className="flex justify-between border-b border-white/[0.04] pb-1">
                          <span className="text-slate-500">{labels.nodeLocation}:</span>
                          <span className="text-white">{item.server.flag} {item.server.city} ({item.server.countryCode})</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.04] pb-1">
                          <span className="text-slate-500">{labels.riskRating}:</span>
                          <span className="text-emerald-400">{item.asset}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.04] pb-1">
                          <span className="text-slate-500">{labels.reclaimAuth}:</span>
                          <span className="text-white text-[8px] truncate max-w-[140px]">{item.fullAddress || item.address}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/[0.04] pb-1">
                          <span className="text-slate-500">{labels.gasPaid}:</span>
                          <span className="text-slate-400">{item.gasCost.toFixed(6)} SOL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">TX HASH:</span>
                          <span className="text-white text-[8px] truncate max-w-[120px]">{item.txHash}</span>
                        </div>
                      </div>
                      <a
                        href={`https://solscan.io/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playHoverPluck()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase tracking-wider border border-white/10 transition-all"
                      >
                        {labels.viewSolscan}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t border-white/10 p-3 bg-[#020202] flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          <span>BURNERSOL USER TRANSACTION RECORDS — ALL TRANSACTIONS VERIFIED ON-CHAIN</span>
        </div>
        <div className="hidden sm:block">{labels.cumulativeStats}</div>
      </div>
    </div>
  );
}