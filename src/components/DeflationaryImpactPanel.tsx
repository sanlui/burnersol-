import React, { useState, useMemo } from "react";
import { 
  Zap, 
  Flame, 
  Coins, 
  TrendingDown, 
  Info, 
  Sliders, 
  LineChart, 
  Activity, 
  Gauge 
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { sound } from "../utils/audio";

interface DeflationaryImpactPanelProps {
  coinName: string;
  coinSymbol: string;
  protocolFeePercent: number;
  giftMultiplier: number;
  language?: string;
}

export default function DeflationaryImpactPanel({
  coinName,
  coinSymbol,
  protocolFeePercent,
  giftMultiplier,
  language = "it"
}: DeflationaryImpactPanelProps) {
  // Simulator parameters with intuitive, high-fidelity default values
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2); // 1 = Low, 2 = High, 3 = Overdrive
  const [activeUsers, setActiveUsers] = useState<number>(3200); // 100 to 10000 active monthly users
  const [itemsPerUser, setItemsPerUser] = useState<number>(18); // 1 to 100 empty/spam items closed per user
  const [customReclaimRate, setCustomReclaimRate] = useState<number>(0.00203928); // Standard Solana rent-exempt amount (0.002039 SOL)
  
  // Time range selector state
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "1Y">("1Y");

  // Double Translation Dictionary for English and Italian Support
  const t = useMemo(() => {
    return language === "it" ? {
      title: "PROIETTORE DEFLAZIONISTICO",
      sub: `Simulazione in tempo reale sull'intensità di purga delle fee e del rent-reclaim dell'ecosistema $${coinSymbol}`,
      labelIntensity: "INTENSITÀ COMMUTATORE",
      intensityLow: "MINIMO (1x)",
      intensityMed: "ELEVATO (2.5x)",
      intensityHigh: "OVERDRIVE (5x)",
      labelUsers: "UTENTI PURGATORI ATTIVI",
      labelItems: "ACCOUNT CHIUSI PER UTENTE",
      labelRate: "MEDIAN RENT EXEMPT (SOL)",
      statMonthlyBurn: `DEFLAZIONE MENSILE $${coinSymbol}`,
      statAnnualDeflation: "TASSO DEFLAZIONE ANNUALE",
      statAnnualSol: "SOL RECUPERATI / ANNO",
      statStability: "INDICE STABILITÀ REATTORE",
      chartTitle: `TENDENZA CONTRAZIONE OFFERTA $${coinSymbol}`,
      chartYLabel: "Fornitura",
      descTitle: "METODOLOGIA E REGOLE DI COMBUSTIONE REALI",
      descText: `Per ogni account di token vuoto (account SPL con zero balance) o spam eliminato, si riscatta la caparra bloccata di 0.002039 SOL (tassa di memorizzazione dello stato su catena). In base alle regole del protocollo (${protocolFeePercent}% di fee trattenuta, di cui il 40% destinato al buyback), una porzione di questi fondi riscatta automaticamente $${coinSymbol} sul mercato al tasso di emissione stabilito di ${giftMultiplier.toLocaleString()} $${coinSymbol}/SOL, causando una contrazione deflazionaria irreversibile.`,
      tooltipSupply: `Outstanding Supply $${coinSymbol}`,
      stabNormal: "TEMPERATO - STABILE",
      stabSuper: "SUPER-RISCALDATO",
      stabRunaway: "FUSIONE CORE CRITICA"
    } : {
      title: "DEFLATIONARY PRESSURE PROJECTOR",
      sub: `Real-time projection of burn intensity levels and rent-reclaim metrics for $${coinSymbol}`,
      labelIntensity: "BURNER STATE INTENSITY",
      intensityLow: "LOW TEMP (1x)",
      intensityMed: "HIGH HEAT (2.5x)",
      intensityHigh: "OVERDRIVE (5x)",
      labelUsers: "ACTIVE MONTHLY USERS",
      labelItems: "ACCOUNTS CLOSED PER USER",
      labelRate: "MEDIAN RENT EXEMPT (SOL)",
      statMonthlyBurn: `ESTIMATED MONTHLY $${coinSymbol} BURN`,
      statAnnualDeflation: "ANNUAL DEFLATION RATE",
      statAnnualSol: "ANNUAL SOL RECLAIMED",
      statStability: "REACTOR CORE STA-INDEX",
      chartTitle: `SUPPLY DEFLATIONARY TRAJECTORY of $${coinSymbol}`,
      chartYLabel: "Supply",
      descTitle: "REAL BURN DESIGN PATTERN PROTOCOL",
      descText: `For every empty or malicious SPL token account closed, 0.002039 SOL is safely reclaimed from the storage rent-exempt layer. Following active protocol settings (${protocolFeePercent}% treasury fee split, with 40% of fees allocated to buybacks), liquid SOL is instantly routed to buy back and burn $${coinSymbol} from the market at the active protocol rate of ${giftMultiplier.toLocaleString()} $${coinSymbol} per SOL, contracting outstanding supply permanently.`,
      tooltipSupply: `Outstanding $${coinSymbol} Supply`,
      stabNormal: "TEMPERATE - RUNNING OPTIMAL",
      stabSuper: "SUPERHEATED SYSTEM",
      stabRunaway: "CRITICAL CORE MELTDOWN"
    };
  }, [language, coinSymbol, protocolFeePercent, giftMultiplier]);

  // Dynamic Chart Title based on Time Range
  const dynamicChartTitle = useMemo(() => {
    const rangeStr = language === "it" 
      ? { "1D": "24 ORE", "1W": "7 GIORNI", "1M": "30 GIORNI", "1Y": "12 MESI" }[timeRange]
      : { "1D": "24 HOURS", "1W": "7 DAYS", "1M": "30 DAYS", "1Y": "12 MONTHS" }[timeRange];
    
    return language === "it"
      ? `PROIEZIONE CONTRAZIONE OFFERTA $${coinSymbol} (${rangeStr})`
      : `SUPPLY DEFLATIONARY TRAJECTORY OF $${coinSymbol} (${rangeStr})`;
  }, [language, coinSymbol, timeRange]);

  // Calculations
  const calculations = useMemo(() => {
    // Basic scaling factor relative to speed intensity
    const intensityMultiplier = intensity === 1 ? 1 : intensity === 2 ? 2.5 : 5.0;
    
    // Monthly closed accounts projection
    const monthlyAccountsClosed = activeUsers * itemsPerUser * intensityMultiplier;
    
    // Monthly SOL Reclaimed
    const monthlySolReclaimed = monthlyAccountsClosed * customReclaimRate;
    const yearlySolReclaimed = monthlySolReclaimed * 12;

    // Real protocol-driven calculations!
    // Protocol Share is monthlySolReclaimed * (protocolFeePercent / 100)
    // 40% of the protocol shares goes to Sweep & Combustion
    const monthlyBurnSol = monthlySolReclaimed * (protocolFeePercent / 100) * 0.4;
    
    // Convert liquid SOL earmarked for burn into tokens using the dynamic giftMultiplier (emissions rate equivalent)
    const monthlyBurnedTokens = monthlyBurnSol * giftMultiplier;
    const yearlyBurnedTokens = monthlyBurnedTokens * 12;

    const totalSupply = 1000000000; // 1 Billion custom tokens inception supply
    const annualDeflationRatePct = (yearlyBurnedTokens / totalSupply) * 100;

    // Generate trajectory data based on selected timeRange
    let chartData: Array<{ name: string; supply: number; supplyMillions: number; burnedCumulative: number }> = [];

    if (timeRange === "1D") {
      // 24 Hours. Point index 0 to 24.
      const hourlyBurned = monthlyBurnedTokens / 720;
      chartData = Array.from({ length: 25 }).map((_, hourIndex) => {
        const remainingSupply = Math.max(0, totalSupply - (hourlyBurned * hourIndex));
        return {
          name: `${hourIndex}h`,
          supply: Math.round(remainingSupply),
          supplyMillions: Number((remainingSupply / 1000000).toFixed(4)),
          burnedCumulative: Math.round(hourlyBurned * hourIndex)
        };
      });
    } else if (timeRange === "1W") {
      // 7 Days. Point index 0 to 7.
      const dailyBurned = monthlyBurnedTokens / 30;
      chartData = Array.from({ length: 8 }).map((_, dayIndex) => {
        const remainingSupply = Math.max(0, totalSupply - (dailyBurned * dayIndex));
        return {
          name: language === "it" ? `G${dayIndex}` : `D${dayIndex}`,
          supply: Math.round(remainingSupply),
          supplyMillions: Number((remainingSupply / 1000000).toFixed(4)),
          burnedCumulative: Math.round(dailyBurned * dayIndex)
        };
      });
    } else if (timeRange === "1M") {
      // 30 Days. Point index 0 to 30.
      const dailyBurned = monthlyBurnedTokens / 30;
      chartData = Array.from({ length: 31 }).map((_, dayIndex) => {
        const remainingSupply = Math.max(0, totalSupply - (dailyBurned * dayIndex));
        return {
          name: language === "it" ? `G${dayIndex}` : `D${dayIndex}`,
          supply: Math.round(remainingSupply),
          supplyMillions: Number((remainingSupply / 1000000).toFixed(3)),
          burnedCumulative: Math.round(dailyBurned * dayIndex)
        };
      });
    } else { // "1Y"
      // 12 Months. Point index 0 to 12.
      chartData = Array.from({ length: 13 }).map((_, monthIndex) => {
        const remainingSupply = Math.max(0, totalSupply - (monthlyBurnedTokens * monthIndex));
        return {
          name: language === "it" ? `M${monthIndex}` : `Mo${monthIndex}`,
          supply: Math.round(remainingSupply),
          supplyMillions: Number((remainingSupply / 1000000).toFixed(2)),
          burnedCumulative: Math.round(monthlyBurnedTokens * monthIndex)
        };
      });
    }

    // Dynamic scale limit for Y-axis domain
    const minSupplyMillions = Math.min(...chartData.map(d => d.supplyMillions));
    const maxSupplyMillions = Math.max(...chartData.map(d => d.supplyMillions));
    const delta = maxSupplyMillions - minSupplyMillions;
    
    const paddingMultiplier = 0.15;
    const padding = delta > 0 ? delta * paddingMultiplier : 0.05;
    const yDomainMin = Math.max(0, minSupplyMillions - padding);
    const yDomainMax = Math.min(1000, maxSupplyMillions + padding);

    // stability classification
    let coreStatus = t.stabNormal;
    let coreColor = "text-emerald-400 border-emerald-500/20 bg-emerald-950/10";
    if (intensity === 2) {
      coreStatus = t.stabSuper;
      coreColor = "text-orange-400 border-orange-500/20 bg-orange-950/10";
    } else if (intensity === 3) {
      coreStatus = t.stabRunaway;
      coreColor = "text-rose-400 border-rose-500/20 bg-rose-950/10 animate-pulse";
    }

    return {
      monthlyAccountsClosed,
      monthlySolReclaimed,
      yearlySolReclaimed,
      monthlyBurnedTokens,
      yearlyBurnedTokens,
      annualDeflationRatePct,
      chartData,
      yDomainMin,
      yDomainMax,
      coreStatus,
      coreColor
    };
  }, [intensity, activeUsers, itemsPerUser, customReclaimRate, t, protocolFeePercent, giftMultiplier, language, timeRange]);

  return (
    <div className="glass-panel border border-white/10 rounded-none bg-black/95 p-6 space-y-8 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.03)] font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1 text-left">
          <span className="text-[9px] font-mono text-flame-orange uppercase font-bold tracking-widest flex items-center gap-1">
            <Activity className="w-3 h-3 text-flame-orange animate-pulse" />
            03 / SYSTEM DEFLATIONARY PHYSICS
          </span>
          <h3 className="text-white text-md font-display font-medium tracking-wide uppercase flex items-center gap-2">
            {t.title}
          </h3>
          <p className="text-[10px] text-slate-400 font-light leading-normal max-w-2xl">
            {t.sub}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-black/60 px-3 py-1.5 border border-white/5 font-mono text-[9px] text-slate-400 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SYSTEM ACCELERATOR ONLINE
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* STAT 1: Monthly Burn */}
        <div className="border border-white/5 bg-[#050505] p-4 flex flex-col justify-between space-y-3">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
            {t.statMonthlyBurn}
          </span>
          <div className="space-y-1">
            <div className="text-lg font-mono font-black text-white leading-none">
              {calculations.monthlyBurnedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} $BURN
            </div>
            <p className="text-[9px] font-mono text-slate-400">
              ~{CalculationsSolFormatted(calculations.monthlySolReclaimed)} SOL reclaimed/mo
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/5 overflow-hidden">
            <div className="h-full bg-flame-orange" style={{ width: `${Math.min(100, (calculations.monthlyBurnedTokens/15000000)*100)}%` }} />
          </div>
        </div>

        {/* STAT 2: Annual Deflation rate */}
        <div className="border border-white/5 bg-[#050505] p-4 flex flex-col justify-between space-y-3">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
            {t.statAnnualDeflation}
          </span>
          <div className="space-y-1">
            <div className="text-lg font-mono font-black text-emerald-400 leading-none">
              -{calculations.annualDeflationRatePct.toFixed(2)}%
            </div>
            <p className="text-[9px] font-mono text-slate-400">
              {calculations.yearlyBurnedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} tokens burnt / yr
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/5 overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, calculations.annualDeflationRatePct * 4)}%` }} />
          </div>
        </div>

        {/* STAT 3: Total SOL captured */}
        <div className="border border-white/5 bg-[#050505] p-4 flex flex-col justify-between space-y-3">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
            {t.statAnnualSol}
          </span>
          <div className="space-y-1">
            <div className="text-lg font-mono font-black text-white leading-none">
              {calculations.yearlySolReclaimed.toLocaleString(undefined, { maximumFractionDigits: 3 })} SOL
            </div>
            <p className="text-[9px] font-mono text-slate-400">
              {calculations.monthlyAccountsClosed.toLocaleString(undefined, { maximumFractionDigits: 0 })} accounts purged / mo
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/5 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (calculations.yearlySolReclaimed/250)*100)}%` }} />
          </div>
        </div>

        {/* STAT 4: stability index */}
        <div className="border border-white/5 bg-[#050505] p-4 flex flex-col justify-between space-y-3">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
            {t.statStability}
          </span>
          <div className="space-y-1">
            <div className={`text-[11px] font-mono font-bold px-2 py-1 text-center border ${calculations.coreColor}`}>
              {calculations.coreStatus}
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-1">
              Intensity scaling: {intensity === 1 ? "1.0x Core Load" : intensity === 2 ? "2.5x High Load" : "5.0x Thermal Spike"}
            </p>
          </div>
          <div className="h-[2px] w-full bg-white/5 overflow-hidden">
            <div className={`h-full ${intensity === 1 ? "bg-emerald-400" : intensity === 2 ? "bg-orange-500" : "bg-rose-500 animate-pulse"}`} style={{ width: intensity === 1 ? "33%" : intensity === 2 ? "66%" : "100%" }} />
          </div>
        </div>

      </div>

      {/* INTERACTIONS & SLIDERS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT HAND: CONFIGURATION SLIDERS */}
        <div className="lg:col-span-5 space-y-5 border border-white/5 bg-[#040404]/60 p-5 text-left">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Sliders className="w-3.5 h-3.5 text-flame-orange" />
            <h4 className="font-display text-white text-[11px] uppercase tracking-wider">
              {language === "it" ? "FATTORI DI COMMISSIONE FISICI" : "PHYSICAL PARAMETERS"}
            </h4>
          </div>

          {/* Intensity Multiplier Trigger Buttons */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-slate-400 tracking-wider flex items-center justify-between uppercase">
              <span>{t.labelIntensity}</span>
              <span className="text-flame-orange font-bold font-mono">
                {intensity === 1 ? "1.0x" : intensity === 2 ? "2.5x" : "5.0x"}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1 as const, name: t.intensityLow },
                { val: 2 as const, name: t.intensityMed },
                { val: 3 as const, name: t.intensityHigh },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => {
                    sound.playHoverPluck();
                    setIntensity(lvl.val);
                  }}
                  className={`py-1.5 px-2 border text-[9px] font-mono uppercase transition-all duration-300 ${
                    intensity === lvl.val
                      ? "bg-flame-orange border-flame-orange text-black font-bold"
                      : "bg-[#080808]/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  {lvl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Slider 1: Active Users */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between font-mono text-[9px] text-slate-400 tracking-wider">
              <span className="uppercase">{t.labelUsers}</span>
              <span className="text-white font-bold">{activeUsers.toLocaleString()}</span>
            </div>
            <input 
              type="range"
              min={100}
              max={10000}
              step={100}
              value={activeUsers}
              onChange={(e) => {
                setActiveUsers(Number(e.target.value));
              }}
              className="accent-flame-orange w-full cursor-pointer h-1.5 bg-white/5 hover:bg-white/10"
            />
          </div>

          {/* Slider 2: Accounts Purged */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between font-mono text-[9px] text-slate-400 tracking-wider">
              <span className="uppercase">{t.labelItems}</span>
              <span className="text-white font-bold">{itemsPerUser}</span>
            </div>
            <input 
              type="range"
              min={1}
              max={100}
              step={1}
              value={itemsPerUser}
              onChange={(e) => {
                setItemsPerUser(Number(e.target.value));
              }}
              className="accent-flame-orange w-full cursor-pointer h-1.5 bg-white/5 hover:bg-white/10"
            />
          </div>

          {/* Input: SOL Reclaim Rate */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between font-mono text-[9px] text-slate-400 tracking-wider">
              <span className="uppercase">{t.labelRate}</span>
              <span className="text-white font-bold">{customReclaimRate.toFixed(8)} SOL</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Empty SPL", val: 0.002039 },
                { label: "Token-22", val: 0.002039 },
                { label: "Custom High", val: 0.003500 },
              ].map((op) => (
                <button
                  key={op.label}
                  type="button"
                  onClick={() => {
                    sound.playHoverPluck();
                    setCustomReclaimRate(op.val);
                  }}
                  className={`py-1 bg-[#0c0c0c] border text-[9px] font-mono uppercase transition-all duration-300 truncate ${
                    Math.abs(customReclaimRate - op.val) < 0.00001
                      ? "border-flame-orange text-flame-orange"
                      : "border-white/5 text-slate-500 hover:text-slate-300"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Real-Time Protocol Feed feedback factors */}
          <div className="pt-3.5 border-t border-white/5 space-y-2">
            <span className="text-[8px] font-mono text-flame-orange font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-flame-orange animate-ping shrink-0" />
              {language === "it" ? "SINCRO INTERATORI PROTOCOLLO REALE" : "LIVE ACTIVE PROTOCOL STATE SYNC"}
            </span>
            <div className="grid grid-cols-2 gap-2 bg-[#090909]/80 p-2.5 border border-white/5 font-mono text-[9px]">
              <div>
                <span className="text-slate-500 block text-[8px] uppercase">{language === "it" ? "FEE PROTOCOLLO TRATTENUTA" : "PROTOCOL TREASURY SPLIT"}</span>
                <span className="text-white font-black text-[10px]">{protocolFeePercent}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] uppercase">{language === "it" ? `TASSO REGALO $${coinSymbol}` : `$${coinSymbol} REWARD RATE`}</span>
                <span className="text-white font-black text-[10px] truncate block">{giftMultiplier.toLocaleString()} / SOL</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT HAND: REAL-TIME GRAPH VISUALIZER */}
        <div className="lg:col-span-7 border border-white/5 bg-[#040404]/60 p-5 flex flex-col justify-between min-h-[300px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 mb-4 gap-2">
            <div className="flex items-center gap-1.5">
              <LineChart className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="font-display text-white text-[11px] uppercase tracking-wider text-left">
                {dynamicChartTitle}
              </h4>
            </div>
            {/* Time Range Selector Toggle Bar */}
            <div className="flex items-center bg-[#070707] border border-white/10 p-0.5 self-start sm:self-auto">
              {(["1D", "1W", "1M", "1Y"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    sound.playHoverPluck();
                    setTimeRange(r);
                  }}
                  className={`px-2 py-1 font-mono text-[8.5px] uppercase transition-all duration-200 ${
                    timeRange === r
                      ? "bg-emerald-500 text-black font-extrabold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart visualizer */}
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calculations.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="deflationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff623d" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ff623d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.03} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={8}
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  domain={[calculations.yDomainMin, calculations.yDomainMax]} 
                  stroke="#475569" 
                  fontSize={8}
                  tickFormatter={(v) => {
                    const delta = calculations.yDomainMax - calculations.yDomainMin;
                    if (delta < 0.5) return `${v.toFixed(3)}M`;
                    if (delta < 5) return `${v.toFixed(2)}M`;
                    return `${Math.round(v)}M`;
                  }}
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const dataNodePoint = payload[0].payload;
                      const timeUnitLabel = language === "it"
                        ? { "1D": "Ora", "1W": "Giorno", "1M": "Giorno", "1Y": "Mese" }[timeRange]
                        : { "1D": "Hour", "1W": "Day", "1M": "Day", "1Y": "Month" }[timeRange];
                      const labelNumber = dataNodePoint.name.replace(/[MoGhD]/g, "");
                      return (
                        <div className="bg-[#050505] border border-white/10 p-2 font-mono text-[9px] space-y-1">
                          <p className="font-bold text-white uppercase">{`${timeUnitLabel} ${labelNumber}`}</p>
                          <p className="text-flame-orange font-bold font-mono">
                            {t.tooltipSupply}: {dataNodePoint.supply.toLocaleString()}
                          </p>
                          <p className="text-slate-400 font-mono">
                            {language === "it" ? "Accumulato Bruciato" : "Cumulative Burned"}: {dataNodePoint.burnedCumulative.toLocaleString()} tokens
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="supplyMillions" 
                  stroke="#ff623d" 
                  fillOpacity={1} 
                  fill="url(#deflationGrad)" 
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Curve legend explanation */}
          <p className="font-mono text-[9.5px] text-slate-500 leading-normal text-left pt-2 border-t border-white/[0.03] select-none mt-2">
            * {language === "it" ? "Andamento stimato a partire dagli input attuali. La pendenza riflette la contrazione di fornitura totale con un lockup di liquidità calcolato a tempo record." : "Estimated trajectory starting from custom parameter values. Slope reflects outstanding asset contraction rate."}
          </p>

        </div>

      </div>

      {/* METODOLOGIA / RULESET DESCRIPTION */}
      <div className="p-4 bg-orange-950/5 border border-orange-500/10 text-left space-y-2">
        <h4 className="font-display font-bold text-flame-orange text-[10px] tracking-widest flex items-center gap-1.5 uppercase">
          <Info className="w-3.5 h-3.5" />
          {t.descTitle}
        </h4>
        <p className="text-[10px] font-sans text-slate-400 leading-relaxed font-light">
          {t.descText}
        </p>
      </div>

    </div>
  );
}

// Helper formats
function CalculationsSolFormatted(val: number): string {
  if (val < 0.001) {
    return val.toFixed(6);
  } else if (val < 1) {
    return val.toFixed(4);
  } else {
    return val.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }
}
