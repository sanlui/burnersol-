import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FOOTER_DETAILS } from "../constants/footerDetails";
import { sound } from "../utils/audio";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FooterHUD from "../components/FooterHUD";
import { useState } from "react";

const SECTION_META: Record<string, { title: string; description: string }> = {
  "rent-recovery": {
    title: "Reclaim SOL | Solana Rent Recovery Pipeline | BurnerSOL",
    description: "Recover locked SOL from unused token accounts on Solana. BurnerSOL's automatic discovery tool queries high-performance RPC nodes to unlock dormant cryptographic capital."
  },
  "how-it-works": {
    title: "How It Works | Instruction Program Flow | BurnerSOL",
    description: "Learn how BurnerSOL enables instant State Rent recovery. Safe construction of closeAccount instructions prevents transaction conflicts while dormant rent collateral is released to you."
  },
  "about-us": {
    title: "About Us | BurnerSOL Technologic Edge | BurnerSOL",
    description: "We are an engineering collective focused on building premium smart contract utilities. Learn more about our mission to make complex Web3 structures accessible."
  },
  "faq": {
    title: "FAQ | Frequently Asked Questions | BurnerSOL",
    description: "Frequently asked questions about BurnerSOL. Learn about security, supported wallets, costs, and how much SOL you can recover per account."
  },
  "security": {
    title: "Security | Enhanced Cryptographic Safety | BurnerSOL",
    description: "Your assets are covered under absolute fail-safe environments. Prior to any wallet signature call, the protocol executes multiple state validations to eliminate user error."
  },
  "contacts": {
    title: "Contact | Technical Communications Core | BurnerSOL",
    description: "Get in touch with the BurnerSOL team. We are responsive to user feedback, technical queries, and feature suggestions through our operational hubs."
  },
  "terms": {
    title: "Terms & Conditions | Legal Directives for On-Chain Protocol Use | BurnerSOL",
    description: "Using BurnerSOL constitutes active agreement with the technical standards, user responsibilities, and structural behaviors of Web3 applications."
  },
  "privacy": {
    title: "Privacy | Decentralized Privacy & Zero-Data Harvesting | BurnerSOL",
    description: "We prioritize cryptographically secure anonymity. We do not index personal identifiers, cookies, or telemetry to centralized databases."
  },
  "resources": {
    title: "Resources | Community & Developer Links | BurnerSOL",
    description: "Access BurnerSOL's official developer resources, community channels, and technical documentation for the Solana wallet cleaner and rent recovery protocol."
  }
};

interface InfoPageProps {
  sectionId?: string;
}

export default function InfoPage({ sectionId }: InfoPageProps) {
  const navigate = useNavigate();
  const activeSection = sectionId || "";

  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const meta = SECTION_META[activeSection];
  const details = FOOTER_DETAILS[activeSection];

  useEffect(() => {
    if (meta) {
      document.title = meta.title;
      document.documentElement.lang = "en";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", meta.description);
    }
  }, [activeSection, meta]);

  const handleMouseEnterSection = (sectionId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    sound.playHoverPluck();
    setHoveredSection(sectionId);
  };

  const handleMouseLeaveSection = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timer = setTimeout(() => {
      setHoveredSection(null);
    }, 250);
    setHoverTimeout(timer);
  };

  if (!details) {
    return (
      <div className="min-h-screen bg-dark-obsidian text-slate-300 antialiased font-sans flex flex-col">
        <Header walletBalance={0} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display font-black italic text-white">Page Not Found</h1>
            <p className="text-slate-400">The requested page does not exist.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-flame-orange text-black font-bold text-sm tracking-wider uppercase hover:bg-orange-600 transition-all"
            >
              Return Home
            </button>
          </div>
        </main>
        <Footer handleMouseEnterSection={handleMouseEnterSection} handleMouseLeaveSection={handleMouseLeaveSection} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-obsidian text-slate-300 antialiased font-sans flex flex-col relative select-none">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-flame-orange/5 blur-[120px] pointer-events-none -z-10" aria-hidden="true" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full bg-flame-coral/5 blur-[160px] pointer-events-none -z-10" aria-hidden="true" />

      <Header walletBalance={0} />

      <main className="flex-1 max-w-[1350px] mx-auto px-6 py-16 w-full" role="main">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-flame-orange rounded-full" />
              <span className="text-[10px] uppercase tracking-wider text-flame-orange font-bold font-mono">Information</span>
            </div>
            <h1 className="text-[48px] sm:text-[64px] leading-[0.9] font-display font-black italic uppercase tracking-tighter text-white">
              {details.title}
            </h1>
          </div>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
            {details.desc}
          </p>

          <div className="border-t border-white/10 pt-8 space-y-6">
            <h2 className="text-sm font-mono text-flame-orange uppercase tracking-widest font-bold">
              {details.subtitle}
            </h2>
            <div className="space-y-3">
              {details.points.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-flame-orange mt-1 shrink-0">◇</span>
                  <span className="text-sm text-slate-300 leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-flame-orange hover:bg-orange-600 text-black font-display font-bold text-xs tracking-wider uppercase transition-all"
            >
              Launch Protocol
            </button>
          </div>
        </div>
      </main>

      <Footer
        handleMouseEnterSection={handleMouseEnterSection}
        handleMouseLeaveSection={handleMouseLeaveSection}
      />

      <FooterHUD
        hoveredSection={hoveredSection}
        hoverTimeout={hoverTimeout}
        setHoverTimeout={setHoverTimeout}
        setHoveredSection={setHoveredSection}
        handleMouseLeaveSection={handleMouseLeaveSection}
      />
    </div>
  );
}