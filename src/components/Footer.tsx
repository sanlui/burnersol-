import { Link } from "react-router-dom";
import { sound } from "../utils/audio";

interface FooterProps {
  handleMouseEnterSection: (sectionId: string) => void;
  handleMouseLeaveSection: () => void;
}

export default function Footer({ handleMouseEnterSection, handleMouseLeaveSection }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#060606] mt-24" role="contentinfo">
      <div className="max-w-[1350px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/[0.05] pb-10">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-flame-orange rounded-none transform rotate-45 flex items-center justify-center" aria-hidden="true">
                <div className="w-2.5 h-2.5 bg-black"></div>
              </div>
              <span className="font-display font-black italic text-white text-xs tracking-[0.25em] ml-1 uppercase">
                BURNERSOL PROTOCOL
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase leading-relaxed tracking-wider max-w-xs">
              SECURED FOR MAXIMUM CRYPTOGRAPHIC CONGRUENCE. SIMULATION LAYER ONLY. KEEP SOLANA CELLULAR STATE PRISTINE.
            </p>
          </div>

          {/* Column 2: Protocol links */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-mono text-[9px] text-flame-orange uppercase tracking-[0.2em] font-bold">Protocol</h5>
            <nav aria-label="Protocol pages">
              <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider">
              <Link
                to="/"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                onMouseEnter={() => handleMouseEnterSection("sol-burner")}
                onMouseLeave={handleMouseLeaveSection}
              >
                SOL Burner
              </Link>
              <Link
                to="/reclaim-sol"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                onMouseEnter={() => handleMouseEnterSection("rent-recovery")}
                onMouseLeave={handleMouseLeaveSection}
              >
                Reclaim SOL
              </Link>
              <Link
                to="/how-it-works"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                onMouseEnter={() => handleMouseEnterSection("how-it-works")}
                onMouseLeave={handleMouseLeaveSection}
              >
                How It Works
              </Link>
            </div>
            </nav>
          </div>

          {/* Column 3: Resources & Info */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-mono text-[9px] text-flame-orange uppercase tracking-[0.2em] font-bold">Resources & Info</h5>
            <nav aria-label="Resources and information">
              <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider">
              <Link
                to="/about"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                onMouseEnter={() => handleMouseEnterSection("about-us")}
                onMouseLeave={handleMouseLeaveSection}
              >
                About Us
              </Link>
              <Link
                to="/faq"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                onMouseEnter={() => handleMouseEnterSection("faq")}
                onMouseLeave={handleMouseLeaveSection}
              >
                FAQ
              </Link>
              <Link
                to="/security"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                onMouseEnter={() => handleMouseEnterSection("security")}
                onMouseLeave={handleMouseLeaveSection}
              >
                Security
              </Link>
              <Link
                to="/contact"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                onMouseEnter={() => handleMouseEnterSection("contacts")}
                onMouseLeave={handleMouseLeaveSection}
              >
                Contact
              </Link>
            </div>
            </nav>
          </div>

          {/* Column 4: Legal & Social */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-3">
              <h5 className="font-mono text-[9px] text-flame-orange uppercase tracking-[0.2em] font-bold">Legal</h5>
              <nav aria-label="Legal pages">
                <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider">
                <Link
                  to="/terms"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                  onMouseEnter={() => handleMouseEnterSection("terms")}
                  onMouseLeave={handleMouseLeaveSection}
                >
                  Terms
                </Link>
                <Link
                  to="/privacy"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                  onMouseEnter={() => handleMouseEnterSection("privacy")}
                  onMouseLeave={handleMouseLeaveSection}
                >
                  Privacy
                </Link>
              </div>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center md:text-left">
            © 2026 BurnerSOL. All rights reserved.
          </div>

          {/* Social Links Panel */}
          <nav aria-label="Social media links" className="flex flex-wrap items-center justify-center gap-6 font-mono text-[9px] uppercase tracking-[0.2em] py-2 md:py-0">
            <a
              href="https://github.com/sanlui/burnersol-"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playHoverPluck()}
              className="text-slate-400 hover:text-flame-orange hover:scale-105 transition-all flex items-center gap-2"
              aria-label="BurnerSOL on GitHub"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              <span>GitHub</span>
            </a>
            <a
              href="https://x.com/50Buiz"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playHoverPluck()}
              className="text-slate-400 hover:text-flame-orange hover:scale-105 transition-all flex items-center gap-2"
              aria-label="BurnerSOL on X"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span>X.com</span>
            </a>
            <a
              href="https://discord.gg/wrDUNuB5"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playHoverPluck()}
              className="text-slate-400 hover:text-flame-orange hover:scale-105 transition-all flex items-center gap-2"
              aria-label="BurnerSOL Discord community"
            >
              <svg viewBox="0 0 127.14 96.36" className="w-3.5 h-3.5 fill-current" aria-hidden="true"><path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.4,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c1-.73,2-1.49 2.92-2.27a75.14,75.14,0,0,0,85,0c.9.78 1.91,1.54 2.92,2.27a68.43,68.43,0,0,1-10.45,5A77.7,77.7,0,0,0,115.1,96.36a105.73,105.73,0,0,0,31-18.83C148.8,54.65,142.72,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/></svg>
              <span>Discord</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}