import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { languages, Language } from "../utils/translations";
import { sound } from "../utils/audio";
import { Globe, ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  currentLang: Language;
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const current = languages.find(l => l.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (lang: Language) => {
    sound.playHoverPluck();
    setOpen(false);
    const path = lang === "en" ? "/" : `/${lang}/`;
    navigate(path);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { sound.playHoverPluck(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 bg-white/[0.02] hover:border-white/25 text-white text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer"
      >
        <Globe className="w-3 h-3 text-flame-orange shrink-0" />
        <span className="font-bold">{current.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-[#0a0a0a] border border-white/10 min-w-[140px] shadow-2xl shadow-black">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-3 py-2 text-[11px] font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                lang.code === currentLang
                  ? "bg-flame-orange/10 text-flame-orange font-bold border-l-2 border-l-flame-orange"
                  : "text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-l-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: lang.code === currentLang ? "#ff6b35" : "#444" }} />
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}