export type RiskLevel = "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "SCAM";

export type BurnStatus = "valid" | "invalid" | "unknown";

export interface RiskReport {
  score: number;
  confidence: number;
  level: RiskLevel;
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
  riskReport?: RiskReport;
  metadataSource?: "helius" | "rpc" | "local";
  inputs?: RiskCategoryInputs;
  burnStatus?: BurnStatus;
}

export interface RiskCategoryInputs {
  metadataQuality: {
    hasVerifiedLogo: boolean;
    hasProperDescription: boolean;
    hasWebsiteLink: boolean;
    isClonedOfficialName: boolean;
  };
  liquidity: {
    poolBalanceUsd: number;
    hasActiveAmmPool: boolean;
    hasSellLiquidityLocked: boolean;
  };
  holderDistribution: {
    top10HoldersSharePct: number;
    isCreatorHoldingAllTokens: boolean;
    numberOfActiveHolders: number;
  };
  tokenAge: {
    daysSinceCreation: number;
  };
  behavioralSignals: {
    hasInjectedAirdropMemo: boolean;
    hasWalletDrainingHistory: boolean;
    isTransferDisabled: boolean;
  };
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
  itemDetails?: BurnTransactionItem[];
}

export interface BurnTransactionItem {
  id: string;
  name: string;
  symbol: string;
  type: TrashItem["type"];
  amount: number;
  reclaimableSol: number;
  mintAddress?: string;
  programId?: string;
  isScam?: boolean;
  riskLevel?: RiskLevel;
  riskScore?: number;
}
