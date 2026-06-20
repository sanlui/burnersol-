import { useState } from "react";
import { ArrowDownUp, Info, RefreshCw, Settings2, Sliders, Zap } from "lucide-react";
import { sound } from "../utils/audio";

interface SwapTerminalProps {
  walletBalance: number;
  burnerBalance: number;
  onSwapComplete: (sourceType: "sol" | "burner", amount: number, resultAmount: number) => void;
  coinSymbol?: string;
}

export default function SwapTerminal({
  walletBalance,
  burnerBalance,
  onSwapComplete,
  coinSymbol = "BURNER",
}: SwapTerminalProps) {
  const t = {
    swapTitle: "SWAP",
    swapSellLabel: "YOU PAY",
    swapReceiveLabel: "YOU RECEIVE",
    swapRateLabel: "RATE",
    swapRouteLabel: "ROUTE PATHING",
    swapFeeLabel: "NETWORK FEE",
    swapImpactLabel: "SLIPPAGE IMPACT",
    swapButtonActive: "SWAPPING...",
    swapButtonLabel: "SWAP NOW",
    swapSecuredBy: "SECURED BY JUPITER AGGREGATOR",
  };

  const [fromToken, setFromToken] = useState<"SOL" | "BURNER">("SOL");
  const [toToken, setToToken] = useState<"SOL" | "BURNER">("BURNER");
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [isSwapping, setIsSwapping] = useState(false);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState(false);

  // Exchange rate: 1 SOL = 45,000 $BURNER
  const EXCHANGE_RATE = 45000;

  const handleSwitch = () => {
    setFromToken((prev) => (prev === "SOL" ? "BURNER" : "SOL"));
    setToToken((prev) => (prev === "SOL" ? "BURNER" : "SOL"));
    setFromAmount("1");
  };

  const calculateToAmount = () => {
    const num = parseFloat(fromAmount) || 0;
    if (fromToken === "SOL") {
      return (num * EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 2 });
    } else {
      return (num / EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 6 });
    }
  };

  const handleMax = () => {
    if (fromToken === "SOL") {
      setFromAmount(walletBalance.toFixed(3));
    } else {
      setFromAmount(burnerBalance.toFixed(0));
    }
  };

  const handleSwap = () => {
    const amountNum = parseFloat(fromAmount) || 0;
    if (amountNum <= 0) return;

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      const resultNum = fromToken === "SOL" ? amountNum * EXCHANGE_RATE : amountNum / EXCHANGE_RATE;
      onSwapComplete(fromToken.toLowerCase() as "sol" | "burner", amountNum, resultNum);
    }, 1500);
  };

  return (
    <div className="w-full glass-panel border border-white/10 rounded-none overflow-hidden flex flex-col h-full bg-[#030303]">
      {/* Swap Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-emerald-400 animate-pulse-glow" />
          <h3 className="font-display font-bold italic text-white tracking-widest uppercase text-xs">
            {t.swapTitle}
          </h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            onMouseEnter={() => sound.playHoverPluck()}
            className="p-2 rounded-none border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all bg-white/[0.01] cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          
          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 p-4 rounded-none z-20 space-y-3 [box-shadow:0_10px_30px_rgba(0,0,0,0.8)]">
              <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">Swap Settings</p>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-300 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-flame-orange" /> Slippage Tolerance
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[0.1, 0.5, 1.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSlippage(val)}
                      onMouseEnter={() => sound.playHoverPluck()}
                      className={`py-1 text-[10px] font-mono rounded-none ${
                        slippage === val 
                          ? "bg-flame-orange text-black font-bold" 
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inputs block */}
      <div className="p-6 space-y-4">
        {/* From Input */}
        <div className="p-4 rounded-none bg-black/40 border border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>{t.swapSellLabel}</span>
            <span>
              Balance:{" "}
              {fromToken === "SOL" 
                ? `${walletBalance.toFixed(3)} SOL` 
                : `${burnerBalance.toLocaleString()} ${coinSymbol}`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              disabled={isSwapping}
              placeholder="0.00"
              className="flex-1 bg-transparent border-0 p-0 text-white font-display font-medium text-lg focus:ring-0 focus:outline-hidden [appearance:none] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleMax}
                onMouseEnter={() => sound.playHoverPluck()}
                className="px-2 py-0.5 text-[9px] font-mono rounded-none border border-white/10 hover:border-flame-orange/40 hover:text-flame-orange text-slate-400 cursor-pointer"
              >
                MAX
              </button>
              
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white/10 border border-white/20">
                <span className={`w-1.5 h-1.5 rounded-none ${fromToken === "SOL" ? "bg-purple-500" : "bg-flame-orange"}`} />
                <span className="font-mono text-xs font-bold text-white uppercase">{fromToken === "SOL" ? "SOL" : coinSymbol}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Switch Arrow */}
        <div className="relative flex justify-center -my-3 z-10">
          <button
            onClick={handleSwitch}
            onMouseEnter={() => sound.playHoverPluck()}
            disabled={isSwapping}
            className="p-2 ml-0 rounded-none bg-[#0e0e0e] border border-white/10 text-slate-400 hover:text-flame-orange hover:border-flame-orange/40 hover:scale-110 active:scale-95 duration-300 shadow-md cursor-pointer"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* To Input */}
        <div className="p-4 rounded-none bg-black/40 border border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>{t.swapReceiveLabel}</span>
            <span>
              Balance:{" "}
              {toToken === "SOL" 
                ? `${walletBalance.toFixed(3)} SOL` 
                : `${burnerBalance.toLocaleString()} ${coinSymbol}`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex-1 text-slate-200 font-display font-medium text-lg leading-none">
              {calculateToAmount()}
            </span>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white/10 border border-white/20 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-none ${toToken === "SOL" ? "bg-purple-500" : "bg-flame-orange"}`} />
              <span className="font-mono text-xs font-bold text-white uppercase">{toToken === "SOL" ? "SOL" : coinSymbol}</span>
            </div>
          </div>
        </div>

        {/* Informative Rate Panel */}
        <div className="p-4 rounded-none border border-white/10 bg-white/[0.01] flex flex-col gap-2.5 font-mono text-xs text-slate-400 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{t.swapRateLabel}</span>
            <span className="text-white font-medium">
              1 SOL ≈ {EXCHANGE_RATE.toLocaleString()} {coinSymbol}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{t.swapRouteLabel}</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
              {t.swapRouteLabel === "ROUTE PATHING" ? "JUPITER DIRECT API" : t.swapRouteLabel === "PERCORSO DEL ROUTER" ? "API JUPITER DIRETTA" : "JUPITER MAINNET API"} <Zap className="w-3 h-3 fill-emerald-400" />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{t.swapFeeLabel}</span>
            <span className="text-white">0.00005 SOL (~$0.01)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{t.swapImpactLabel}</span>
            <span className="text-emerald-400 font-bold">&lt; 0.01%</span>
          </div>
        </div>

        {/* Swap Action Button */}
        <button
          onClick={handleSwap}
          onMouseEnter={() => sound.playHoverPluck()}
          disabled={isSwapping || parseFloat(fromAmount) <= 0}
          className="w-full relative py-4 rounded-none font-display font-black text-xs text-white uppercase tracking-[0.25em] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
        >
          {isSwapping ? (
            <span className="relative flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {t.swapButtonActive}
            </span>
          ) : (
            <span className="relative flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 fill-white text-white" />
              {t.swapButtonLabel}
            </span>
          )}
        </button>
      </div>

      {/* Decorative Swap details */}
      <div className="border-t border-white/10 p-4 bg-black/40 text-center flex items-center justify-center gap-1">
        <Info className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
          {t.swapSecuredBy}
        </span>
      </div>
    </div>
  );
}
