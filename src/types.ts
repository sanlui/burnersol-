export interface AdvancedRiskDetails {
  score: number;
  confidence: number;
  level: "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "SCAM";
  reasons: string[];
}

export interface TrashItem {
  id: string;
  name: string;
  symbol: string;
  type: "token" | "nft" | "lp" | "account";
  amount: number;
  decimals?: number;
  valueUsd: number;
  reclaimableSol: number;
  imageUrl?: string;
  isScam?: boolean;
  isBurnable?: boolean;
  descriptor?: string;
  selected?: boolean;
  mintAddress?: string;
  programId?: string;
  riskReport?: AdvancedRiskDetails;
  metadataSource?: "helius" | "rpc" | "local";
  inputs?: {
    metadataQuality?: {
      hasVerifiedLogo?: boolean;
      hasProperDescription?: boolean;
      hasWebsiteLink?: boolean;
      isClonedOfficialName?: boolean;
    };
    liquidity?: {
      poolBalanceUsd?: number;
      hasActiveAmmPool?: boolean;
      hasSellLiquidityLocked?: boolean;
    };
    holderDistribution?: {
      top10HoldersSharePct?: number;
      isCreatorHoldingAllTokens?: boolean;
      numberOfActiveHolders?: number;
    };
    tokenAge?: {
      daysSinceCreation?: number;
    };
    behavioralSignals?: {
      hasInjectedAirdropMemo?: boolean;
      hasWalletDrainingHistory?: boolean;
      isTransferDisabled?: boolean;
    };
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface BurnTransaction {
  id: string;
  timestamp: string;
  itemCount: number;
  solReclaimed: number;
  txHash: string;
  status: "success" | "pending";
  walletAddress?: string;
  walletName?: string;
  grossSolReclaimed?: number;
  protocolFeePaid?: number;
  netSolReclaimed?: number;
  rewardsMinted?: number;
  signature?: string;
  source?: "on-chain" | "local-session";
  itemDetails?: {
    id: string;
    name: string;
    symbol: string;
    type: TrashItem["type"];
    amount: number;
    reclaimableSol: number;
    mintAddress?: string;
    programId?: string;
    isScam?: boolean;
    riskLevel?: AdvancedRiskDetails["level"];
    riskScore?: number;
  }[];
}

export interface TokenStats {
  priceUsd: number;
  priceSol: number;
  priceChange24h: number;
  marketCapUsd: number;
  volume24hUsd: number;
  totalBurned: number;
  circulatingSupply: number;
  totalSupply: number;
}
