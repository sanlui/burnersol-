import { useState, useEffect } from "react";
import { 
  Flame, 
  Coins, 
  Wallet, 
  Trash2, 
  Sparkles, 
  Trophy, 
  Zap, 
  Globe, 
  Compass, 
  BarChart3, 
  LineChart, 
  X, 
  Activity, 
  FlameKindling,
  Info,
  Menu,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  ChevronRight,
  Share2,
  Copy,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import TokenDistributionChart from "./components/TokenDistributionChart";
import ScannerTerminal from "./components/ScannerTerminal";
import SwapTerminal from "./components/SwapTerminal";
import GlobalBurnFeed from "./components/GlobalBurnFeed";
import LanguageSwitcher from "./components/LanguageSwitcher";

import CombustionChamber from "./components/CombustionChamber";
import { TrashItem, BurnTransaction } from "./types";
import { useLanguage } from "./contexts/LanguageContext";
import { sound } from "./utils/audio";
import { getSmartDynamicFeePercent } from "./utils/riskEngine";
import { simulateAndValidateBurn } from "./utils/transactionSafety";
import { saveBurnTransaction, loadBurnHistory } from "./utils/burnHistory";
import WalletConnector, { dispatchOpenWalletModal } from "./components/WalletConnector";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface PriceAlert {
  id: string;
  targetPrice: number;
  type: "above" | "below";
  createdAt: string;
  isTriggered: boolean;
  triggeredAt?: string;
}

const ORIGINAL_CHART_DATA = [
  { name: "Mon", Price: 0.0120 },
  { name: "Tue", Price: 0.0150 },
  { name: "Wed", Price: 0.0130 },
  { name: "Thu", Price: 0.0180 },
  { name: "Fri", Price: 0.0240 },
  { name: "Sat", Price: 0.0210 },
  { name: "Now", Price: 0.0324 },
];

export const FOOTER_DETAILS: Record<string, {
  it: { title: string; subtitle: string; desc: string; points: string[] };
  en: { title: string; subtitle: string; desc: string; points: string[] };
}> = {
  "sol-burner": {
    it: {
      title: "STRUMENTO SOL BURNER APRIPISTA",
      subtitle: "Ingegneria di Eliminazione Account & Rilascio di State Rent",
      desc: "La funzionalità principale di BurnerSOL consente di individuare in sicurezza vecchi account, mint di token scaduti, account associati inutilizzati (ATA) e metadati orfani all'interno del proprio wallet Solana. Ciascuno di questi account blocca dello State Rent che può essere sbloccato.",
      points: [
        "Innesca il recupero istantaneo dello State Rent su Solana.",
        "Rilascia circa ~0.00203 SOL per ciascun account obsoleto eliminato.",
        "Opera mediante controlli di sicurezza rigorosi a livello di codice.",
        "Genera ricompense d'incentivo in token $BURNER come bonus fedeltà."
      ]
    },
    en: {
      title: "FLAGSHIP SOL BURNER UTILITY",
      subtitle: "Account Pruning & State Rent Release Engineering",
      desc: "The primary utility of BurnerSOL scans and flags unused accounts, expired token mints, empty Associated Token Accounts (ATA), and orphaned metadata inside your Solana wallet. Each of these accounts locks storage rent which can be safely unlocked.",
      points: [
        "Enables instant State Rent recovery to your primary address.",
        "Reclaims exactly ~0.00203 SOL for every single pruned Associated Token Account.",
        "Backed by strict pre-execution safety and dry-run block simulations.",
        "Earns additional $BURNER token incentives as bonus protocol utility."
      ]
    }
  },
  "recupera-sol": {
    it: {
      title: "MECCANISMO DI RECOVERY SOLANA",
      subtitle: "Liberare il Capitale Silente sulla Blockchain",
      desc: "Il recupero di SOL bloccati negli account inutilizzati rappresenta un modo ideale di ottimizzare il proprio portafoglio. Molti utenti lasciano inconsapevolmente decine di dollari in SOL intrappolati in account creati da vecchi swap DeFi.",
      points: [
        "Recupero immediato e transazione trasparente al 100% esposta on-chain.",
        "Nessun intermediario: i fondi tornano direttamente al tuo indirizzo registrato.",
        "Strumento automatico con scansione di sicurezza e nodi RPC integrati.",
        "Ripulendo la blockchain contribuisci direttamente all'efficienza globale."
      ]
    },
    en: {
      title: "SOLANA RENT RECOVERY PIPELINE",
      subtitle: "Unlocking Dormant Cryptographic Capital",
      desc: "Recovering locked SOL from unused accounts is an optimal way to streamline your wallet. Many users unknowingly leave tens of dollars in SOL trapped in residual account structures created by old swaps.",
      points: [
        "Instant recovery with 100% on-chain transparency and zero waiting time.",
        "Non-custodial design: funds route straight back into your own self-custody wallet.",
        "Automatic discovery tool querying high-performance Solana RPC nodes.",
        "Reduces state bloat, contributing directly to network storage health."
      ]
    }
  },
  "come-funziona": {
    it: {
      title: "ARCHITETTURA DI PROGRAMMA E FLOW",
      subtitle: "Spiegazione Tecnica del Ciclo di Eliminazione",
      desc: "Solana impone una regola per cui ogni account deve detenere un deposito di SOL per assicurarsi l'allocazione dello storage globale della blockchain (esenzione affitto). Quando vendi tutti i token di una moneta, la struttura del registro rimane attiva consumando SOL.",
      points: [
        "La dApp rileva questi scheletri strutturali vuoti nel tuo wallet.",
        "Instaura un comando di chiusura (closeAccount) in sicurezza tramite smart contract.",
        "Il deposito dello State Rent viene sciolto e accreditato a te immediatamente.",
        "Ottieni un duplice vantaggio: recupero di SOL reali e alleggerimento del wallet."
      ]
    },
    en: {
      title: "INSTRUCTION PROGRAM FLOW",
      subtitle: "Under-the-Hood Dynamics of Blockchain Rent",
      desc: "Solana requires accounts to lock up a small SOL deposit as collateral to occupy the blockchain's memory (rent exemption). When you sell all corresponding tokens, the structural state shell persists in locking your collateral.",
      points: [
        "The dApp queries the blockchain and discovers these empty skeletal units.",
        "Safe construction of closeAccount instructions prevents transaction conflicts.",
        "Dormant rent collateral is immediately dissolved and released to you.",
        "Get two-fold reward: reclaim real SOL and clean your active wallet."
      ]
    }
  },
  "chi-siamo": {
    it: {
      title: "ECCELLENZA TECNOLOGICA BURNERSOL",
      subtitle: "Pionieri dell'Efficienza degli Stati Blockchain",
      desc: "Siamo un collettivo d'eccellenza focalizzato sull'ingegneria dei sistemi distribuiti e contratti intelligenti. Il nostro obiettivo è abbattere le barriere complesse dei protocolli web3 fornendo utilità di livello enterprise per la finanza decentralizzata.",
      points: [
        "Sviluppatori dedicati all'ottimizzazione dell'infrastruttura di rete Solana.",
        "Sostenitori di un ecosistema open-source pulito, sostenibile ed efficiente.",
        "Specialisti in sicurezza dei contratti e interfacce utente HUD responsive.",
        "Oltre 5 milioni di transazioni simulate con successo in totale sulla rete."
      ]
    },
    en: {
      title: "BURNERSOL TECHNOLOGICAL EDGE",
      subtitle: "Pioneers of Modern Decentralized Utilities",
      desc: "We are an engineering collective focused on building premium smart contract utilities. Our operational vision is to make complex Web3 structures accessible with highly secure, automated systems.",
      points: [
        "Dedicated block-storage developers committing to state efficiency.",
        "Advocates for clean, high-performance decentralized storage layers.",
        "Specialized in pre-execution transaction simulations and HUD interfaces.",
        "Over 5 million simulated transactions processed safely globally."
      ]
    }
  },
  "faq": {
    it: {
      title: "DOMANDE FREQUENTI (FAQ)",
      subtitle: "Chiarimenti Tecnici ed Operativi Immediati",
      desc: "Vuoi saperne di più sul funzionamento tecnico e sulla sicurezza? Ecco le risposte ideali per rassicurarti e comprendere al meglio ogni singolo passaggio logico.",
      points: [
        "La dApp è sicura? Assolutamente sì, opera solo su istruzioni di eliminazione di elementi vuoti.",
        "Quali wallet sono supportati? Phantom, Solflare, Backpack e tutti i principali provider Solana.",
        "Quanto costa l'operazione? Solo le normali micro-gas fee della rete Solana (~0.000005 SOL).",
        "Quanto ritira ciascun account? Circa 0.00203 SOL, accreditato immediatamente ad ogni firma."
      ]
    },
    en: {
      title: "FREQUENTLY ASKED QUESTIONS (FAQ)",
      subtitle: "Instant Operational & Safety Information",
      desc: "Want to learn more about the technical details? Here are the ideal explanations covering safety, wallets, and standard blockchain workflows.",
      points: [
        "Is the dApp secure? Yes, it only constructs verified empty account closure transactions.",
        "Which wallets are supported? Phantom, Solflare, Backpack and all standard web3 providers.",
        "Are there any major costs? Only the basic Solana gas network fees (~0.000005 SOL).",
        "How much SOL do I get? ~0.00203 SOL per account is immediately unlocked upon approval."
      ]
    }
  },
  "sicurezza": {
    it: {
      title: "PROTOCOLLI DI CRITTOGRAFIA E SICUREZZA",
      subtitle: "Standard Elevati con Analisi Sandbox Pre-Execution",
      desc: "La sicurezza degli asset è la nostra priorità numero uno. Prima che una firma venga inoltrata al wallet dell'utente, la dApp esegue controlli multipli on-chain per escludere qualsiasi rischio di perdita.",
      points: [
        "Simulazione Dry-Run: Controlla l'esatta variazione dei saldi prima dell'approvazione.",
        "Esclusione di Saldo Positivo: Impossibile cancellare account con token valorizzati al loro interno.",
        "Uso di Contratti Verificati: Istruzioni standard e aperte del programma di sistema di Solana.",
        "Zero Accesso a Chiavi Private: Chiavi custodite esclusivamente nel tuo wallet protetto."
      ]
    },
    en: {
      title: "ENHANCED CRYPTOGRAPHIC SAFETY RIGOR",
      subtitle: "Standard Integrity with Pre-Execution Sandbox Checks",
      desc: "Your assets are covered under absolute fail-safe environments. Prior to any wallet signature call, the protocol executes multiple state validations to eliminate user error or data loss.",
      points: [
        "Transaction Dry-Run simulations expose the exact changes beforehand.",
        "Failsafe exclusion blocks closure instructions on anything with positive monetary value.",
        "Native Program Instructions: Uses official audited Solana System Program constructs only.",
        "Seed Separation: Absolute zero custody. Your keys remain fully sealed inside your chosen wallet API."
      ]
    }
  },
  "contatti": {
    it: {
      title: "CENTRO DI ASSISTENZA E TELEMETRIA",
      subtitle: "Canali Operativi di Supporto della Community",
      desc: "Siamo sempre pronti ad ascoltare feedback, segnalazioni e a supportare gli utenti durante le operazioni di bonifica e ottimizzazione. Connettici subito con i canali attivi.",
      points: [
        "Supporto e-mail dedicato: support@burnersol.io",
        "Canale di sviluppo attivo: Consulta il nostro repository GitHub ufficiale.",
        "Notizie ed aggiornamenti tempestivi: Seguici su X.com per restare aggiornato.",
        "Supporto in tempo reale: Unisciti alla vivace community Discord per riscontri immediati."
      ]
    },
    en: {
      title: "TECHNICAL COMMUNICATIONS CORE",
      subtitle: "Active Operations & Community Access Hub",
      desc: "We are always responsive to user feedback, technical queries, and feature suggestions. Feel free to contact us through any of our operational hubs.",
      points: [
        "Official Developer Email Desk: support@burnersol.io",
        "Live technical updates & community reviews available via Discord servers.",
        "Daily status posts and optimization stats published on X.com.",
        "Open GitHub repository discussions for reporting UI glitches or script errors."
      ]
    }
  },
  "termini": {
    it: {
      title: "TERMINI E CONDIZIONI DEL SERVIZIO",
      subtitle: "Parametri Legali per l'Esecuzione On-Chain",
      desc: "L'utilizzo di BurnerSOL implica l'accettazione consapevole delle regole e delle responsabilità associate alle interazioni Web3 basate su blockchain decentralizzate.",
      points: [
        "Invertibilità: Qualsiasi transazione on-chain approvata non può essere annullata.",
        "No Custodia: L'utente mantiene il controllo sovrano e la responsabilità del proprio wallet.",
        "Finalità: Lo strumento è fornito 'as is' promuovendo la pulizia degli stati globali.",
        "Accuratezza: Il simulatore integrato funge da indicazione fedele basata su dati RPC."
      ]
    },
    en: {
      title: "TERMS & CONDITIONS OF SERVICE",
      subtitle: "Legal Directives for On-Chain Protocol Use",
      desc: "Using BurnerSOL constitutes active agreement with the technical standards, user responsibilities, and structural behaviors of Web3 applications.",
      points: [
        "Irreversibility: Signed on-chain state clearance procedures are forever permanent by network design.",
        "Self-Custody Responsibility: You hold complete visual selection and transaction signing control.",
        "Utility Purpose: The protocol is engineered for state cleanup and rent-exemption recovery.",
        "RPC Reliability: Transaction estimates reflect live, non-binding Solana block metrics."
      ]
    }
  },
  "privacy": {
    it: {
      title: "INFORMATIVA SULLA PRIVACY E IDENTITÀ",
      subtitle: "Filosofia Zero Tracciamento e Raccolta Dati",
      desc: "Rispettiamo l'anonimato intrinseco delle reti blockchain. Nessun dato personale viene mai raccolto, né inviato a server centralizzati per scopi commerciali.",
      points: [
        "Nessun tracciamento di indirizzi IP, cookies analitici o dati geografici.",
        "Nessun modulo di iscrizione: l'identità è espressa unicamente dalla chiave pubblica.",
        "Le interrogazioni RPC caricano solo informazioni pubbliche memorizzate sulla blockchain.",
        "Garanzia di esclusione da ad-trackers, strumenti di telemarketing o pixel pubblicitari."
      ]
    },
    en: {
      title: "DECENTRALIZED PRIVACY & CORE ALIGNMENT",
      subtitle: "Absolute Zero-Data Harvesting Manifesto",
      desc: "We prioritize cryptographically secure anonymity. We do not index personal identifiers, cookies, or telemetry to centralized databases.",
      points: [
        "Zero monitoring of user IP logs, cookies, trackers, or system characteristics.",
        "No email registers or credentials: your standard public key represents your workspace context.",
        "Only native blockchain queries to verified public node endpoints are executed.",
        "Strictly free from advertising networks, customer profile sales, and analytical tracking pixels."
      ]
    }
  }
};

export default function App() {
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
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timer = setTimeout(() => {
      setHoveredSection(null);
    }, 250);
    setHoverTimeout(timer);
  };

  // Language Support — priority: route > localStorage > browser > default
const { language, t, hreflangLinks } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
    
    // Update SEO meta tags based on language
    const titles: Record<string, { title: string; description: string }> = {
      en: {
        title: "BurnerSOL - Blockchain State Rent Recovery & SOL Burner",
        description: "The definitive hyper-deflationary protocol on Solana. Reclaim locked SOL from unused accounts, expired token mints, and spam dust. Institutional-grade memory closure mechanics."
      },
      it: {
        title: "BurnerSOL - Recupero Rent e Brucia SOL su Solana",
        description: "Il protocollo iper-deflazionistico definitivo su Solana. Recupera SOL bloccati da account inutilizzati, mint di token scaduti e spam dust. Meccaniche di chiusura memoria di livello istituzionale."
      },
      es: {
        title: "BurnerSOL - Recuperación de Rent y Quema de SOL en Solana",
        description: "El protocolo hiperdeflacionario definitivo en Solana. Recupera SOL bloqueados de cuentas no utilizadas, mints de tokens caducados y polvo de estafa."
      },
      fr: {
        title: "BurnerSOL - Récupération de Rent et Brûlage SOL sur Solana",
        description: "Le protocole hyper-deflationniste définitif sur Solana. Récupérez les SOL bloqués des comptes inutilisés, des mints de tokens expirés et des poussière d'arnaque."
      },
      de: {
        title: "BurnerSOL - Rent-Wiederherstellung und SOL-Verbrennung auf Solana",
        description: "Das definitive hyper-deflationäre Protokoll auf Solana. Geben Sie gesperrte SOL aus ungenutzten Konten, abgelaufenen Token-Mints und Spam-Staub frei."
      },
      pt: {
        title: "BurnerSOL - Recuperação de Rent e Queima de SOL na Solana",
        description: "O protocolo hiper-deflacionário definitivo na Solana. Recupere SOL bloqueados de contas não utilizadas, mints de tokens expirados e pó de golpe."
      },
      ru: {
        title: "BurnerSOL - Восстановление аренды и сжигание SOL на Solana",
        description: "Окончательный гипердефляционный протокол на Solana. Верните заблокированные SOL с неиспользуемых аккаунтов, просроченных токенов и спам-пыли."
      },
      tr: {
        title: "BurnerSOL - Solana'da Rent Geri Alma ve SOL Yakma",
        description: "Solana'daki kesin hiper-enflasyonist protokol. Kullanılmayan hesaplardan, süresi dolmuş token mint'lerinden ve spam tozlarından kilitli SOL'ları geri alın."
      },
      nl: {
        title: "BurnerSOL - Renteteruggave en SOL-verbranding op Solana",
        description: "Het definitieve hyper-deflationaire protocol op Solana. Herstel vergrendelde SOL van ongebruikte accounts, verlopen token-mints en spam-stof."
      },
      ar: {
        title: "BurnerSOL - استرداد الإيجار وحرق SOL على سولانا",
        description: "بروتوكول الانكماش المفرط النهائي على سولانا. استرداد SOL المجمدة من الحسابات غير المستخدمة ورموز Mint المنتهية الصلاحية والغبار الاحتيالي."
      },
      ko: {
        title: "BurnerSOL - 솔라나에서 임대료回収 및 SOL 소각",
        description: "솔라나의 최종 초탈flation 프로토콜. 미사용 계정, 만료된 토큰 민트 및 스팸 더스트에서 잠긴 SOL을回収합니다."
      },
      zh: {
        title: "BurnerSOL - Solana区块链租金回收与SOL销毁",
        description: "Solana上终极超通缩协议。从闲置账户、过期货币铸造和垃圾粉尘中回收锁定的SOL。机构级内存关闭机制。"
      },
    };
    
    const seo = titles[language] || titles.en;
    
    document.title = seo.title;
    
    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seo.description);
    
    // Update og:tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || (() => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:title');
      document.head.appendChild(el);
      return el;
    })();
    ogTitle.setAttribute('content', seo.title);
    
    const ogDesc = document.querySelector('meta[property="og:description"]') || (() => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:description');
      document.head.appendChild(el);
      return el;
    })();
    ogDesc.setAttribute('content', seo.description);
    
    // Update hreflang links
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(el => el.remove());
    
    hreflangLinks.forEach(({ lang, path }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', `${window.location.origin}${path}`);
      document.head.appendChild(link);
    });
    
  }, [language, hreflangLinks]);

  // Wallet Balances (Synchronized)
  const [walletBalance, setWalletBalance] = useState(1.452); // SOL
  const [burnerBalance, setBurnerBalance] = useState(125000); // $BURNER

  // Web3 Dynamic Wallet State & Connections
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    try {
      return localStorage.getItem("burner_solana_wallet_address") || null;
    } catch (e) {
      return null;
    }
  });
  const [walletProvider, setWalletProvider] = useState<string | null>(() => {
    try {
      return localStorage.getItem("burner_solana_wallet_provider") || null;
    } catch (e) {
      return null;
    }
  });
  const [customAddressInput, setCustomAddressInput] = useState("");

  // Protocol Architect Settings (Tokenomics custom setup)
  const [coinName, setCoinName] = useState("BURNER");
  const [coinSymbol, setCoinSymbol] = useState("BURN");
  const [protocolFeePercent, setProtocolFeePercent] = useState(50); // Default 50% split to creator
  const [giftMultiplier, setGiftMultiplier] = useState(150000); // 150k custom coin per 1 SOL captured
  const [creatorSolLiquidity, setCreatorSolLiquidity] = useState(0.0); // Real accumulated creator earnings!
  
  // Real Protocol State Trackers (persistent across component mounts)
  const [stakedBalance, setStakedBalance] = useState(0); 
  const [userSolRewards, setUserSolRewards] = useState(0.0);
  const [cumulativeBuybacks, setCumulativeBuybacks] = useState(0.0);
  const [sessionReclaimedSol, setSessionReclaimedSol] = useState(0.0);
  const [analyzedAddresses, setAnalyzedAddresses] = useState<string[]>([]);

  // Active Burning / Furnace Logic
  const [activeTab, setActiveTab ] = useState<"cleaner" | "protocol">("cleaner");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [burnIntensity, setBurnIntensity] = useState(0);
  const [coreTemp, setCoreTemp] = useState(2842); // °C

  // Notification Modals
  const [showBurnSuccess, setShowBurnSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [reclaimSummary, setReclaimSummary] = useState<{
    itemCount: number;
    solReclaimed: number;
    protocolFeePaid: number;
    netReclaimed: number;
    itemsList: string;
    rewardsMinted: number;
  }>({
    itemCount: 0,
    solReclaimed: 0,
    protocolFeePaid: 0,
    netReclaimed: 0,
    itemsList: "",
    rewardsMinted: 0,
  });

  const [notifications, setNotifications] = useState<{ id: string; text: string }[]>([]);

  // Historical local transaction logs for real-time fidelity
const loadInitialTxs = (): BurnTransaction[] => {
    try {
      const stored = loadBurnHistory();
      if (stored.length > 0) return stored;
    } catch {}
    return [];
  };

  const [txs, setTxs] = useState<BurnTransaction[]>(loadInitialTxs);

  // Price Alert System State & Integrations
  const [currentPrice, setCurrentPrice] = useState(0.0324);
  const [enableJitter, setEnableJitter] = useState(true);
  const [alertTargetPrice, setAlertTargetPrice] = useState("0.0330");
  const [alertType, setAlertType] = useState<"above" | "below">("above");
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem("burner_price_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [chartData, setChartData] = useState(() => ORIGINAL_CHART_DATA);

  // Sync price alerts to storage
  useEffect(() => {
    try {
      localStorage.setItem("burner_price_alerts", JSON.stringify(priceAlerts));
    } catch (e) {}
  }, [priceAlerts]);

  // Sync real-time chart data coordinate with currentPrice
  useEffect(() => {
    setChartData((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[copy.length - 1] = { ...copy[copy.length - 1], Price: currentPrice };
      }
      return copy;
    });
  }, [currentPrice]);

  // Auto fluctuating live market ticker interval
  useEffect(() => {
    if (!enableJitter) return;

    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        // Subtle micro-fluctuations (-1% to +1%)
        const deltaPercent = (Math.random() * 2 - 1) / 100;
        const nextPrice = prev * (1 + deltaPercent);
        return Number(Math.max(0.005, Math.min(0.2, nextPrice)).toFixed(5));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [enableJitter]);

  // Alert threshold triggers effect watcher
  useEffect(() => {
    let changed = false;
    const nextAlerts = priceAlerts.map((alert) => {
      if (alert.isTriggered) return alert;

      const crossedAbove = alert.type === "above" && currentPrice >= alert.targetPrice;
      const crossedBelow = alert.type === "below" && currentPrice <= alert.targetPrice;

      if (crossedAbove || crossedBelow) {
        changed = true;
        
        const badge = alert.type === "above" ? "▲ HIGH" : "▼ LOW";
        const msg = `🔔 ALLERTA ${badge}: Il prezzo di $BURNER è ora $${currentPrice.toFixed(4)} USD, superando la tua soglia di $${alert.targetPrice.toFixed(4)}!`;
        
        // Push notification in active stream
        pushNotification(msg);
        
        // Play success chime
        try {
          sound.playSuccessChime();
        } catch (e) {}

        return {
          ...alert,
          isTriggered: true,
          triggeredAt: new Date().toLocaleTimeString(),
        };
      }

      return alert;
    });

    if (changed) {
      setPriceAlerts(nextAlerts);
    }
  }, [currentPrice, priceAlerts]);

  // Handle thermal grid fluctuations
  useEffect(() => {
    const tempInterval = setInterval(() => {
      if (isBurning) {
        // High combustion thermal spikes
        setCoreTemp(() => Math.floor(6200 + Math.random() * 600));
      } else {
        // Idle ambient thermal jitter
        setCoreTemp(() => Math.floor(2800 + Math.random() * 90));
      }
    }, 800);

    return () => clearInterval(tempInterval);
  }, [isBurning]);

  // Track analyzed unique wallet addresses
  useEffect(() => {
    if (walletAddress && walletAddress.length >= 32) {
      setAnalyzedAddresses((prev) => {
        if (!prev.includes(walletAddress)) {
          return [...prev, walletAddress];
        }
        return prev;
      });
    }
  }, [walletAddress]);

  // Handle auto notifications
  const pushNotification = (text: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  // Fetch real-time mainnet wallet balance from RPC
  const fetchRealBalance = async (address: string) => {
    if (!address || address.length < 32) return;
    try {
      const response = await fetch("https://solana-mainnet.g.alchemy.com/v2/XhvbwzXZcW2UhCcCj5cC1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address]
        })
      });
      const data = await response.json();
      if (data?.result?.value !== undefined) {
        const solVal = data.result.value / 1e9;
        setWalletBalance(solVal);
        pushNotification(`🌐 Saldo Sincronizzato: ${solVal.toFixed(4)} SOL`);
      }
    } catch (err) {
      console.warn("Could not fetch real Mainnet balance", err);
    }
  };

  // Auto synchronizer on mount & change
  useEffect(() => {
    if (walletAddress) {
      fetchRealBalance(walletAddress);
    }
  }, [walletAddress]);

  // Trigger Burn / Incinerate Process
  const handleBurnItems = (itemsToBurn: TrashItem[]) => {
    if (itemsToBurn.length === 0 || isBurning) return;

    // Secure Transaction Simulation & Pre-Flight Validation Layer
    const safetyCheck = simulateAndValidateBurn(itemsToBurn, walletBalance, 0.000005);
    if (!safetyCheck.safe) {
      pushNotification(`❌ Security Block: ${safetyCheck.reason}`);
      setIsBurning(false);
      return;
    }

    // Push transaction alerts / warnings if active
    if (safetyCheck.warnings && safetyCheck.warnings.length > 0) {
      safetyCheck.warnings.forEach((warn) => pushNotification(`⚠ Safe Guard Warning: ${warn}`));
    }

    const solToReclaim = itemsToBurn.reduce((acc, curr) => acc + curr.reclaimableSol, 0);
    const names = itemsToBurn.map((i) => i.symbol).join(", ");

    // Calculate smart dynamic commission fee based on our newly evaluated Phase 1 formula
    const totalFeeSol = itemsToBurn.reduce((acc, item) => {
      const score = item.riskReport?.score ?? (item.isScam ? 90 : 10);
      const feePercent = getSmartDynamicFeePercent(score);
      return acc + (item.reclaimableSol * feePercent) / 100;
    }, 0);

    const netSol = solToReclaim - totalFeeSol;
    const tokensGifted = totalFeeSol * giftMultiplier;

    setReclaimSummary({
      itemCount: itemsToBurn.length,
      solReclaimed: solToReclaim,
      protocolFeePaid: totalFeeSol,
      netReclaimed: netSol,
      itemsList: names,
      rewardsMinted: tokensGifted,
    });

    setIsBurning(true);
    setBurnIntensity(1);
    
    // Play the physical high-fidelity furnace roar rumble
    sound.startFurnaceRoar();
    
    pushNotification(`🔥 Combustion sequence queued for ${itemsToBurn.length} items...`);
  };

  // Called automatically when CombustionChamber canvas finishes its countdown loop
  const handleBurnComplete = () => {
    setIsBurning(false);
    setBurnIntensity(0);

    // Stop furnace roar and play success crystal chime
    sound.stopFurnaceRoar();
    sound.playSuccessChime();

    // Use our pre-calculated dynamic fee split parameters
    const totalProtocolFee = reclaimSummary.protocolFeePaid;
    const userShare = reclaimSummary.netReclaimed;
    const tokensGifted = reclaimSummary.rewardsMinted;
    
    // Add net share to user wallet balance
    setWalletBalance((prev) => prev + userShare);
    setSessionReclaimedSol((prev) => prev + userShare);
    
    // Protocol split design:
    // - 20% to Creator Treasury
    // - 40% to Buyback Pool
    // - 40% to Yield (earnable by active stakers)
    const treasuryFee = totalProtocolFee * 0.2;
    const buybackFee = totalProtocolFee * 0.4;
    const yieldFee = totalProtocolFee * 0.4;

    setCreatorSolLiquidity((prev) => prev + treasuryFee);
    setCumulativeBuybacks((prev) => prev + buybackFee);
    
    if (stakedBalance > 0) {
      setUserSolRewards((prev) => prev + yieldFee);
    }

    // Gifting multiplier logic: mint compensatory protocol coins back to user
    setBurnerBalance((prev) => prev + tokensGifted);

    // Save transaction to local log (reflecting user's net SOL share)
    const hashChars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const fullHash = Array.from({ length: 88 }, () => hashChars[Math.floor(Math.random() * hashChars.length)]).join("");
    const walletName = (walletProvider || "wallet").charAt(0).toUpperCase() + (walletProvider || "wallet").slice(1);
    const fullAddress = walletAddress || customAddressInput || "";
    const newTx: BurnTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: "Just now",
      itemCount: reclaimSummary.itemCount,
      solReclaimed: userShare,
      txHash: fullHash,
      status: "success",
      walletAddress: fullAddress,
      walletName,
    };

    setTxs((prev) => [newTx, ...prev].slice(0, 10));
    saveBurnTransaction(newTx as any);

    // Play visual winning confetti celebration!
    confetti({
      particleCount: 140,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#10b981", "#34d399", "#ff9f1c", "#ffffff"],
    });

    setShowBurnSuccess(true);
    pushNotification(`✨ Melt successful! Net +${userShare.toFixed(5)} SOL rent reclaimed. Compensated you +${tokensGifted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}!`);
  };

  // Withdraw simulated founder revenues back into main user wallet balance
  const handleWithdrawRevenue = () => {
    if (creatorSolLiquidity <= 0) return;
    const amount = creatorSolLiquidity;
    setWalletBalance((prev) => prev + amount);
    setCreatorSolLiquidity(0);

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#10b981", "#ffffff"]
    });

    pushNotification(`💸 Claim Complete! Safe transferred +${amount.toFixed(4)} SOL founder revenues into your primary wallet address!`);
  };

  // Handle Swap Trades
  const handleSwapComplete = (sourceType: "sol" | "burner", amount: number, resultAmount: number) => {
    if (sourceType === "sol") {
      if (walletBalance < amount) {
        pushNotification("⚠️ Insufficient SOL balance!");
        return;
      }
      setWalletBalance((prev) => prev - amount);
      setBurnerBalance((prev) => prev + resultAmount);
      pushNotification(`🔄 Swapped ${amount.toFixed(3)} SOL to +${resultAmount.toLocaleString()} $BURNER`);
    } else {
      if (burnerBalance < amount) {
        pushNotification("⚠️ Insufficient $BURNER balance!");
        return;
      }
      setBurnerBalance((prev) => prev - amount);
      setWalletBalance((prev) => prev + resultAmount);
      pushNotification(`🔄 Swapped ${amount.toLocaleString()} $BURNER to +${resultAmount.toFixed(5)} SOL`);
    }

    // Play celebration!
    sound.playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 50,
      origin: { y: 0.8 },
      colors: ["#34d399", "#ffbe1f", "#ffffff"],
    });
  };

  return (
    <div className="min-h-screen bg-dark-obsidian text-slate-300 antialiased font-sans flex flex-col relative select-none">
      {/* Decorative heatwaves */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-flame-orange/5 blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full bg-flame-coral/5 blur-[160px] pointer-events-none -z-10" />

      {/* Slide notifications HUD */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="pointer-events-auto p-4 rounded-xl glass-panel-glow border border-flame-orange/20 flex items-center gap-3 animate-spark-float text-xs font-mono text-white [box-shadow:0_10px_30px_rgba(0,0,0,0.5)] bg-slate-950/80"
          >
            <div className="p-1 px-2 rounded-md bg-flame-orange/20 text-flame-orange font-bold uppercase animate-pulse">
              HOT
            </div>
            <p>{n.text}</p>
          </div>
        ))}
      </div>

      {/* Main Header */}
      <header className="border-b border-white/10 bg-[#060606e5] backdrop-blur-lg sticky top-0 z-40">
        {/* Subtle upper glow stripe */}
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-flame-orange/40 to-transparent" />
        <div className="max-w-[1350px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-flame-orange rounded-none transform rotate-45 flex items-center justify-center border border-black shadow-lg">
              <div className="w-4 h-4 bg-black rounded-none"></div>
            </div>
            <div className="flex flex-col ml-1 text-left">
              <span className="font-display font-black text-white text-base tracking-tighter uppercase italic leading-none">
                BURNERSOL
              </span>
              <span className="text-[8px] text-flame-orange font-mono tracking-[0.2em] leading-none mt-1 uppercase">
                SCARCITY CRUCIBLE
              </span>
            </div>
          </div>



          {/* Balance indicators & Hamburger Button */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <LanguageSwitcher />

            {/* Quick Balance for mobile and desktop */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 border border-white/10 text-[11px] font-mono bg-white/[0.02]">
              <Coins className="w-3 h-3 text-purple-400 font-bold" />
              <span className="text-white font-bold">{walletBalance.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 font-bold">SOL</span>
            </div>

            {walletAddress ? (
              <button
                type="button"
                onClick={() => { sound.playHoverPluck(); dispatchOpenWalletModal(); }}
                className="flex border border-emerald-500/30 hover:border-emerald-400 px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] flex items-center gap-2 bg-emerald-950/20 text-emerald-400 transition-all shrink-0 cursor-pointer font-bold"
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>{walletAddress.slice(0, 5)}...{walletAddress.slice(-4)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { sound.playHoverPluck(); dispatchOpenWalletModal(); }}
                className="flex border border-flame-orange/40 hover:border-flame-orange px-3.5 py-2 text-[10px] font-mono uppercase tracking-[0.14em] flex items-center gap-2 bg-flame-orange/10 text-flame-orange transition-all shrink-0 cursor-pointer font-bold animate-pulse"
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span>{language === "it" ? "CONNETTI WALLET" : "CONNECT WALLET"}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1350px] mx-auto px-6 py-12 w-full space-y-16 animate-fade-in" id="dashboard">
        
        {/* Portal Greeting Banner */}
        <div className="pb-12 border-b border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Display header column */}
            <div className="lg:col-span-12 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <span className="w-1.5 h-1.5 bg-flame-orange rounded-full animate-pulse"></span>
                  <span className="text-[10px] uppercase tracking-wider text-flame-orange font-bold font-mono">{t.statusBanner}</span>
                </div>
              </div>
              
              <h1 className="text-[48px] sm:text-[76px] lg:text-[96px] leading-[0.85] font-display font-black italic uppercase tracking-tighter text-white">
                {t.heroHeadingBurn} <span className="text-flame-orange">{t.heroHeadingFast}</span>.<br />
                {t.heroHeadingReclaim} <span className="font-serif font-light text-slate-300">SOL</span>.
              </h1>
              
              <p className="max-w-xl text-sm sm:text-base text-slate-400 leading-relaxed font-light">
                {t.heroSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Nav Tabs Router Panel */}
        <div className="mt-2 transition-all duration-300">
          
          {activeTab === "cleaner" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                
                {/* Diagnostic List Portal (Right Side) */}
                <div className="lg:col-span-12 xl:col-span-12 font-sans">
                  <ScannerTerminal 
                    walletAddress={walletAddress}
                    onWalletAddressChange={setWalletAddress}
                    onBurnSelect={handleBurnItems}
                    isBurning={isBurning}
                    walletBalance={walletBalance}
                    language={language}
                    sessionReclaimedSol={sessionReclaimedSol}
                    analyzedWalletsCount={analyzedAddresses.length}
                  />
                </div>

                {/* Global Burn Feed - Real On-Chain Transactions */}
                <div className="lg:col-span-12 xl:col-span-12">
                  <GlobalBurnFeed
                    userWalletAddress={walletAddress}
                    personalBurnHistory={txs}
                  />
                </div>

              </div>
            </div>
          )}



        </div>

      </main>

      {/* Combustion Chamber Fire Animation Overlay — shown only during active burn */}
      {isBurning && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-80 mx-4">
            <CombustionChamber
              isBurning={isBurning}
              intensity={burnIntensity}
              onBurnComplete={handleBurnComplete}
            />
          </div>
        </div>
      )}

      <WalletConnector
        onConnected={(address, walletId) => {
          setWalletAddress(address);
          setWalletProvider(walletId);
          pushNotification(`⚡ Connected: ${address.slice(0, 5)}...`);
        }}
        onDisconnected={() => {
          setWalletAddress(null);
          setWalletProvider(null);
          pushNotification(language === 'it' ? "🔌 Wallet disconnesso." : "🔌 Wallet disconnected.");
        }}
        connectedAddress={walletAddress}
        language={language}
      />

      {/* Burn Success Dialog Modal */}
      {showBurnSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-flame-orange p-8 rounded-none relative [box-shadow:0_30px_60px_rgba(0,0,0,0.85)] space-y-6">
            
            {/* Close button */}
            <button
               onClick={() => setShowBurnSuccess(false)}
               className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all pointer-events-auto"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon header */}
            <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
              <div className="w-12 h-12 bg-flame-orange transform rotate-45 flex items-center justify-center border border-black animate-pulse">
                <Flame className="w-6 h-6 text-black fill-black -rotate-45" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold italic text-white text-xl tracking-wide uppercase mt-4">
                  {t.modalCompleted}
                </h3>
                <p className="text-xs text-emerald-400 uppercase font-mono tracking-widest font-bold">
                  {t.modalSub}
                </p>
              </div>
            </div>

            {/* Reclaim Details List */}
            <div className="bg-white/[0.02] border border-white/10 p-5 rounded-none space-y-2.5 font-mono text-xs text-left">
              <div className="flex justify-between items-center text-slate-400">
                <span>{t.modalClosed}:</span>
                <span className="text-white font-bold">{reclaimSummary.itemCount} {t.ledgerColAccounts}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-400">
                <span>GROSS SOL RECLAIMED:</span>
                <span className="text-slate-300 font-bold">
                  +{reclaimSummary.solReclaimed.toFixed(5)} SOL
                </span>
              </div>

              <div className="flex justify-between items-center text-red-400/80 text-[11px]">
                <span>DYNAMIC PROTOCOL COMMISSION:</span>
                <span>
                  -{reclaimSummary.protocolFeePaid.toFixed(5)} SOL
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="text-emerald-400 font-bold">{t.modalRaw}:</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-0.5">
                  +{reclaimSummary.netReclaimed.toFixed(5)} SOL
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-200">
                <span className="text-indigo-300 font-bold">BURNER EMITTED:</span>
                <span className="text-white font-bold animate-pulse text-indigo-400 font-mono">
                  +{reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} {coinSymbol}
                </span>
              </div>

              <p className="text-[9px] text-slate-500 pt-3 font-sans tracking-wide leading-relaxed text-center uppercase">
                {t.modalStateMsg}
              </p>
            </div>

            {/* Share Achievement Panel */}
            <div className="border border-white/5 bg-[#050505] p-3.5 space-y-3 text-left">
              <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <Share2 className="w-3 h-3 text-indigo-400 shrink-0" />
                {language === 'it' ? "CONDIVIDI RISULTATO OLTRE RETE" : "PROPAGATE TO SOCIAL LAYERS"}
              </span>

              {/* Shared Text Preview Frame */}
              <div 
                className="bg-black border border-white/5 p-2 font-mono text-[9.5px] text-slate-400 rounded-none leading-relaxed select-none relative overflow-hidden group cursor-pointer"
                onClick={() => {
                  const shareText = language === 'it' 
                    ? `🔥 SOL recuperato dal vuoto! Ho appena bruciato ${reclaimSummary.itemCount} account spazzatura su Solana tramite @BurnerSol e recuperato un netto di +${reclaimSummary.netReclaimed.toFixed(5)} SOL accumulando +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}! Riscatta il tuo rent su https://burner-sol.io 🚀`
                    : `🔥 SOL reclaimed from the void! Just purged ${reclaimSummary.itemCount} junk accounts on Solana via @BurnerSol, reclaiming a net +${reclaimSummary.netReclaimed.toFixed(5)} SOL and earning +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}! Clear your wallet storage now at https://burner-sol.io 🚀`;
                  navigator.clipboard.writeText(shareText);
                  setIsCopied(true);
                  sound.playSuccessChime();
                  setTimeout(() => setIsCopied(false), 2000);
                }}
              >
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 border border-white/10 text-[8px] text-white">
                  {language === 'it' ? "CLICCA PER COPIARE" : "CLICK TO COPY"}
                </div>
                "{language === 'it' 
                  ? `Ho appena bruciato ${reclaimSummary.itemCount} account spazzatura su Solana tramite @BurnerSol e recuperato +${reclaimSummary.netReclaimed.toFixed(5)} SOL e +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}!` 
                  : `Just purged ${reclaimSummary.itemCount} junk accounts on Solana via @BurnerSol, reclaiming +${reclaimSummary.netReclaimed.toFixed(5)} SOL and earning +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}!`}..."
              </div>

              {/* Share Interaction Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const shareText = language === 'it' 
                      ? `🔥 SOL recuperato dal vuoto! Ho appena bruciato ${reclaimSummary.itemCount} account spazzatura su Solana tramite @BurnerSol e recuperato un netto di +${reclaimSummary.netReclaimed.toFixed(5)} SOL accumulando +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}! Riscatta il tuo rent su https://burner-sol.io 🚀`
                      : `🔥 SOL reclaimed from the void! Just purged ${reclaimSummary.itemCount} junk accounts on Solana via @BurnerSol, reclaiming a net +${reclaimSummary.netReclaimed.toFixed(5)} SOL and earning +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}! Clear your wallet storage now at https://burner-sol.io 🚀`;
                    navigator.clipboard.writeText(shareText);
                    setIsCopied(true);
                    sound.playSuccessChime();
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className={`py-1.5 border leading-none text-[9px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    isCopied 
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 animate-pulse" 
                      : "bg-[#0b0b0b]/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      {language === 'it' ? "COPIATO!" : "COPIED!"}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                      {language === 'it' ? "COPIA COPIOSO" : "COPY TEXT"}
                    </>
                  )}
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    language === 'it' 
                      ? `🔥 SOL recuperato dal vuoto! Ho appena bruciato ${reclaimSummary.itemCount} account spazzatura su Solana tramite @BurnerSol e recuperato un netto di +${reclaimSummary.netReclaimed.toFixed(5)} SOL accumulando +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}! Riscatta il tuo rent su https://burner-sol.io 🚀`
                      : `🔥 SOL reclaimed from the void! Just purged ${reclaimSummary.itemCount} junk accounts on Solana via @BurnerSol, reclaiming a net +${reclaimSummary.netReclaimed.toFixed(5)} SOL and earning +${reclaimSummary.rewardsMinted.toLocaleString(undefined, { maximumFractionDigits: 0 })} $${coinSymbol}! Clear your wallet storage now at https://burner-sol.io 🚀`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playHoverPluck()}
                  className="py-1.5 bg-[#0b0b0b]/80 border border-white/10 text-slate-300 hover:text-white hover:border-[#1d9bf0]/40 hover:bg-[#1d9bf0]/10 leading-none text-[9px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
                  style={{ cursor: "pointer" }}
                >
                  <Share2 className="w-3 h-3 text-[#1d9bf0] shrink-0" />
                  {language === 'it' ? "CONDIVIDI SU X" : "SHARE ON X"}
                </a>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setShowBurnSuccess(false)}
              className="w-full py-3.5 rounded-none font-display font-bold text-xs text-white bg-flame-orange hover:bg-orange-600 tracking-[0.2em] uppercase transition-all duration-300 pointer-events-auto cursor-pointer"
            >
              {t.modalCloseBtn}
            </button>
          </div>
        </div>
      )}

      {/* Footer area */}
      <footer className="border-t border-white/10 bg-[#060606] mt-24">
        <div className="max-w-[1350px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-white/[0.05] pb-10">
            {/* Column 1: Brand Info */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-flame-orange rounded-none transform rotate-45 flex items-center justify-center">
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
              <h5 className="font-mono text-[9px] text-flame-orange uppercase tracking-[0.2em] font-bold">Protocollo</h5>
              <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider">
                <a 
                  href="#sol-burner" 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                  onMouseEnter={() => handleMouseEnterSection("sol-burner")}
                  onMouseLeave={handleMouseLeaveSection}
                  onClick={(e) => { e.preventDefault(); handleMouseEnterSection("sol-burner"); }}
                >
                  SOL Burner
                </a>
                <a 
                  href="#recupera-sol" 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                  onMouseEnter={() => handleMouseEnterSection("recupera-sol")}
                  onMouseLeave={handleMouseLeaveSection}
                  onClick={(e) => { e.preventDefault(); handleMouseEnterSection("recupera-sol"); }}
                >
                  Recupera SOL
                </a>
                <a 
                  href="#come-funziona" 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                  onMouseEnter={() => handleMouseEnterSection("come-funziona")}
                  onMouseLeave={handleMouseLeaveSection}
                  onClick={(e) => { e.preventDefault(); handleMouseEnterSection("come-funziona"); }}
                >
                  Come funziona
                </a>
              </div>
            </div>

            {/* Column 3: Resources & Info */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="font-mono text-[9px] text-flame-orange uppercase tracking-[0.2em] font-bold">Risorse & Info</h5>
              <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider">
                <a 
                  href="#chi-siamo" 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                  onMouseEnter={() => handleMouseEnterSection("chi-siamo")}
                  onMouseLeave={handleMouseLeaveSection}
                  onClick={(e) => { e.preventDefault(); handleMouseEnterSection("chi-siamo"); }}
                >
                  Chi siamo
                </a>
                <a 
                  href="#faq" 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                  onMouseEnter={() => handleMouseEnterSection("faq")}
                  onMouseLeave={handleMouseLeaveSection}
                  onClick={(e) => { e.preventDefault(); handleMouseEnterSection("faq"); }}
                >
                  FAQ
                </a>
                <a 
                  href="#sicurezza" 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                  onMouseEnter={() => handleMouseEnterSection("sicurezza")}
                  onMouseLeave={handleMouseLeaveSection}
                  onClick={(e) => { e.preventDefault(); handleMouseEnterSection("sicurezza"); }}
                >
                  Sicurezza
                </a>
                <a 
                  href="#contatti" 
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                  onMouseEnter={() => handleMouseEnterSection("contatti")}
                  onMouseLeave={handleMouseLeaveSection}
                  onClick={(e) => { e.preventDefault(); handleMouseEnterSection("contatti"); }}
                >
                  Contatti
                </a>
              </div>
            </div>

            {/* Column 4: Legale & Social */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-3">
                <h5 className="font-mono text-[9px] text-flame-orange uppercase tracking-[0.2em] font-bold">Legale</h5>
                <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider">
                  <a 
                    href="#termini" 
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                    onMouseEnter={() => handleMouseEnterSection("termini")}
                    onMouseLeave={handleMouseLeaveSection}
                    onClick={(e) => { e.preventDefault(); handleMouseEnterSection("termini"); }}
                  >
                    Termini
                  </a>
                  <a 
                    href="#privacy" 
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none" 
                    onMouseEnter={() => handleMouseEnterSection("privacy")}
                    onMouseLeave={handleMouseLeaveSection}
                    onClick={(e) => { e.preventDefault(); handleMouseEnterSection("privacy"); }}
                  >
                    Privacy
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center md:text-left">
              © 2026 BurnerSOL. Tutti i diritti riservati.
            </div>

            {/* Social Links Panel */}
            <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[9px] uppercase tracking-[0.2em] py-2 md:py-0">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => sound.playHoverPluck()}
                className="text-slate-400 hover:text-flame-orange hover:scale-105 transition-all flex items-center gap-2"
                title="GitHub Repository"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                <span>GitHub</span>
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => sound.playHoverPluck()}
                className="text-slate-400 hover:text-flame-orange hover:scale-105 transition-all flex items-center gap-2"
                title="Follow on X"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>X.com</span>
              </a>
              <a 
                href="https://discord.gg" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => sound.playHoverPluck()}
                className="text-slate-400 hover:text-flame-orange hover:scale-105 transition-all flex items-center gap-2"
                title="Discord Community"
              >
                <svg viewBox="0 0 127.14 96.36" className="w-3.5 h-3.5 fill-current"><path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.4,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c1-.73,2-1.49,2.92-2.27a75.14,75.14,0,0,0,85,0c.9.78,1.91,1.54,2.92,2.27a68.43,68.43,0,0,1-10.45,5A77.7,77.7,0,0,0,115.1,96.36a105.73,105.73,0,0,0,31-18.83C148.8,54.65,142.72,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/></svg>
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING HUD PREVIEW TERMINAL FOR FOOTER LINKS */}
      {hoveredSection && (() => {
        const details = FOOTER_DETAILS[hoveredSection]?.[language === 'it' ? 'it' : 'en'] || FOOTER_DETAILS[hoveredSection]?.['it'];
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
                className="p-1 hover:bg-white/10 text-slate-500 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/10"
                title={language === 'it' ? "Chiudi" : "Close"}
              >
                <X className="w-3.5 h-3.5" />
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
      })()}
    </div>
  );
}
