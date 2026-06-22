import { useState, useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import ScannerTerminal from "./components/ScannerTerminal";
import GlobalBurnFeed from "./components/GlobalBurnFeed";
import CombustionChamber from "./components/CombustionChamber";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BurnSuccessModal from "./components/BurnSuccessModal";
import BurnConfirmModal from "./components/BurnConfirmModal";
import FooterHUD from "./components/FooterHUD";
import { TrashItem, BurnTransaction } from "./types";
import { sound } from "./utils/audio";
import { getSmartDynamicFeePercent } from "./utils/riskEngine";
import { simulateAndValidateBurn } from "./utils/transactionSafety";
import { saveBurnTransaction, loadBurnHistory } from "./utils/burnHistory";
import { useSafeWallet } from "./providers/SolanaWalletProvider";
import { ORIGINAL_CHART_DATA } from "./constants/footerDetails";

interface PriceAlert {
  id: string;
  targetPrice: number;
  type: "above" | "below";
  createdAt: string;
  isTriggered: boolean;
  triggeredAt?: string;
}


export default function App() {
  // Inline English translations
  const t = {
    statusBanner: "RECLAIM ACTIVE PROTOCOL",
    heroHeadingBurn: "BURN",
    heroHeadingFast: "FAST",
    heroHeadingReclaim: "RECLAIM",
    heroSubtitle: "The definitive hyper-deflationary protocol built on Solana. Harness institutional-grade memory closure mechanics to secure your wallet by reclaiming locked SOL deposits from toxic coins, unused mint accounts, and spam dust.",
    modalCompleted: "INCINERATION COMPLETED",
    modalSub: "Rent Recovered in SOL Securely",
    modalClosed: "ACCOUNTS CLOSED:",
    ledgerColAccounts: "ACCOUNTS MELTED",
    modalRaw: "RECOVERED RAW RENT:",
    modalStateMsg: "MELTED TARGET ACCOUNT DATA ERASED FROM LEDGER REGISTRY CONSTANTS. RECLAIMED SOL RENT APPLIED SUCCESSFULLY TO THE WALLET BALANCE.",
    modalCloseBtn: "FURNACE VENT CLOSED",
  };
  
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

  // SEO meta tags synchronized with index.html
  useEffect(() => {
    document.title = "Recover SOL | Solana Wallet Cleaner & Rent Recovery Tool | BurnerSOL";
    document.documentElement.lang = "en";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Recover locked SOL from unused token accounts on Solana. Close empty SPL accounts, remove spam NFTs, and reclaim wallet rent with BurnerSOL — the fastest non-custodial Solana wallet cleaner.");
  }, []);

  // Wallet Balances (Synchronized)
  const [walletBalance, setWalletBalance] = useState(1.452); // SOL
  const [burnerBalance, setBurnerBalance] = useState(125000); // $BURNER

  // Web3 Dynamic Wallet State & Connections (from wallet adapter)
  const { publicKey, wallet, connected, sendTransaction, connection } = useSafeWallet();
  const walletAddress = useMemo(
    () => (publicKey ? publicKey.toBase58() : null),
    [publicKey]
  );
  const walletProvider = useMemo(
    () => wallet?.adapter?.name || null,
    [wallet]
  );
  const [customAddressInput, setCustomAddressInput] = useState("");

  // Wallet connection/disconnection notifications
  const prevConnectedRef = useRef(connected);
  useEffect(() => {
    if (connected && !prevConnectedRef.current && walletAddress) {
      pushNotification(`⚡ Connected: ${walletAddress.slice(0, 5)}...`);
    } else if (!connected && prevConnectedRef.current) {
      pushNotification("🔌 Wallet disconnected.");
    }
    prevConnectedRef.current = connected;
  }, [connected, walletAddress]);

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
  const [burnIntensity, setBurnIntensity] = useState(1);
  const [coreTemp, setCoreTemp] = useState(2842); // °C

  // Notification Modals
  const [showBurnSuccess, setShowBurnSuccess] = useState(false);
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);
  const [pendingBurnItems, setPendingBurnItems] = useState<TrashItem[]>([]);
  const [pendingBurnIntensity, setPendingBurnIntensity] = useState(1);
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
        const msg = `🔔 ALERT ${badge}: BURNER price is now $${currentPrice.toFixed(4)} USD, crossing your threshold of $${alert.targetPrice.toFixed(4)}!`;
        
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
        pushNotification(`🌐 Balance Synced: ${solVal.toFixed(4)} SOL`);
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
  const handleBurnItems = async (itemsToBurn: TrashItem[], burnIntensityFromUI: number) => {
    if (itemsToBurn.length === 0 || isBurning) return;

    if (!connected || !publicKey || !sendTransaction || !connection) {
      pushNotification("❌ Wallet not connected. Please connect your wallet first.");
      return;
    }

    // On-chain validation happened during scan - burnStatus tells us if valid
    // Just show warnings from pre-flight check
    const safetyCheck = simulateAndValidateBurn(itemsToBurn, walletBalance, 0.000005);
    if (safetyCheck.warnings && safetyCheck.warnings.length > 0) {
      safetyCheck.warnings.forEach((warn) => pushNotification(`⚠ ${warn}`));
    }

    // Store pending items and show confirmation modal
    setPendingBurnItems(itemsToBurn);
    setPendingBurnIntensity(burnIntensityFromUI);
    setShowBurnConfirm(true);
  };

  // Execute burn after confirmation
  const executeBurn = async () => {
    setShowBurnConfirm(false);
    setIsBurning(true);
    sound.startFurnaceRoar();
    pushNotification(`🔥 Building transaction for ${pendingBurnItems.length} items...`);

    try {
      const { buildAndSendBurnTransaction } = await import("./utils/burnTransaction");

      const result = await buildAndSendBurnTransaction(
        pendingBurnItems,
        publicKey,
        sendTransaction,
        connection,
        pendingBurnIntensity,
        wallet
      );

      if (result.success) {
        pushNotification(`✅ Burn confirmed! Reclaimed ${result.netReclaimedSol.toFixed(5)} SOL`);
        setShowBurnSuccess(true);

        const solToReclaim = result.totalReclaimedSol;
        setReclaimSummary({
          itemCount: pendingBurnItems.length,
          solReclaimed: solToReclaim,
          protocolFeePaid: result.protocolFeeSol,
          netReclaimed: result.netReclaimedSol,
          itemsList: pendingBurnItems.map((i) => i.symbol).join(", "),
          rewardsMinted: result.protocolFeeSol * giftMultiplier,
          txSignature: result.signature,
        });

        setSessionReclaimedSol((prev) => prev + result.netReclaimedSol);

        const txRecord: BurnTransaction = {
          id: `burn-${Date.now()}`,
          timestamp: new Date().toISOString(),
          fromAddress: walletAddress || "",
          toAddress: walletAddress || "",
          signature: result.signature || "",
          status: "success",
          type: "burn",
          amount: result.totalReclaimedSol,
          fee: result.protocolFeeSol,
          tokenSymbol: pendingBurnItems.map((i) => i.symbol).join(","),
          network: "solana",
          chain: "solana",
          walletName: walletProvider || "wallet",
          walletAddress: walletAddress || "",
          reclaimSummary: {
            solReclaimed: result.totalReclaimedSol,
            protocolFeePaid: result.protocolFeeSol,
            netReclaimed: result.netReclaimedSol,
          },
        } as any;
        saveBurnTransaction(txRecord as any);

        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      } else {
        pushNotification(`❌ Burn failed: ${result.error}`);
      }
    } catch (err: any) {
      console.error("Burn error:", err);
      pushNotification(`❌ Transaction error: ${err?.message || "Unknown error"}`);
    } finally {
      setIsBurning(false);
      sound.stopFurnaceRoar();
    }
  };

  // Called automatically when CombustionChamber canvas finishes its countdown loop
  const handleBurnComplete = () => {
    sound.playSuccessChime();
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
      pushNotification(`🔄 Swapped ${amount.toFixed(3)} SOL to +${resultAmount.toLocaleString()} BURNER`);
    } else {
      if (burnerBalance < amount) {
        pushNotification("⚠️ Insufficient BURNER balance!");
        return;
      }
      setBurnerBalance((prev) => prev - amount);
      setWalletBalance((prev) => prev + resultAmount);
      pushNotification(`🔄 Swapped ${amount.toLocaleString()} BURNER to +${resultAmount.toFixed(5)} SOL`);
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
      {/* Skip navigation link for accessibility */}
      <a href="#dashboard" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-flame-orange focus:text-black focus:px-4 focus:py-2 focus:font-bold focus:outline-none">
        Skip to main content
      </a>

      {/* Decorative heatwaves */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-flame-orange/5 blur-[120px] pointer-events-none -z-10 animate-pulse-glow" aria-hidden="true" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full bg-flame-coral/5 blur-[160px] pointer-events-none -z-10" aria-hidden="true" />

      {/* Slide notifications HUD */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" role="log" aria-live="polite" aria-label="Notifications">
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
      <Header walletBalance={walletBalance} />

      {/* Main Container */}
      <main className="flex-1 max-w-[1350px] mx-auto px-6 py-12 w-full space-y-16 animate-fade-in" id="dashboard" role="main" aria-label="Main content">
        
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
                    walletPublicKey={publicKey}
                    connection={connection}
                    onBurnSelect={handleBurnItems}
                    isBurning={isBurning}
                    walletBalance={walletBalance}
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label="Burn animation">
          <div className="w-full max-w-lg h-80 mx-4">
            <CombustionChamber
              isBurning={isBurning}
              intensity={burnIntensity}
              onBurnComplete={handleBurnComplete}
            />
          </div>
        </div>
      )}

      {/* Burn Success Dialog Modal */}
      <BurnSuccessModal
        showBurnSuccess={showBurnSuccess}
        setShowBurnSuccess={setShowBurnSuccess}
        reclaimSummary={reclaimSummary}
        coinSymbol={coinSymbol}
      />

      {/* Burn Confirmation Dialog Modal */}
      <BurnConfirmModal
        showConfirm={showBurnConfirm}
        setShowConfirm={setShowBurnConfirm}
        items={pendingBurnItems}
        totalReclaimSol={pendingBurnItems.reduce((acc, item) => acc + item.reclaimableSol, 0)}
        protocolFeeSol={pendingBurnItems.reduce((acc, item) => acc + item.reclaimableSol, 0) * getSmartDynamicFeePercent() / 100}
        netReclaimSol={pendingBurnItems.reduce((acc, item) => acc + item.reclaimableSol, 0) * (1 - getSmartDynamicFeePercent() / 100)}
        onConfirm={executeBurn}
        isProcessing={isBurning}
      />

      {/* Footer area */}
      <Footer
        handleMouseEnterSection={handleMouseEnterSection}
        handleMouseLeaveSection={handleMouseLeaveSection}
      />

      {/* FLOATING HUD PREVIEW TERMINAL FOR FOOTER LINKS */}
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
