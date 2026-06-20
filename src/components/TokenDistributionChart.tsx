import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface AllocationItem {
  name: string;
  value: number;
  color: string;
  description: string;
}

interface TokenDistributionChartProps {
  coinName: string;
  coinSymbol: string;
  protocolFeePercent: number;
}

export default function TokenDistributionChart({
  coinName,
  coinSymbol,
  protocolFeePercent,
}: TokenDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Dynamically calculate distributions based on protocolFeePercent and dynamic token symbol
  const data: AllocationItem[] = useMemo(() => {
    const fPercent = protocolFeePercent;
    const uPercent = 100 - fPercent;

    return [
        { 
          name: "User Net Reclaim Share", 
          value: uPercent, 
          color: "#ff623d", 
          description: "Total net percentage of storage rent returned instantly to the initiating user's wallet." 
        },
        { 
          name: `$${coinSymbol} Sweep & Combustion`, 
          value: Math.round(fPercent * 0.4), 
          color: "#ff4757", 
          description: `Liquid rent diverted to decentralized market purchase and thermal burn of $${coinSymbol}.` 
        },
        { 
          name: `$${coinSymbol} Staker Yield Reward`, 
          value: Math.round(fPercent * 0.4), 
          color: "#ffa502", 
          description: `SOL yields continuously distributed to reward active long-term $${coinSymbol} stakers.` 
        },
        { 
          name: "Development & Ops Treasury", 
          value: Math.round(fPercent * 0.2), 
          color: "#2ed573", 
          description: "Routed to the multi-sig founder ledger for RPC nodes, development, and system security operations." 
        }
      ].filter(item => item.value > 0);
  }, [coinSymbol, protocolFeePercent]);

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Safe Fallback calculation of collective total
  const totalPercentage = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  return (
    <div className="w-full flex flex-col justify-between h-full min-h-[300px]">
      {/* Chart Canvas Area */}
      <div className="relative w-full h-[220px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const payloadData = payload[0].payload as AllocationItem;
                  return (
                    <div className="bg-[#0c0c0c] border border-white/10 p-2.5 font-mono text-[10px] space-y-1">
                      <p className="font-bold text-white uppercase tracking-wider">{payloadData.name}</p>
                      <p className="text-flame-orange font-bold text-xs">{payloadData.value}% ALLOCATION</p>
                      <p className="text-slate-400 font-light max-w-[180px] leading-tight select-none">
                        {payloadData.description}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              stroke="rgba(0,0,0,0.8)"
              strokeWidth={2}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {data.map((entry, index) => (
                <Cell 
                   key={`cell-${entry.name}`} 
                  fill={entry.color} 
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                  className="transition-all duration-300"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Display Stat */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {activeIndex !== null && data[activeIndex] ? (
            <>
              <span className="text-[20px] font-mono font-black text-white leading-none">
                {data[activeIndex].value}%
              </span>
              <span className="text-[8px] font-mono uppercase tracking-[0.14em] text-slate-400 mt-1 max-w-[95px] text-center truncate">
                {data[activeIndex].name}
              </span>
            </>
          ) : (
            <>
              <span className="text-[14px] font-mono font-bold text-slate-300 tracking-wider">
                {totalPercentage}%
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                TOTAL FLOW
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list inside the chart container */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-2 text-left font-mono text-[10px] border-t border-white/5 pt-4">
        {data.map((item, idx) => (
          <div 
            key={item.name} 
            className={`flex items-start gap-2 transition-all duration-200 cursor-pointer ${
              activeIndex !== null && activeIndex !== idx ? "opacity-35" : "opacity-100"
            }`}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span 
              className="w-2.5 h-2.5 shrink-0 mt-0.5" 
              style={{ backgroundColor: item.color }}
            />
            <div className="leading-tight">
              <span className="text-white font-medium block truncate max-w-[155px]">{item.name}</span>
              <span className="text-slate-400">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
