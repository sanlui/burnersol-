import { X } from "lucide-react";
import { FOOTER_DETAILS } from "../constants/footerDetails";

interface FooterHUDProps {
  hoveredSection: string | null;
  hoverTimeout: NodeJS.Timeout | null;
  setHoverTimeout: (timeout: NodeJS.Timeout | null) => void;
  setHoveredSection: (section: string | null) => void;
  handleMouseLeaveSection: () => void;
}

export default function FooterHUD({
  hoveredSection,
  hoverTimeout,
  setHoverTimeout,
  setHoveredSection,
  handleMouseLeaveSection,
}: FooterHUDProps) {
  if (!hoveredSection) return null;

  const details = FOOTER_DETAILS[hoveredSection ?? ""];
  if (!details) return null;

  return (
    <div
      id={`hover-hud-${hoveredSection}`}
      className="fixed bottom-6 right-6 z-50 w-[90%] sm:w-80 md:w-96 border border-flame-orange bg-black/95 p-5 shadow-2xl shadow-flame-orange/20 font-sans pointer-events-auto transition-all"
      style={{ backdropFilter: "blur(16px)" }}
      onMouseEnter={() => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          setHoverTimeout(null);
        }
      }}
      onMouseLeave={handleMouseLeaveSection}
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-flame-orange rounded-full animate-ping" />
          <span className="text-[9px] font-mono text-flame-orange tracking-[0.2em] font-bold uppercase">INFO PORTAL ACTIVE</span>
        </div>
        <button
          onClick={() => setHoveredSection(null)}
          aria-label="Close info portal"
          className="p-1 hover:bg-white/10 text-slate-500 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/10"
          title="Close"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-2 text-left">
        <h4 className="text-sm font-black italic text-white tracking-widest uppercase font-display select-none">
          {details.title}
        </h4>
        <p className="text-[10px] font-mono text-flame-orange uppercase tracking-wider font-bold">
          {details.subtitle}
        </p>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-2">
          {details.desc}
        </p>

        <div className="pt-2.5 border-t border-white/5 space-y-2 font-mono text-[10px] text-slate-400">
          {details.points.map((point, index) => (
            <div key={index} className="flex items-start gap-1.5">
              <span className="text-flame-orange mt-0.5 shrink-0">◇</span>
              <span className="leading-relaxed">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
