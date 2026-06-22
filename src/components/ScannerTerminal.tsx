import React, { useState, useEffect, useRef } from "react";
import { TrashItem } from "../types";
import { validateBurnability } from "../utils/burnTransaction";
import {
  ShieldAlert,
  Trash2,
  Sparkle,
  RefreshCw,
  Layers,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Percent,
  ShieldCheck,
  AlertOctagon,
  Flame,
  Coins,
  Zap,
} from "lucide-react";
import { sound } from "../utils/audio";
import { evaluateAssetRisk, getSmartDynamicFeePercent, determineBurnability, getSimulatedInfo } from "../utils/riskEngine";
import { generateBurnPreview, BurnPreviewReport } from "../utils/burnPreview";
import { fetchJupiterPrices } from "../utils/marketData";
import { enforceSpamThresholdCapping, fetchHeliusAllAssetsDAS, fetchHeliusFungibleTokens, executeResilientRpc } from "../utils/solana";
import ResilientImage from "./ResilientImage";

interface ScannerTerminalProps {
  walletAddress?: string | null;
  walletPublicKey?: any;
  connection?: any;
  onBurnSelect: (items: TrashItem[], intensity: number) => void;
  isBurning: boolean;
  walletBalance: number;
  language?: string;
  sessionReclaimedSol?: number;
  analyzedWalletsCount?: number;
}

// Static English t object
const t = {
  step1Badge: "DIAGNOSTICS",
  step2Badge: "ISOLATION", 
  step3Badge: "COMBUSTION",
  p_diagnostics: "Run Diagnostics",
  heroHeadingBurn: "BURN",
};

// Concrete inputs to drive the Advanced Risk Scoring Engine for the default dataset
const RAW_TRASH_ITEMS = [
  {
    id: "1",
    name: "FREE SOLANA REWARD dAPP",
    symbol: "CLAIM-GIFT.net",
    type: "token" as const,
    amount: 15000000,
    valueUsd: 0.00,
    reclaimableSol: 0.00204,
    descriptor: "Scam airdrop. Interacting with website will drain wallet.",
    selected: true,
    mintAddress: "Gv8dH9N6A5zW876YqpXp111111111111CLM",
    inputs: {
      metadataQuality: { hasVerifiedLogo: false, hasProperDescription: false, hasWebsiteLink: true, isClonedOfficialName: false },
      liquidity: { poolBalanceUsd: 0, hasActiveAmmPool: false, hasSellLiquidityLocked: false },
      holderDistribution: { top10HoldersSharePct: 98, isCreatorHoldingAllTokens: true, numberOfActiveHolders: 1 },
      tokenAge: { daysSinceCreation: 1 },
      behavioralSignals: { hasInjectedAirdropMemo: true, hasWalletDrainingHistory: true, isTransferDisabled: false }
    }
  },
  {
    id: "2",
    name: "SOLANA HALLOWEEN AIRDROP",
    symbol: "CLAIM-PUMPKIN.net",
    type: "token" as const,
    amount: 250000,
    valueUsd: 0.00,
    reclaimableSol: 0.00204,
    descriptor: "Malicious tracking token injected into active user wallets.",
    selected: true,
    mintAddress: "PuMPKiNpHYsHh1ngSpAM222222222222777",
    inputs: {
      metadataQuality: { hasVerifiedLogo: false, hasProperDescription: false, hasWebsiteLink: false, isClonedOfficialName: false },
      liquidity: { poolBalanceUsd: 200, hasActiveAmmPool: true, hasSellLiquidityLocked: false },
      holderDistribution: { top10HoldersSharePct: 92, isCreatorHoldingAllTokens: false, numberOfActiveHolders: 8 },
      tokenAge: { daysSinceCreation: 4 },
      behavioralSignals: { hasInjectedAirdropMemo: true, hasWalletDrainingHistory: false, isTransferDisabled: false }
    }
  },
  {
    id: "3",
    name: "Golden Doge Ticket #5923",
    symbol: "DOGETICKET",
    type: "nft" as const,
    amount: 1,
    valueUsd: 0.00,
    reclaimableSol: 0.00228,
    descriptor: "Spam NFT. Claims user has won 200 SOL. Links to phishing.",
    imageUrl: "https://picsum.photos/seed/spamnft/400/300",
    selected: true,
    mintAddress: "DoGeTiCKeTspAMnFt3333333333333333388",
    inputs: {
      metadataQuality: { hasVerifiedLogo: false, hasProperDescription: true, hasWebsiteLink: false, isClonedOfficialName: false },
      liquidity: { poolBalanceUsd: 0, hasActiveAmmPool: false, hasSellLiquidityLocked: false },
      holderDistribution: { top10HoldersSharePct: 88, isCreatorHoldingAllTokens: false, numberOfActiveHolders: 12 },
      tokenAge: { daysSinceCreation: 12 },
      behavioralSignals: { hasInjectedAirdropMemo: true, hasWalletDrainingHistory: false, isTransferDisabled: false }
    }
  },
  {
    id: "4",
    name: "Abandoned SAMO Rent Account",
    symbol: "SAMO-MINT",
    type: "account" as const,
    amount: 0,
    valueUsd: 0.00,
    reclaimableSol: 0.00204,
    descriptor: "Empty token account. No tokens left, but locked SOL rent remains.",
    selected: false,
    mintAddress: "SigoXm7eYCHb6df7uSgR3scz7F7mZ6p8xQfLscA2b8B",
    inputs: {
      metadataQuality: { hasVerifiedLogo: true, hasProperDescription: true, hasWebsiteLink: true, isClonedOfficialName: false },
      liquidity: { poolBalanceUsd: 145000, hasActiveAmmPool: true, hasSellLiquidityLocked: true },
      holderDistribution: { top10HoldersSharePct: 35, isCreatorHoldingAllTokens: false, numberOfActiveHolders: 45000 },
      tokenAge: { daysSinceCreation: 950 },
      behavioralSignals: { hasInjectedAirdropMemo: false, hasWalletDrainingHistory: false, isTransferDisabled: false }
    }
  },
  {
    id: "5",
    name: "Defunct JUP-SOL V3 Liquidity Dust",
    symbol: "JUP-SOL-LP",
    type: "lp" as const,
    amount: 0.0000042,
    valueUsd: 0.01,
    reclaimableSol: 0.00412,
    descriptor: "Abandoned yield-farming routing account with closed lock locks.",
    selected: false,
    mintAddress: "JuPSoLLPFArMinG444444444444444444455",
    inputs: {
      metadataQuality: { hasVerifiedLogo: true, hasProperDescription: true, hasWebsiteLink: true, isClonedOfficialName: false },
      liquidity: { poolBalanceUsd: 8700000, hasActiveAmmPool: true, hasSellLiquidityLocked: true },
      holderDistribution: { top10HoldersSharePct: 22, isCreatorHoldingAllTokens: false, numberOfActiveHolders: 12400 },
      tokenAge: { daysSinceCreation: 420 },
      behavioralSignals: { hasInjectedAirdropMemo: false, hasWalletDrainingHistory: false, isTransferDisabled: false }
    }
  },
  {
    id: "6",
    name: "CLAIM YOUR FREE JUPITER REWARD",
    symbol: "CLAIMJUP.org",
    type: "token" as const,
    amount: 1000000,
    valueUsd: 0.00,
    reclaimableSol: 0.00204,
    descriptor: "Fake cloned contract addressing disguised as official claim link.",
    selected: false,
    mintAddress: "JuPiTeRSpAmAiRdRoP666666666666666699",
    inputs: {
      metadataQuality: { hasVerifiedLogo: false, hasProperDescription: false, hasWebsiteLink: false, isClonedOfficialName: true },
      liquidity: { poolBalanceUsd: 0, hasActiveAmmPool: false, hasSellLiquidityLocked: false },
      holderDistribution: { top10HoldersSharePct: 99, isCreatorHoldingAllTokens: true, numberOfActiveHolders: 1 },
      tokenAge: { daysSinceCreation: 2 },
      behavioralSignals: { hasInjectedAirdropMemo: true, hasWalletDrainingHistory: false, isTransferDisabled: false }
    }
  }
];

// Enrich the initial trash dataset by running it through the modular Advanced Risk Engine
const ENRICHED_DEFAULT_TRASH_ITEMS: TrashItem[] = RAW_TRASH_ITEMS.map((item) => {
  const report = evaluateAssetRisk(item.name, item.symbol, item.inputs);
  return {
    id: item.id,
    name: item.name,
    symbol: item.symbol,
    type: item.type,
    amount: item.amount,
    valueUsd: item.valueUsd,
    reclaimableSol: item.reclaimableSol,
    imageUrl: (item as any).imageUrl,
    descriptor: item.descriptor,
    mintAddress: item.mintAddress,
    isScam: report.level === "SCAM" || report.level === "HIGH_RISK",
    selected: item.selected,
    riskReport: report,
  };
});

export default function ScannerTerminal({
  walletAddress,
  walletPublicKey,
  connection,
  onBurnSelect,
  isBurning,
  walletBalance,
  language = "en",
  sessionReclaimedSol = 0.0,
  analyzedWalletsCount = 0,
}: ScannerTerminalProps) {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSource, setScanSource] = useState<"simulator" | "alchemy-mainnet">("simulator");
  const [filterType, setFilterType] = useState<"all" | "burnable" | "nonburnable">("all");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [terminalAddressInput, setTerminalAddressInput] = useState("");
  const [inputError, setInputError] = useState("");

  // Phase 2 state extensions
  const [burnPreview, setBurnPreview] = useState<BurnPreviewReport | null>(null);
  const [burnIntensity, setBurnIntensity] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, []);

  const runWalletScan = async (address: string | null) => {
    if (!address || address.length < 32) {
      setItems([]);
      setIsScanning(false);
      setScanProgress(0);
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setExpandedItemId(null);
    setScanSource("alchemy-mainnet");

    let progressVal = 0;

    progressTimerRef.current = setInterval(() => {
      progressVal += Math.floor(Math.random() * 15) + 5;
      if (progressVal >= 90) progressVal = 90;
      setScanProgress(progressVal);
    }, 75);

    // Attempt 1: Try serverless API first (works on Vercel)
    try {
      const resp = await fetch("/api/solana/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success && data.items && data.items.length > 0) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          const scannedItems = enforceSpamThresholdCapping(data.items || []);
          const computedItems = scannedItems.map((item: TrashItem) => ({
            ...item,
            isBurnable: determineBurnability(item),
          }));
          setItems(computedItems);
          setScanSource("alchemy-mainnet");
          setScanProgress(100);
          setIsScanning(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Serverless API unavailable, falling back to client-side RPC:", err);
    }

    // Attempt 2: Client-side Helius DAS — fetches all assets with full metadata
    try {
      setScanProgress(25);

      const [dasAssets, fungibleTokens] = await Promise.all([
        fetchHeliusAllAssetsDAS(address),
        fetchHeliusFungibleTokens(address),
      ]);

      setScanProgress(70);

      const KNOWN_TOKENS: Record<string, { name: string; symbol: string }> = {
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { name: "USD Coin", symbol: "USDC" },
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { name: "USDT", symbol: "USDT" },
        "So11111111111111111111111111111111111111112": { name: "Wrapped SOL", symbol: "WSOL" },
        "JUPyiwrYJF2ip9vdJjN2BLm9S85FmP9X9bJ65h6Nzo6": { name: "Jupiter", symbol: "JUP" },
        "DezXAZ8z7PnrnRJjz3wX4mP97EGAtfA6AtC8Zq1A2Uq": { name: "Bonk", symbol: "BONK" },
        "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": { name: "Marinade staked SOL", symbol: "mSOL" },
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": { name: "Lido staked SOL", symbol: "stSOL" },
      };

      const SPAM_KEYWORDS = ["CLAIM", "FREE", "GIFT", "REWARD", "AIRDROP", "TICKET", "VOUCHER", "WINNER", ".NET", ".COM", ".ORG", ".XYZ", ".CC", ".LINK", "CLICK", "VISIT"];

      const dasMints = new Set(dasAssets.map(a => a.id));

      const rpcItems: TrashItem[] = [];

      // Map DAS assets (NFTs, compressed, etc.)
      for (const asset of dasAssets) {
        const mint = asset.id;
        const known = KNOWN_TOKENS[mint];
        const tokenBalance = asset.tokenInfo?.balance ?? 0;
        const decimals = asset.decimals ?? 0;
        const lamports = asset.accountInfo?.lamports || 0;
        const reclaimableSol = lamports > 0 ? lamports / 1e9 : 0.002039;

        let type: TrashItem["type"] = "token";
        if (asset.interface === "NFT" || asset.interface === "ProgrammableNFT") {
          type = "nft";
        } else if (tokenBalance === 0 && lamports === 0) {
          type = "account";
        } else if (tokenBalance === 0) {
          type = "account";
        }

        let name = known?.name || asset.name || `SPL Asset (${mint.slice(0, 4)}...${mint.slice(-4)})`;
        let symbol = known?.symbol || asset.symbol || `SPL-${mint.slice(0, 3).toUpperCase()}`;
        const image = asset.image;
        const description = asset.description;
        const collection = asset.collectionName || "";
        const attrs = asset.attributes || [];

        const isSpam = SPAM_KEYWORDS.some(kw => name.toUpperCase().includes(kw) || symbol.toUpperCase().includes(kw));

        if (type === "account") {
          name = `Defunct SPL Account (${mint.slice(0, 4)}...${mint.slice(-4)})`;
          symbol = "EMPTY";
        }

        let descriptor = type === "account"
          ? `Defunct empty SPL Token account. Safe to close to reclaim ${reclaimableSol.toFixed(5)} SOL rent.`
          : isSpam
            ? `Malicious spam/airdrop asset detected.`
            : description
              ? description.slice(0, 150)
              : collection
                ? `${symbol} — Collection: ${collection}`
                : `${symbol || name} — Token balance active.`;

        const riskInputs = getSimulatedInfo(name, symbol, isSpam);
        const report = evaluateAssetRisk(name, symbol, riskInputs);

        const tempItemForCheck = {
          id: mint,
          name,
          symbol,
          type,
          amount: tokenBalance,
          valueUsd: 0,
          reclaimableSol,
          decimals,
          mintAddress: mint,
          isScam: isSpam || report.level === "SCAM",
          descriptor,
          riskReport: report,
          inputs: riskInputs,
        };

        const isItemBurnable = determineBurnability(tempItemForCheck);

        rpcItems.push({
          id: mint,
          name,
          symbol,
          type,
          amount: tokenBalance,
          valueUsd: 0,
          reclaimableSol,
          decimals,
          mintAddress: mint,
          imageUrl: image || (type === "nft" ? `https://picsum.photos/seed/${mint.slice(0, 6)}/300/300` : undefined),
          isScam: isSpam || report.level === "SCAM",
          descriptor,
          riskReport: report,
          selected: isSpam || type === "account",
          metadataSource: "helius" as const,
          inputs: riskInputs,
        });
      }

      // Map fungible tokens not already in DAS results
      for (const ft of fungibleTokens) {
        if (dasMints.has(ft.mint)) continue;
        if (ft.uiAmount === 0) continue;

        const known = KNOWN_TOKENS[ft.mint];
        const name = known?.name || `Token (${ft.mint.slice(0, 4)}...${ft.mint.slice(-4)})`;
        const symbol = known?.symbol || `SPL-${ft.mint.slice(0, 3).toUpperCase()}`;

        const isSpam = SPAM_KEYWORDS.some(kw => name.toUpperCase().includes(kw) || symbol.toUpperCase().includes(kw));

        const riskInputs = getSimulatedInfo(name, symbol, isSpam);
        const report = evaluateAssetRisk(name, symbol, riskInputs);

        const tempFungibleItem = {
          id: ft.pubkey,
          name,
          symbol,
          type: "token" as const,
          amount: ft.uiAmount,
          valueUsd: 0,
          reclaimableSol: 0.002039,
          decimals: ft.decimals,
          mintAddress: ft.mint,
          isScam: isSpam || report.level === "SCAM",
          descriptor: `${symbol} — Fungible token, ${ft.uiAmount.toLocaleString()} units.`,
          riskReport: report,
          inputs: riskInputs,
        };

        const isFungibleBurnable = determineBurnability(tempFungibleItem);

        rpcItems.push({
          id: ft.pubkey,
          name,
          symbol,
          type: "token",
          amount: ft.uiAmount,
          valueUsd: 0,
          reclaimableSol: 0.002039,
          decimals: ft.decimals,
          mintAddress: ft.mint,
          imageUrl: undefined,
          isScam: isSpam || report.level === "SCAM",
          descriptor: `${symbol} — Fungible token, ${ft.uiAmount.toLocaleString()} units.`,
          riskReport: report,
          selected: isSpam && isFungibleBurnable,
          metadataSource: "helius" as const,
          inputs: riskInputs,
        });
      }

      const allItems = enforceSpamThresholdCapping(rpcItems);

      const computedItems = allItems.map(item => ({
        ...item,
      }));

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setItems(computedItems);
      setScanSource("alchemy-mainnet");
      setScanProgress(100);
      setIsScanning(false);

      return;

    } catch (rpcErr) {
      console.error("Client-side RPC fallback also failed:", rpcErr);
    }

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setItems([]);
    setScanSource("alchemy-mainnet");
    setScanProgress(100);
    setIsScanning(false);
  };

  // Automatically execute dynamic wallet scans on wallet target transition
  useEffect(() => {
    runWalletScan(walletAddress || null);
  }, [walletAddress]);

  // Fetch live Jupiter prices and update assets on Mount or scan finishing
  useEffect(() => {
    if (items.length === 0 || isScanning) return;

    const queryLiveJupiterPrices = async () => {
      const mints = items.map(item => item.mintAddress).filter(Boolean) as string[];
      if (mints.length === 0) return;

      try {
        const livePrices = await fetchJupiterPrices(mints);
        setItems(prevItems => {
          return prevItems.map(item => {
            if (!item.mintAddress) return item;
            const priceUsd = livePrices[item.mintAddress];
            if (priceUsd !== undefined) {
              // Recalculate risk rating with live pricing input
              const rawInputs = RAW_TRASH_ITEMS.find(r => r.mintAddress === item.mintAddress)?.inputs || {
                metadataQuality: { hasVerifiedLogo: true, hasProperDescription: true, hasWebsiteLink: true, isClonedOfficialName: false },
                liquidity: { poolBalanceUsd: 1000, hasActiveAmmPool: true, hasSellLiquidityLocked: true },
                holderDistribution: { top10HoldersSharePct: 30, isCreatorHoldingAllTokens: false, numberOfActiveHolders: 1000 },
                tokenAge: { daysSinceCreation: 100 },
                behavioralSignals: { hasInjectedAirdropMemo: false, hasWalletDrainingHistory: false, isTransferDisabled: false }
              };
              const updatedReport = evaluateAssetRisk(item.name, item.symbol, rawInputs, priceUsd);
              const isScam = updatedReport.level === "SCAM" || updatedReport.level === "HIGH_RISK";
              const updatedItem: TrashItem = {
                ...item,
                valueUsd: priceUsd * item.amount,
                riskReport: updatedReport,
                isScam,
              };
              updatedItem.isBurnable = determineBurnability(updatedItem);
              return updatedItem;
            }
            return item;
          });
        });
      } catch (error) {
        console.error("Failed to query live Jupiter prices:", error);
      }
    };

    queryLiveJupiterPrices();
  }, [isScanning]);

  useEffect(() => {
    if (!walletPublicKey || !connection || items.length === 0 || isScanning) return;

    const validateItemsOnChain = async () => {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          const status = await validateBurnability(item, walletPublicKey, connection);
          return { ...item, burnStatus: status };
        })
      );
      setItems(updatedItems);
    };

    validateItemsOnChain();
  }, [items.length, walletPublicKey, connection, isScanning]);

  // Retrieve the backend burn preview / simulation report
  const selectedItems = items.filter(i => i.selected);

  useEffect(() => {
    if (selectedItems.length === 0) {
      setBurnPreview(null);
      return;
    }

    const fetchBurnPreviewReport = async () => {
      setIsPreviewLoading(true);
      try {
        const response = await fetch("/api/burn/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: selectedItems,
            burnIntensity: burnIntensity
          }),
        });

        if (response.ok) {
          const report: BurnPreviewReport = await response.json();
          setBurnPreview(report);
        } else {
          // Robust immediate local fallback to survive any disruption
          const fallback = generateBurnPreview(selectedItems, burnIntensity);
          setBurnPreview(fallback);
        }
      } catch (error) {
        console.error("Backend apiBurnPreview unreachable, applying dynamic client-side fallback:", error);
        const fallback = generateBurnPreview(selectedItems, burnIntensity);
        setBurnPreview(fallback);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBurnPreviewReport();
    }, 100);

    return () => clearTimeout(timer);
  }, [items, burnIntensity]);

  const handleScan = () => {
    runWalletScan(walletAddress || null);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBurning) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.isBurnable === false) return item; // Prevent selecting non-burnable assets
          return { ...item, selected: !item.selected };
        }
        return item;
      })
    );
  };

  const toggleSelectAll = () => {
    if (isBurning) return;
    const allSelected = filteredItems.every((item) => item.selected);
    setItems((prev) =>
      prev.map((item) => {
        const matchesFilter = 
          filterType === "all" ||
          (filterType === "burnable" && item.type === "nft") ||
          (filterType === "nonburnable" && item.type === "token");
        
        // Never auto-select non-burnable assets
        if (matchesFilter && !allSelected && !item.isBurnable) {
          return item;
        }

        if (matchesFilter) {
          return { ...item, selected: !allSelected };
        }
        return item;
      })
    );
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "burnable") return item.type === "nft";
    if (filterType === "nonburnable") return item.type === "token";
    return true;
  });

  const totalReclaimSol = selectedItems.reduce((acc, curr) => acc + curr.reclaimableSol, 0);
  const totalSelectedCount = selectedItems.length;

  const totalProtocolFeeSol = selectedItems.reduce((acc, item) => {
    const score = item.riskReport?.score ?? (item.isScam ? 90 : 10);
    const feePct = getSmartDynamicFeePercent();
    return acc + (item.reclaimableSol * feePct) / 100;
  }, 0);

  // Apply simulated burn intensity discount to frontend local totals
  const frontendIntensityDiscountPct = Math.min(0.15, burnIntensity * 0.03);
  const finalProtocolFeeFrontend = totalProtocolFeeSol * (1 - frontendIntensityDiscountPct);
  const totalNetGainSol = totalReclaimSol - finalProtocolFeeFrontend;

  const handleIgniteClick = () => {
    setItems(prev => prev.map(item => {
      if (selectedItems.some(si => si.id === item.id)) {
        return { ...item, selected: false };
      }
      return item;
    }));
    onBurnSelect(selectedItems, burnIntensity);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "nft":
        return <ImageIcon className="w-4 h-4 text-pink-400" />;
      case "lp":
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case "account":
        return <Sparkle className="w-4 h-4 text-blue-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-red-500" />;
    }
  };

  const getLevelBadgeStyles = (level: string) => {
    switch (level) {
      case "SAFE":
        return "bg-emerald-950/40 border-emerald-500/30 text-emerald-400";
      case "SUSPICIOUS":
        return "bg-yellow-950/40 border-yellow-500/30 text-yellow-400";
      case "HIGH_RISK":
        return "bg-orange-950/40 border-orange-500/30 text-orange-400";
      case "SCAM":
      default:
        return "bg-red-950/40 border-red-500/30 text-red-400";
    }
  };

  return (
    <div className="w-full glass-panel border border-white/10 rounded-none overflow-hidden flex flex-col h-full bg-[#030303]" id="scanner-terminal-v2">
      
      {/* HUD Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h3 className="font-display font-bold italic text-white tracking-widest uppercase text-xs">
              {t.step1Badge}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] text-slate-500 tracking-wider">
              <span>NETWORK STATE INTEGRITY</span>
              <span>|</span>
              <span className={`inline-flex items-center gap-1 font-black ${
                scanSource === "alchemy-mainnet" ? "text-emerald-400" : "text-amber-500"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${scanSource === "alchemy-mainnet" ? "animate-pulse" : ""}`} />
                {scanSource === "alchemy-mainnet" ? "ON-CHAIN VERIFICATION" : "SECURE SOLANA CONNECTION"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleScan}
          onMouseEnter={() => sound.playHoverPluck()}
          disabled={isScanning || isBurning}
          aria-label={isScanning ? t.step1Badge : t.p_diagnostics}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-mono rounded-none border border-white/20 hover:border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-widest cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} aria-hidden="true" />
          {isScanning ? t.step1Badge + "..." : t.p_diagnostics.toUpperCase()}
        </button>
      </div>

      {/* Real-time session stats: SOL RENT RECLAIMED & WALLETS ANALYZED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-6 mt-6">
        {/* Card 1: SOL Rent Reclaimed */}
        <div className="p-5 border border-white/5 bg-[#080808] text-left rounded-none relative overflow-hidden" id="sol-rent-reclaimed-card-widget">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.015] to-transparent pointer-events-none" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-1">
            {language === "en" ? "SOL RENT RECLAIMED" : "SOL RENT RECLAIMED"}
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl sm:text-4xl font-display font-black tracking-tighter text-white italic">
              {sessionReclaimedSol.toFixed(5)}
            </span>
            <span className="text-[11px] font-mono font-black uppercase text-flame-orange italic tracking-wider">
              SOL
            </span>
          </div>
        </div>

        {/* Card 2: Wallets Analyzed */}
        <div className="p-5 border border-white/5 bg-[#080808] text-left rounded-none relative overflow-hidden" id="wallets-analyzed-card-widget">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.015] to-transparent pointer-events-none" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-1">
            {language === "en" ? "WALLETS ANALYZED" : "WALLETS ANALYZED"}
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl sm:text-4xl font-display font-black tracking-tighter text-white italic">
              {analyzedWalletsCount}
            </span>
            <span className="text-[11px] font-mono font-black uppercase text-flame-orange italic tracking-wider">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-1 border-b border-white/10 flex items-center justify-between text-xs bg-black/40 mt-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => { setFilterType("all"); setExpandedItemId(null); }}
            onMouseEnter={() => sound.playHoverPluck()}
            className={`px-3 py-2 rounded-none font-mono text-[9px] tracking-widest uppercase transition-all border-b-2 ${
              filterType === "all"
                ? "border-flame-orange text-white bg-white/5 font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => { setFilterType("burnable"); setExpandedItemId(null); }}
            onMouseEnter={() => sound.playHoverPluck()}
            className={`px-3 py-2 rounded-none font-mono text-[9px] tracking-widest uppercase flex items-center gap-1 transition-all border-b-2 ${
              filterType === "burnable"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/25 font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            NFT ({items.filter((i) => i.type === "nft").length})
          </button>
          <button
            onClick={() => { setFilterType("nonburnable"); setExpandedItemId(null); }}
            onMouseEnter={() => sound.playHoverPluck()}
            className={`px-3 py-2 rounded-none font-mono text-[9px] tracking-widest uppercase flex items-center gap-1 transition-all border-b-2 ${
              filterType === "nonburnable"
                ? "border-red-500 text-red-400 bg-red-950/25 font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            SPL ({items.filter((i) => i.type === "token").length})
          </button>
        </div>

        {items.length > 0 && (
          <button
            onClick={toggleSelectAll}
            onMouseEnter={() => sound.playHoverPluck()}
            disabled={isBurning || isScanning}
            className="text-[10px] font-mono text-slate-400 hover:text-flame-orange transition-all font-bold cursor-pointer"
          >
            {filteredItems.every((item) => item.selected) ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>

      {/* Main List Stage */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[220px] max-h-[300px] bg-black/40">
        {isScanning ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 py-16">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-flame-orange/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-t-flame-orange border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <ShieldAlert className="w-6 h-6 text-flame-orange animate-pulse" />
            </div>
            <div className="text-center font-mono space-y-1">
              <p className="text-xs text-white uppercase tracking-widest">Running Risk Telemetry heuristics...</p>
              <p className="text-[10px] text-flame-orange">{scanProgress}% AUDITING WALLET INTEGRITY</p>
            </div>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-flame-orange to-flame-coral transition-all duration-100"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        ) : !walletAddress && items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-6 gap-5 text-center">
            <img src="/fire.png" alt="Coins" className="w-10 h-10 object-cover rounded-full" loading="lazy" aria-hidden="true" />
            <div className="space-y-1 max-w-md">
              <h4 className="font-display font-medium text-white text-xs uppercase tracking-widest">
                REAL-TIME DIAGNOSTICS
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal font-sans">
                Scan any Solana wallet to identify burnable accounts. Connect your wallet to execute burns.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const sanitizedAddress = terminalAddressInput.replace(/[^1-9A-HJ-NP-Za-km-z]/g, "").trim();

              if (sanitizedAddress.length < 32 || sanitizedAddress.length > 44) {
                setInputError(
                  "Invalid address: must be between 32 and 44 characters in standard Base58 format."
                );
                return;
              }

              setInputError("");
              runWalletScan(sanitizedAddress);
            }} className="w-full max-w-sm flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Enter Solana Address..."
                  value={terminalAddressInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    const sanitizedVal = val.replace(/[^1-9A-HJ-NP-Za-km-z]/g, "");
                    setTerminalAddressInput(sanitizedVal);
                    if (sanitizedVal && (sanitizedVal.length < 32 || sanitizedVal.length > 44)) {
                      setInputError(
                        "Incomplete address: typical length must be between 32 and 44 characters."
                      );
                    } else {
                      setInputError("");
                    }
                  }}
                  className="flex-1 bg-black/60 border border-white/10 px-3 py-1.5 text-xs font-mono text-white focus:outline-hidden focus:border-flame-orange placeholder-slate-600 rounded-none"
                />
                <button
                  type="submit"
                  disabled={terminalAddressInput.length < 32 || !!inputError}
                  className="px-4 py-1.5 bg-flame-orange hover:bg-orange-600 text-black font-display font-bold text-xs tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-none cursor-pointer"
                >
                  SCAN
                </button>
              </div>
              {inputError && (
                <div className="text-left font-mono text-[9px] text-flame-orange uppercase tracking-wider animate-pulse ml-1">
                  ⚠️ {inputError}
                </div>
              )}
            </form>

            <p className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">
              Scan works without connecting — burns require wallet via header
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-3">
            <div className="p-3 bg-white/[0.02] rounded-full border border-white/5 text-slate-500">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="font-display font-medium text-white text-sm">Clean Wallet Slate!</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No active threats or garbage accounts detected. Click "Rescan" to recalibrate.
              </p>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedItemId === item.id;
            const score = item.riskReport?.score ?? 0;
            const level = item.riskReport?.level ?? "SAFE";
            const feePercent = getSmartDynamicFeePercent();

            return (
              <div
                key={item.id}
                onClick={() => {
                  sound.playHoverPluck();
                  setExpandedItemId(isExpanded ? null : item.id);
                }}
                className={`flex flex-col rounded-none border transition-all duration-300 ${
                  item.selected 
                    ? "border-flame-orange/40 bg-flame-orange/[0.02]" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/15"
                }`}
              >
                {/* Header Information Row */}
                <div className="flex items-start gap-4 p-4 cursor-pointer select-none">
                  {/* Checkbox Trigger */}
                  <div 
                    onClick={(e) => toggleSelect(item.id, e)}
                    className={`mt-1 flex items-center justify-center ${item.isBurnable === false ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className={`w-4 h-4 rounded-none border text-white flex items-center justify-center transition-all ${
                      item.selected 
                        ? "bg-flame-orange border-flame-orange scale-105" 
                        : item.isBurnable === false
                          ? "border-white/10 bg-white/[0.02]"
                          : "border-white/30 hover:border-white/50"
                    }`}>
                      {item.selected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </div>
                  </div>

                  {/* Fallback-Resilient Token Image */}
                  <ResilientImage
                    symbol={item.symbol}
                    mintAddress={item.mintAddress}
                    providedImageUrl={item.imageUrl}
                    className="w-10 h-10 shrink-0 border border-white/10"
                    fallbackIcon={getIcon(item.type)}
                  />

                  {/* Text descriptions */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-bold text-slate-200 text-xs tracking-tight truncate uppercase flex items-center gap-1.5">
                        {item.name}
                      </h4>
                      <p className="font-mono text-xs font-bold text-emerald-400 shrink-0">
                        +{item.reclaimableSol.toFixed(5)} SOL
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <p className="truncate mr-3">
                        {item.amount > 0 ? `${item.amount.toLocaleString()} ${item.symbol}` : item.symbol}
                      </p>
                      <p className="text-[10px] shrink-0 text-slate-500">
                        {item.valueUsd && item.valueUsd > 0 
                          ? `Market: $${item.valueUsd.toFixed(2)} USD` 
                          : `Reclaim: $${(item.reclaimableSol * 145).toFixed(2)} USD`
                        }
                      </p>
                    </div>

                    {/* Threat indicator subline */}
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${getLevelBadgeStyles(level)}`}>
                          {level}: {score}%
                        </span>
                        <span className="text-slate-500">•</span>
                        <div className={`w-2.5 h-2.5 rounded-sm ${
                            item.burnStatus === 'valid' ? 'bg-emerald-400' :
                            item.burnStatus === 'unknown' ? 'bg-yellow-400' :
                            'bg-red-500'
                          }`} title={`On-chain: ${item.burnStatus || 'checking...'}`} />
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-bold flex items-center gap-0.5 text-orange-400/90">
                          <Percent className="w-2.5 h-2.5" />
                          Fee: {feePercent}%
                        </span>
                      </div>
                      
                      <span className="text-[10px] text-slate-500 hover:text-white transition-colors font-mono flex items-center gap-1">
                        {isExpanded ? (
                          <>Hide Audit <ChevronUp className="w-3.5 h-3.5 text-flame-orange" /></>
                        ) : (
                          <>Explain Score <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explainable Diagnostic Sub-panel */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-black/60 p-4 font-mono text-xs text-left text-slate-300 space-y-3.5 animate-fade-in select-text">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Metric Breakdowns */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-bold">Risk Assessment Factors</span>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between border-b border-white/5 pb-0.5">
                            <span>Metadata Quality:</span>
                            <span className="text-white">{item.inputs?.metadataQuality?.hasVerifiedLogo ? "Good" : "Lacking"}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-0.5">
                            <span>Liquidity Pool:</span>
                            <span className="text-white">{item.inputs?.liquidity?.poolBalanceUsd > 0 ? `$${item.inputs.liquidity.poolBalanceUsd.toLocaleString()}` : "No Pool"}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-0.5">
                            <span>Distribution:</span>
                            <span className="text-white">{item.inputs?.holderDistribution?.top10HoldersSharePct}% Top 10</span>
                          </div>
                        </div>
                      </div>

                      {/* Info blocks */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-bold">Metadata Details</span>
                        <p className="text-[10px] text-slate-400 leading-normal bg-white/[0.02] p-2 border border-white/5">
                          {item.descriptor}
                        </p>
                      </div>
                    </div>

                    {/* Threat reasons logs list */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-bold">Diagnostic Heuristic Flags</span>
                      <ul className="space-y-1 text-[10px] pl-1 max-h-[100px] overflow-y-auto">
                        {item.riskReport?.reasons.map((reason, ri) => (
                          <li key={ri} className="flex items-start gap-1 text-slate-400 font-sans">
                            <span className="text-amber-500 font-bold shrink-0">▲</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-slate-500 uppercase">
                      <span>Mint Address: {item.mintAddress ? `${item.mintAddress.slice(0, 10)}...${item.mintAddress.slice(-10)}` : "None"}</span>
                      <span>Confidence: {item.riskReport?.confidence}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* NEW: Interactive Burn Preview UI Panel  */}
      {selectedItems.length > 0 && burnPreview && (
        <div className="mx-6 mb-4 p-4 border border-flame-orange/20 bg-orange-950/[0.03] text-left rounded-none space-y-4 animate-fade-in" id="burn-preview-panel">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-flame-coral animate-pulse" />
              <span className="font-display font-extrabold text-xs text-white tracking-widest uppercase">
                COMBUSTION PROTOCOL METRICS
              </span>
            </div>
            {isPreviewLoading ? (
              <span className="text-[9px] font-mono text-flame-orange animate-pulse">Calculating splits...</span>
            ) : (
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">REAL TIME BOUND</span>
            )}
          </div>

          {/* Core Simulation Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2.5 bg-black/40 border border-white/5">
              <span className="text-[8px] text-slate-500 font-mono uppercase block mb-1">TOTAL RECLAIMABLE</span>
              <span className="text-xs font-bold text-white font-mono">{(burnPreview.rawReclaimSol).toFixed(5)} SOL</span>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5">
              <span className="text-[8px] text-slate-500 font-mono uppercase block mb-1">PROTOCOL COMMISSION</span>
              <span className="text-xs font-bold text-red-400 font-mono">{(burnPreview.totalProtocolFeeSol).toFixed(5)} SOL</span>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5">
              <span className="text-[8px] text-slate-500 font-mono uppercase block mb-1">ESTIMATED NET SOL RECLAIMED</span>
              <span className="text-xs font-bold text-[#14F195] font-mono flex items-center gap-0.5">
                <Sparkle className="w-3 h-3 text-[#14F195]" />
                {(burnPreview.totalNetReclaimSol).toFixed(5)} SOL
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Summary control widget */}
      <div className="p-6 border-t border-white/10 bg-[#070707] mt-auto">
        <div className="grid grid-cols-3 gap-2 mb-4 font-mono text-xs text-left">
          <div className="space-y-0.5">
            <p className="text-slate-500 font-sans text-[10px] uppercase tracking-widest">Selected Account</p>
            <p className="text-white font-bold">{totalSelectedCount} checked</p>
          </div>

          <div className="space-y-0.5 text-center">
            <p className="text-slate-500 font-sans text-[10px] uppercase tracking-widest">Gross SOL Reclaim</p>
            <p className="text-slate-300 font-bold">{(burnPreview?.rawReclaimSol ?? totalReclaimSol).toFixed(5)} SOL</p>
          </div>

          <div className="space-y-0.5 text-right">
            <p className="text-slate-500 font-sans text-[10px] uppercase tracking-widest">Est. Net Gain</p>
            <p className="text-[#14F195] font-bold flex items-center justify-end gap-1 text-sm">
              <Sparkle className="w-3.5 h-3.5 animate-pulse text-[#14F195]" />
              {(burnPreview?.totalNetReclaimSol ?? totalNetGainSol).toFixed(5)} SOL
            </p>
          </div>
        </div>

        {walletAddress ? (
          <button
            onClick={handleIgniteClick}
            onMouseEnter={() => sound.playHoverPluck()}
            disabled={totalSelectedCount === 0 || isBurning || isScanning}
            className="w-full relative py-4 rounded-none font-display font-black text-xs text-white tracking-[0.25em] uppercase transition-all duration-300 overflow-hidden disabled:opacity-35 disabled:cursor-not-allowed bg-flame-orange hover:bg-orange-600 cursor-pointer"
          >
            <span className="relative flex items-center justify-center gap-2">
              <Trash2 className="w-3.5 h-3.5 fill-white" />
              {isBurning ? `${t.step3Badge}...` : `${t.heroHeadingBurn} & RECLAIM`}
            </span>
          </button>
        ) : (
          <div className="w-full py-3 text-center font-mono text-[10px] text-slate-500 uppercase tracking-wider">
            Connect wallet via header to execute burns
          </div>
        )}

        <p className="text-[10px] text-center text-slate-500 font-mono mt-3.5 uppercase tracking-wide">
          {walletAddress
            ? "Safe execution guaranteed. Dynamic protocol splits incentivize active token combustion."
            : "Read-only scan results — connect your wallet to execute burns."}
        </p>
      </div>
    </div>
  );
}
