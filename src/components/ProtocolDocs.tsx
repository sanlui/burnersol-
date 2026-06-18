import React, { useState } from "react";
import { 
  BookOpen, 
  Terminal, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Cpu, 
  Layers, 
  Search, 
  Code, 
  Copy, 
  Check, 
  Shield, 
  HelpCircle, 
  Bookmark, 
  FileText
} from "lucide-react";

interface ProtocolDocsProps {
  sound: any;
}

export default function ProtocolDocs({ sound }: ProtocolDocsProps) {
  const [activeSection, setActiveSection] = useState<"intro" | "phases" | "integrity" | "faq" | "cli">("intro");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  const language = "en";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    if (sound?.playHoverPluck) sound.playHoverPluck();
    setTimeout(() => setCopiedText(null), 2000);
  };

  const navItems = [
    { id: "intro", label: language === "it" ? "Memoria & Rent" : "Memory & Rent", icon: Cpu },
    { id: "phases", label: language === "it" ? "Le 4 Fasi" : "The 4 Phases", icon: Layers },
    { id: "integrity", label: language === "it" ? "Integrità" : "Integrity Framework", icon: Shield },
    { id: "cli", label: language === "it" ? "Comandi CLI / Web3" : "CLI & Web3 Commands", icon: Terminal },
    { id: "faq", label: language === "it" ? "Domande Frequenti" : "FAQ", icon: HelpCircle },
  ] as const;

  return (
    <div className="glass-panel border border-white/10 rounded-none bg-black/95 p-6 space-y-8 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.03)] font-sans text-left">
      
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-zinc-900 border border-white/10 font-mono text-[9px] uppercase tracking-wider text-slate-400">
            <BookOpen className="w-3 h-3 text-flame-orange animate-pulse" /> {language === "it" ? "Documentazione Tecnica Ufficiale" : "Official Technical Specs"}
          </div>
          <h2 className="text-xl font-display font-medium text-white tracking-wider uppercase flex items-center gap-2.5">
            {language === "it" ? "SUPPORTO TECNICO E DOCUMENTI" : "PROTOCOL DOCUMENTATION & SPECS"}
          </h2>
          <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase max-w-2xl leading-relaxed">
            {language === "it" 
              ? "Architettura decentralizzata, de-allocazione della memoria di stato su Solana VM e linee guida crittografiche." 
              : "Decentralized architecture, state memory de-allocation on Solana VM, and cryptographic design guidelines."}
          </p>
        </div>
      </div>

      {/* Docs Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible border border-white/10 bg-black/55 divide-x lg:divide-x-0 lg:divide-y divide-white/[0.05]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (sound?.playHoverPluck) sound.playHoverPluck();
                  setActiveSection(item.id);
                }}
                className={`flex-1 lg:flex-none text-left px-4 py-3.5 font-mono text-[10px] uppercase tracking-wider transition-all flex items-center gap-3 shrink-0 ${
                  isActive 
                    ? "bg-white/[0.04] text-flame-orange border-b-2 lg:border-b-0 lg:border-l-2 border-flame-orange font-bold" 
                    : "text-slate-400 hover:text-white border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-flame-orange" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Viewport */}
        <div className="lg:col-span-3 border border-white/10 bg-[#030303] p-6 space-y-8 min-h-[480px]">
          
          {/* Section: INTRO (RENT EXEMPTION) */}
          {activeSection === "intro" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-3 flex-1">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">SOLANA ACC-REGISTRY</span>
                  <h3 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight leading-tight uppercase">
                    {t.mechanicsHeading}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {t.mechanicsDescription}
                  </p>
                </div>
                <div className="shrink-0 p-5 border border-white/10 font-mono text-[10px] text-left bg-[#050505] max-w-xs space-y-2">
                  <div className="text-flame-orange font-bold uppercase tracking-wider">⚡ {t.mechanicsConstTitle}</div>
                  <p className="text-slate-400 leading-normal font-light uppercase">
                    {t.mechanicsConstDesc}
                  </p>
                </div>
              </div>

              {/* Graphical representation of the Reclaim mechanism */}
              <div className="bg-black/40 border border-white/5 p-5 space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  {language === "it" ? "STRUTTURA DECORATIVA DELLA MEMORIA DELL'ACCOUNT" : "DECORATIVE STATE ACCOUNT ALLOCATION"}
                </h4>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 font-mono text-[9px]">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 border flex flex-col items-center justify-between h-16 transition-all duration-300 ${
                        idx < 3 
                          ? "border-flame-orange/30 bg-flame-orange/5 text-flame-orange" 
                          : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                      }`}
                    >
                      <span className="opacity-50">BYTE {idx * 32}</span>
                      <span className="font-bold">{idx < 3 ? "ORPHAN" : "ACTIVE"}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed uppercase">
                  {language === "it" 
                    ? "* GLI ACCOUNT ORFANI CONTENGONO DATA STATE IMMOBILI DA SETTIMANE, COMPORTANDO UN CONGELAMENTO DI ~0.002039 SOL CIASCUNO." 
                    : "* ORPHAN STATES CONTAIN STATIONARY DATA SLOTS, CAUSING A FREEZE OF ~0.002039 SOL EACH."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.01] border border-white/5 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    {language === "it" ? "Che cos'è la Rent su Solana?" : "What is Solana Rent Exemption?"}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    {language === "it" 
                      ? "Per evitare che il registro sia invaso da account vuoti, Solana richiede che ogni account mantenga un deposito cauzionale proporzionale alla sua dimensione in byte. Se la dimensione scende a zero o se l'account non serve più, chiudendo il canale l'intero deposito in SOL viene istantaneamente rimborsato al proprietario." 
                      : "To prevent state bloat, Solana requires that all accounts maintain a security deposit based on their size in bytes. If an account is no longer needed, shutting it down releases this rent deposit directly back to your signature."}
                  </p>
                </div>

                <div className="p-4 bg-white/[0.01] border border-white/5 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    {language === "it" ? "Come vengono persi i SOL?" : "How do SOL deposits accumulate/get lost?"}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    {language === "it" 
                      ? "Ogni volta che acquisti una moneta, ricevi un airdrop o interagisci con un'applicazione, viene aperto un token-account. Anche se vendi tutte le monete, quel guscio vuoto rimane memorizzato per sempre sul registro di Solana con dentro 0.00204 SOL bloccati. Nel tempo, dozzine di account accumulano centinaia di frazioni di SOL invisibili." 
                      : "Every time you purchase a token, receive an airdrop, or interact with an app, a token account is initialized. Even after selling your whole position, that empty shell remains stored on Solana forever, holding 0.00204 SOL hostage. Over time, those accounts freeze considerable amounts."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: PHASES */}
          {activeSection === "phases" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">ARCHITECTURAL TIMELINE</span>
                <h3 className="text-xl font-display font-medium text-white uppercase tracking-tight">
                  {language === "it" ? "LE 4 FASI DEL PROCESSO DI PURGING" : "THE 4 PHASES OF THE PURGE ENGINE"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-left">
                {/* Step 1 */}
                <div className="bg-white/[0.01] border border-white/10 p-5 flex flex-col justify-between h-48 select-text">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-serif italic text-3xl text-flame-orange leading-none">{t.step1Num}</span>
                      <span className="text-[8px] font-mono text-slate-400 tracking-wider font-bold uppercase border border-white/5 px-2 py-0.5">{t.step1Badge}</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase">{t.step1Title}</h4>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed mt-1">
                        {t.step1Desc}
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                    FASE: {t.step1Phase}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white/[0.01] border border-white/10 p-5 flex flex-col justify-between h-48 select-text">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-serif italic text-3xl text-flame-orange leading-none">{t.step2Num}</span>
                      <span className="text-[8px] font-mono text-slate-400 tracking-wider font-bold uppercase border border-white/5 px-2 py-0.5">{t.step2Badge}</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase">{t.step2Title}</h4>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed mt-1">
                        {t.step2Desc}
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                    FASE: {t.step2Phase}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white/[0.01] border border-white/10 p-5 flex flex-col justify-between h-48 select-text">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-serif italic text-3xl text-flame-orange leading-none">{t.step3Num}</span>
                      <span className="text-[8px] font-mono text-slate-400 tracking-wider font-bold uppercase border border-white/5 px-2 py-0.5">{t.step3Badge}</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase">Incenerisci e Chiudi</h4>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed mt-1">
                        Invia l'istruzione di chiusura stato. Gli account vengono cancellati permanentemente dalla RAM del validatore.
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                    FASE: rpc_account_close
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white/[0.01] border border-white/10 p-5 flex flex-col justify-between h-48 select-text">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-serif italic text-3xl text-flame-orange leading-none">04</span>
                      <span className="text-[8px] font-mono text-slate-400 tracking-wider font-bold uppercase border border-white/5 px-2 py-0.5">REINTEGRAZIONE</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase">Recupera SOL Istanti</h4>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed mt-1">
                        Il deposito cauzionale viene de-congelato e girato direttamente sulla tua firma principale, aumentando il bilancio.
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-[8px] text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                    FASE: rent_reclaim_payout
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: INTEGRITY */}
          {activeSection === "integrity" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">DECENTRALIZED SECURITIES</span>
                <h3 className="text-xl font-display font-medium text-white uppercase tracking-tight">
                  {t.privacyHeading}
                </h3>
                <p className="text-xs text-slate-400 font-light max-w-xl mt-1">
                  {t.privacySubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Stateless Security */}
                <div className="p-6 bg-[#050505] border border-white/10 rounded-none relative overflow-hidden flex flex-col justify-between min-h-[170px] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-emerald-500/20 transition-all duration-300">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">● PRIVACY GUARANTEED</span>
                    <h4 className="text-white text-xs font-bold uppercase tracking-tight">{t.privacyCard1Title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                      {t.privacyCard1Desc}
                    </p>
                  </div>
                </div>

                {/* Card 2: Mathematical Transparency */}
                <div className="p-6 bg-[#050505] border border-white/10 rounded-none relative overflow-hidden flex flex-col justify-between min-h-[170px] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-emerald-500/20 transition-all duration-300">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">● REALTIME TRANSPARENCY</span>
                    <h4 className="text-white text-xs font-bold uppercase tracking-tight">{t.privacyCard2Title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                      {t.privacyCard2Desc}
                    </p>
                  </div>
                </div>

                {/* Card 3: Non-Custodial Integrity */}
                <div className="p-6 bg-[#050505] border border-white/10 rounded-none relative overflow-hidden flex flex-col justify-between min-h-[170px] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-emerald-500/20 transition-all duration-300">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">● SOLID CRYPTOGRAPHY</span>
                    <h4 className="text-white text-xs font-bold uppercase tracking-tight">{t.privacyCard3Title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                      {t.privacyCard3Desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: CLI COMMANDS */}
          {activeSection === "cli" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">CLI & DEVS PLAYGROUND</span>
                <h3 className="text-xl font-display font-medium text-white uppercase tracking-tight">
                  {language === "it" ? "COMANDI WEB3 E TERMINALE SOLANA" : "WEB3 CLI AND SOLANA PROTOCOL COMMANDS"}
                </h3>
                <p className="text-xs text-slate-400 font-light mt-1">
                  {language === "it" 
                    ? "Verifica l'autenticità dei comandi sottostanti compilando direttamente le invocazioni rpc." 
                    : "Verify exact web application behaviors by cross-referencing commands with official Solana SDK instructions."}
                </p>
              </div>

              {/* Command 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[10px] text-slate-400">
                  <span>1. {language === "it" ? "VERIFICA INDICE MINIMO ESENTE DA RENDITA" : "LOOKUP RENT-EXEMPT SIZE CONSTANT"}</span>
                  <button 
                    onClick={() => handleCopy("solana rent-exempt-minimum 165", "cli1")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {copiedText === "cli1" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === "cli1" ? "copied" : "copy"}</span>
                  </button>
                </div>
                <div className="bg-[#090909] border border-white/10 p-3.5 font-mono text-xs text-slate-300">
                  solana rent-exempt-minimum 165
                </div>
                <p className="text-[10px] text-slate-500 font-light">
                  {language === "it"
                    ? "Ritorna la quantità minima di SOL esente da affitto necessaria per de-allocare o aprire un account con dimensione 165 byte (dimensione standard SPL Token)."
                    : "Returns the exact minimum SOL required to store an SPL Token standard state channel of 165 bytes."}
                </p>
              </div>

              {/* Command 2 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[10px] text-slate-400">
                  <span>2. {language === "it" ? "CHIUDERE MANUALE ACCOUNT TOKEN SPAM" : "MANUALLY CLOSE TOKEN ACCOUNT"}</span>
                  <button 
                    onClick={() => handleCopy("spl-token close <TOKEN_ADDRESS> --recipient <WALLET_ADDRESS>", "cli2")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {copiedText === "cli2" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === "cli2" ? "copied" : "copy"}</span>
                  </button>
                </div>
                <div className="bg-[#090909] border border-white/10 p-3.5 font-mono text-xs text-slate-300">
                  spl-token close &lt;TOKEN_ADDRESS&gt; --recipient &lt;WALLET_ADDRESS&gt;
                </div>
                <p className="text-[10px] text-slate-500 font-light">
                  {language === "it"
                    ? "Equivale all'azione eseguita dal nostro Inceneritore: purga definitivamente i dati dell'account e recupera la totalità della cauzione SOL."
                    : "Exactly maps to our Purge dashboard action: entirely prunes and returns the locked SOL state directly into your wallet database."}
                </p>
              </div>
            </div>
          )}

          {/* Section: FAQ */}
          {activeSection === "faq" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">COMMUNITY HUB</span>
                <h3 className="text-xl font-display font-medium text-white uppercase tracking-tight">
                  {language === "it" ? "DOMANDE FREQUENTI" : "FREQUENTLY ASKED QUESTIONS"}
                </h3>
              </div>

              <div className="space-y-4 divide-y divide-white/5">
                <div className="pt-3 space-y-1.5">
                  <h4 className="text-xs font-mono font-bold text-white uppercase">
                    {language === "it" ? "La procedura è sicura?" : "Is this procedure completely safe?"}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                    {language === "it" 
                      ? "Sì. Il software compila solo istruzioni standard Solana Token Program (CloseAccount). Tutte le firme avvengono localmente sul browser. Non c'è alcun intermediario né custodia di chiavi." 
                      : "Yes, absolutely. The protocol only generates core Solana SDK CloseAccount instructions. All signatures are processed client-side. There is no custom custody layer."}
                  </p>
                </div>

                <div className="pt-4 space-y-1.5">
                  <h4 className="text-xs font-mono font-bold text-white uppercase">
                    {language === "it" ? "In quanti instanti ricevo i miei SOL?" : "When will I receive my reclaimed SOL?"}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                    {language === "it" 
                      ? "I SOL vengono rilasciati istantaneamente nello stesso secondo in cui la transazione viene confermata dai validatori della blockchain di Solana (circa 400 millisecondi di latenza)." 
                      : "The SOL fractions are credited back immediately in the very same block in which the transaction gets confirmed by the Solana validation nodes."}
                  </p>
                </div>

                <div className="pt-4 space-y-1.5">
                  <h4 className="text-xs font-mono font-bold text-white uppercase">
                    {language === "it" ? "Cos'è il token $BURN?" : "What is the utility rate of $BURN?"}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                    {language === "it" 
                      ? "$BURN è il combustibile iper-deflazionistico collegato al nostro portale. Una parte delle commissioni di recupero dell'inceneritore viene automaticamente usata per riacquistare e bruciare per sempre token $BURN." 
                      : "$BURN is the hyper-deflationary utility catalyst of our platform. Reclaim fees automatically trigger real-time buyback and burn cycles, constantly reducing $BURN's circulating cap."}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
