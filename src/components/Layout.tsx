import { ReactNode, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FooterHUD from "./FooterHUD";
import { sound } from "../utils/audio";

interface LayoutProps {
  children: ReactNode;
  walletBalance?: number;
}

export default function Layout({ children, walletBalance = 0 }: LayoutProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnterSection = (sectionId: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    sound.playHoverPluck();
    setHoveredSection(sectionId);
  };

  const handleMouseLeaveSection = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timer = setTimeout(() => setHoveredSection(null), 250);
    setHoverTimeout(timer);
  };

  return (
    <div className="min-h-screen bg-dark-obsidian text-slate-300 antialiased font-sans flex flex-col relative select-none">
      <a
        href="#dashboard"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-flame-orange focus:text-black focus:px-4 focus:py-2 focus:font-bold focus:outline-none"
      >
        Skip to main content
      </a>

      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-flame-orange/5 blur-[120px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full bg-flame-coral/5 blur-[160px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Header walletBalance={walletBalance} />

      {children}

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