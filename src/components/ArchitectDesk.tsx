import React, { useState, useEffect, useRef } from "react";
import { 
  Landmark, 
  Coins, 
  Sliders, 
  ArrowUpRight, 
  HelpCircle, 
  Settings, 
  ChevronRight, 
  Flame, 
  Sparkles,
  Code2,
  Terminal,
  Cpu,
  Check,
  RotateCcw,
  FileCode,
  Info,
  Lock,
  Unlock,
  Percent,
  CheckCircle,
  Gem,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";
import { sound } from "../utils/audio";
import { useLanguage } from "../contexts/LanguageContext";

interface ArchitectDeskProps {
  coinName: string;
  setCoinName: (name: string) => void;
  coinSymbol: string;
  setCoinSymbol: (symbol: string) => void;
  protocolFeePercent: number;
  setProtocolFeePercent: (percent: number) => void;
  giftMultiplier: number;
  setGiftMultiplier: (mult: number) => void;
  creatorSolLiquidity: number;
  onWithdrawRevenue: () => void;
  pushNotification: (text: string) => void;
  
  // Real active session states
  burnerBalance: number;
  setBurnerBalance: React.Dispatch<React.SetStateAction<number>>;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  userTxs: any[];
  stakedBalance: number;
  setStakedBalance: React.Dispatch<React.SetStateAction<number>>;
  userSolRewards: number;
  setUserSolRewards: React.Dispatch<React.SetStateAction<number>>;
  cumulativeBuybacks: number;
  setCumulativeBuybacks: React.Dispatch<React.SetStateAction<number>>;
}

export default function ArchitectDesk({
  t,
  coinName,
  setCoinName,
  coinSymbol,
  setCoinSymbol,
  protocolFeePercent,
  setProtocolFeePercent,
  giftMultiplier,
  setGiftMultiplier,
  creatorSolLiquidity,
  onWithdrawRevenue,
  pushNotification,
  burnerBalance,
  setBurnerBalance,
  walletBalance,
  setWalletBalance,
  userTxs,
  stakedBalance,
  setStakedBalance,
  userSolRewards,
  setUserSolRewards,
  cumulativeBuybacks,
  setCumulativeBuybacks,
}: ArchitectDeskProps) {
  const { t } = useLanguage();
  const [localName, setLocalName] = useState(coinName);
  const [localSymbol, setLocalSymbol] = useState(coinSymbol);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Custom secure tokenomics model authority states
  const [hasRevokedAuthority, setHasRevokedAuthority] = useState(true);

  const handleDeployCoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSymbol.trim() || !localName.trim()) {
      pushNotification("⚠️ Invalid Coin Config specified!");
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setCoinName(localName.toUpperCase().trim());
      setCoinSymbol(localSymbol.toUpperCase().replace("$", "").trim());
      
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#10b981", "#34d399", "#ffffff"]
      });

      pushNotification(`💎 Protocol mainframes updated: Deployed ${localName} ($${localSymbol.toUpperCase()}) successfully!`);
    }, 1200);
  };

  const calculateRewardExample = () => {
    const defaultReclaim = 0.00815; // 4 trash accounts closed
    const feeCollected = (defaultReclaim * protocolFeePercent) / 100;
    const userRetained = defaultReclaim - feeCollected;
    const tokensGifted = creatorSolLiquidity * giftMultiplier; // proportional

    return {
      feeCollected,
      userRetained,
      tokensGifted
    };
  };

  const { feeCollected, userRetained, tokensGifted } = calculateRewardExample();

  return (
    <div className="w-full space-y-8">
      {/* SECTION 1: Tokenomics Parametrization & Fees */}
      <div className="w-full glass-panel border border-white/10 rounded-none overflow-hidden bg-black/95 relative [box-shadow:0_15px_60px_rgba(0,0,0,0.8)]">
        {/* Absolute high-tech glowing scanlines */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/80 to-emerald-500/0" />
        
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-none">
              <Landmark className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-medium text-white tracking-[0.18em] uppercase text-xs flex items-center gap-2">
                {t.founderTitle}
              </h3>
              <p className="text-[9px] text-emerald-400/80 font-mono tracking-widest uppercase">
                STATUS: ARCHITECT_MODE_ROOT_ACTIVE // SIM_TOKENOMICS_V2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-500/20 px-3.5 py-2">
            <Sliders className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono text-[9px] uppercase text-slate-300 font-bold">
              SOL REVENUE SPLIT: {protocolFeePercent}% TAX
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Left Side: Coin deployment & sliders */}
          <form onSubmit={handleDeployCoin} className="lg:col-span-7 space-y-6">
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {t.founderSubtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coin Name input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
                  {t.founderCoinName}
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value.replace(/[^a-zA-Z0-9\s.\-_]/g, ""))}
                  maxLength={20}
                  required
                  className="w-full bg-black/60 border border-white/10 px-3.5 py-2 text-white font-mono text-xs focus:border-emerald-500/60 focus:outline-hidden rounded-none transition-all"
                  placeholder="e.g. BurnerSol"
                />
              </div>

              {/* Coin Symbol input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
                  {t.founderCoinSymbol}
                </label>
                <input
                  type="text"
                  value={localSymbol}
                  onChange={(e) => setLocalSymbol(e.target.value.replace(/[^a-zA-Z0-9.\-_]/g, "").toUpperCase())}
                  maxLength={10}
                  required
                  className="w-full bg-black/60 border border-white/10 px-3.5 py-2 text-white font-mono text-xs focus:border-emerald-500/60 focus:outline-hidden rounded-none transition-all"
                  placeholder="e.g. BSOL"
                />
              </div>
            </div>

            {/* Fee redistribution slider */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                <span>{t.founderFeeSplit}</span>
                <span className="text-emerald-400 font-black">{protocolFeePercent}% TO FOUNDER</span>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1.5">
                  {[20, 40, 50, 80].map((rate) => (
                    <button
                      type="button"
                      key={rate}
                      onClick={() => {
                        setProtocolFeePercent(rate);
                        pushNotification(`⚙️ Adjusting creator revenue split: Redirecting ${rate}% SOL rent directly to founder ledger.`);
                      }}
                      className={`py-1.5 font-mono text-[9px] uppercase tracking-wider rounded-none border transition-all ${
                        protocolFeePercent === rate
                          ? "bg-emerald-500 border-emerald-500 text-black font-black"
                          : "bg-white/[0.01] border-white/10 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      {rate}% {rate === 50 ? "(RECOMMENDED)" : ""}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={protocolFeePercent}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setProtocolFeePercent(val);
                  }}
                  className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Airdrop Gift Multiplier settings */}
            <div className="space-y-2">
              <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold flex items-center justify-between">
                <span>{t.founderGifting}</span>
                <span className="text-emerald-400 font-bold">{giftMultiplier.toLocaleString()} TOKENS / 1 SOL</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "SAFE PRICE FLOOR (50k)", value: 50000 },
                  { label: "BALANCED VELOCITY (150k)", value: 150000 },
                  { label: "MEME AGGRESSIVE (500k)", value: 500000 },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      setGiftMultiplier(opt.value);
                      pushNotification(`⚙️ Adjusted Gifting Multiplier: printing ${opt.value.toLocaleString()} per captured SOL.`);
                    }}
                    className={`p-2.5 rounded-none font-mono text-[8px] text-center border leading-tight transition-all uppercase ${
                      giftMultiplier === opt.value
                        ? "bg-emerald-500 border-emerald-500 text-black font-black"
                        : "bg-white/[0.01] border-white/10 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Update Token Deploy button */}
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 hover:text-white uppercase font-mono tracking-widest text-[10px] bg-emerald-500/[0.03] transition-all cursor-pointer flex items-center justify-center gap-2 rounded-none"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? "SYNCING MAINFRAME SYSTEMS..." : t.founderDeployBtn}
            </button>
          </form>

          {/* Right Side: Advanced Tokenomics, Staking & Buyback Protocol Dashboard */}
          <div className="lg:col-span-5 p-6 bg-[#040404] border border-white/15 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            {/* Subtle neon chest background accent */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
            
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    DEFI UTILITY & STAKING HUB
                  </span>
                  <h4 className="text-white font-display font-black text-sm tracking-wide uppercase">
                    ${coinSymbol} SECURE PROTOCOL MODEL
                  </h4>
                </div>
                
                <div className="p-1 px-2 border border-emerald-500/30 bg-emerald-900/10 rounded-none text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>NO INFLATION</span>
                </div>
              </div>

              {/* Core Immutable Supply Information Box */}
              <div className="grid grid-cols-2 gap-2 text-left font-mono text-[9px] bg-white/[0.01] border border-white/5 p-2.5">
                <div className="space-y-0.5">
                  <span className="text-slate-500">MINT AUTHORITY:</span>
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> REVOKED
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500">MAX SUPPLY:</span>
                  <span className="text-white font-bold block">100,000,000 FIXED</span>
                </div>
              </div>

              {/* Simulated Stats Overview */}
              <div className="space-y-2 border-b border-white/5 pb-4">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                  FEE REDISTRIBUTION MODEL (10% TOTAL TAX)
                </span>
                
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 border border-white/10 bg-black/40 rounded-none">
                    <span className="text-[8px] text-slate-400 block mb-1">40% BUYBACK</span>
                    <span className="text-emerald-400 font-bold">
                      {cumulativeBuybacks.toFixed(4)} SOL
                    </span>
                  </div>
                  <div className="p-2 border border-white/10 bg-black/40 rounded-none">
                    <span className="text-[8px] text-slate-400 block mb-1">40% YIELD</span>
                    <span className="text-emerald-400 font-bold">
                      {userSolRewards.toFixed(4)} SOL
                    </span>
                  </div>
                  <div className="p-2 border border-white/10 bg-black/40 rounded-none">
                    <span className="text-[8px] text-slate-400 block mb-1">20% TREASURY</span>
                    <span className="text-white font-bold">
                      {creatorSolLiquidity.toFixed(4)} SOL
                    </span>
                  </div>
                </div>
              </div>

              {/* Utility Perks Status Box */}
              <div className="p-3.5 border border-white/10 bg-black/60 font-mono text-[9px] text-slate-400 space-y-2.5 uppercase tracking-wide">
                <span className="text-[8px] text-slate-500 block tracking-widest border-b border-white/[0.05] pb-1.5 leading-none">
                  ACTIVE HOLDER COGNITIVE BENEFIT PERKS
                </span>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-300">FEES DISCOUNT (-50%):</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                    <Check className="w-3 h-3 text-emerald-400 animate-pulse" /> ATTIVATO
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-300">BURN RUN PRIORITY:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                    <Check className="w-3 h-3 text-emerald-400" /> MAX LEVEL
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-300">UNLIMITED BATCH JOBS:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                    <Check className="w-3 h-3 text-emerald-400" /> ATTIVATO
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-300">AUTO-CLEAN TIMER:</span>
                  <span className="text-slate-500 text-[9px]">
                    DISPONIBILE
                  </span>
                </div>
              </div>

              {/* User Native Staking Interactive Box */}
              <div className="p-3 bg-white/[0.01] border border-white/5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    IL TUO STAKING:
                  </span>
                  <span className="text-white font-mono text-[10px] font-bold">
                    {stakedBalance.toLocaleString()} ${coinSymbol}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const isIt = t.founderCoinSymbol && t.founderCoinSymbol.includes("Simbolo");
                      if (burnerBalance <= 0) {
                        pushNotification(
                          isIt
                            ? `⚠️ Non hai alcun token $${coinSymbol}! Purga gli account SPL vuoti per accumularne.`
                            : `⚠️ You don't have any $${coinSymbol} token! Purge empty SPL accounts in the cleaner to earn coins.`
                        );
                        return;
                      }
                      const stakeAmount = Math.min(burnerBalance, 15000);
                      setBurnerBalance(prev => prev - stakeAmount);
                      setStakedBalance(prev => prev + stakeAmount);
                      sound.playSuccessChime();
                      confetti({
                        particleCount: 40,
                        spread: 30,
                        origin: { y: 0.6 }
                      });
                      pushNotification(
                        isIt
                          ? `🔒 Staking confermato: Bloccati +${stakeAmount.toLocaleString()} $${coinSymbol} nel pool!`
                          : `🔒 Staking confirmed: Locked +${stakeAmount.toLocaleString()} $${coinSymbol} inside the safe staking pool!`
                      );
                    }}
                    onMouseEnter={() => sound.playHoverPluck()}
                    style={{ cursor: "pointer" }}
                    className="py-2 border border-white/10 hover:border-emerald-500 hover:text-emerald-400 font-mono text-[8px] tracking-widest text-slate-300 uppercase transition-all bg-black/40 rounded-none cursor-pointer"
                  >
                    + SECURE STAKE
                  </button>

                  <button
                    type="button"
                    disabled={userSolRewards <= 0}
                    onClick={() => {
                      const isIt = t.founderCoinSymbol && t.founderCoinSymbol.includes("Simbolo");
                      const reward = userSolRewards;
                      setUserSolRewards(0);
                      setWalletBalance(prev => prev + reward);
                      sound.playSuccessChime();
                      pushNotification(
                        isIt
                          ? `🎉 Riscatto completato: +${reward.toFixed(5)} SOL trasferiti sul tuo portafoglio!`
                          : `🎉 Claim Complete: Transferred +${reward.toFixed(5)} SOL directly into your primary wallet!`
                      );
                    }}
                    onMouseEnter={() => sound.playHoverPluck()}
                    style={{ cursor: "pointer" }}
                    className="py-2 border border-emerald-500/20 hover:border-emerald-500 enabled:hover:bg-emerald-500 enabled:hover:text-black font-mono text-[8px] tracking-widest text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed uppercase transition-all rounded-none cursor-pointer font-bold"
                  >
                    CLAIM SOL REWARDS
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Buyback & Burn manual trigger to prove real value purchase */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  const isIt = t.founderCoinSymbol && t.founderCoinSymbol.includes("Simbolo");
                  if (cumulativeBuybacks <= 0) {
                    pushNotification(
                      isIt
                        ? `⚠️ Nessun SOL accumulato nel pool di riacquisto. Chiudi account per deviare le commissioni qui!`
                        : `⚠️ No buyback SOL accrued yet. Close junk accounts first to direct fees into the buyback pool!`
                    );
                    return;
                  }
                  const spent = cumulativeBuybacks;
                  setCumulativeBuybacks(0);
                  sound.playSuccessChime();
                  confetti({
                    particleCount: 50,
                    spread: 45,
                    origin: { y: 0.7 }
                  });
                  pushNotification(
                    isIt
                      ? `🔥 Riacquisto completato: Spesi +${spent.toFixed(5)} SOL accumulati dal protocollo per riacquistare e distruggere $${coinSymbol}!`
                      : `🔥 Buyback executed! Spent +${spent.toFixed(5)} accrued SOL to buy back and burn $${coinSymbol} from the market.`
                  );
                }}
                onMouseEnter={() => sound.playHoverPluck()}
                style={{ cursor: "pointer" }}
                className="w-full py-3 text-[10px] font-display font-black tracking-[0.15em] rounded-none uppercase transition-all duration-300 bg-emerald-500 hover:bg-emerald-600 text-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>TRIGGER REVENUE BUYBACK & BURN</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-black" />
              </button>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest text-center font-mono">
                NON-CUSTODIAL AUTOMATED SYSTEM // 0% COUNTERPARTY EXPOSURE
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
