export interface TokenomicsConfig {
  buybackPercent: number;
  stakingPercent: number;
  treasuryPercent: number;
  insurancePercent: number;
  protocolPercent: number;
  totalSupply: number;
  circulatingSupply: number;
  rewardReserve: number;
  burnReserve: number;
  liquidityReserve: number;
  treasuryReserve: number;
  teamReserve: number;
  ecosystemReserve: number;
  maxProtocolFeePercent: number;
  defaultProtocolFeePercent: number;
  rewardTokensPerSolFee: number;
  maxRewardTokensPerBurn: number;
  dailyRewardBudget: number;
}

export interface TokenAllocation {
  key: string;
  label: string;
  percent: number;
  amount: number;
  unlock: string;
  purpose: string;
}

export interface RevenueAllocation {
  key: string;
  label: string;
  percent: number;
  purpose: string;
}

export interface RewardGrantInput {
  protocolFeeSol: number;
  accountsClosed: number;
  remainingRewardReserve?: number;
  epochRemainingBudget?: number;
  rewardTokensPerSolFee?: number;
}

export interface RewardGrant {
  tokens: number;
  capped: boolean;
  source: "fixed_community_reward_reserve";
  reason: string;
}

export interface StakingPool {
  totalStaked: number;
  apy: number;
  rewardRate: number;
  userStaked: number;
  pendingRewards: number;
  lastClaimTime: string;
}

export interface BuybackEvent {
  id: string;
  timestamp: string;
  solSpent: number;
  tokensRepurchased: number;
  priceImpact: number;
  txHash: string;
}

export interface ProtocolRevenue {
  totalCollected: number;
  buybackTotal: number;
  stakingTotal: number;
  treasuryTotal: number;
  insuranceTotal: number;
  buybacks: BuybackEvent[];
}

export const TOKEN_STATUS = {
  phase: "PRE_LAUNCH",
  mintCreated: false,
  launchCirculatingSupply: 0,
  requiresMintAuthorityRevocation: true,
  requiresFreezeAuthorityRevocation: true,
} as const;

export const BURNER_CONFIG: TokenomicsConfig = {
  buybackPercent: 50,
  stakingPercent: 25,
  treasuryPercent: 15,
  insurancePercent: 10,
  protocolPercent: 15,
  totalSupply: 100_000_000,
  circulatingSupply: 0,
  rewardReserve: 40_000_000,
  burnReserve: 40_000_000,
  liquidityReserve: 25_000_000,
  treasuryReserve: 15_000_000,
  teamReserve: 10_000_000,
  ecosystemReserve: 10_000_000,
  maxProtocolFeePercent: 15,
  defaultProtocolFeePercent: 8,
  rewardTokensPerSolFee: 10_000,
  maxRewardTokensPerBurn: 500,
  dailyRewardBudget: 75_000,
};

export const TOKEN_ALLOCATION: TokenAllocation[] = [
  {
    key: "community_rewards",
    label: "Community rewards reserve",
    percent: 40,
    amount: BURNER_CONFIG.rewardReserve,
    unlock: "Earned only through protocol activity; capped by epoch budget",
    purpose: "Funds user rewards without creating unlimited emissions.",
  },
  {
    key: "liquidity",
    label: "Liquidity and market depth",
    percent: 25,
    amount: BURNER_CONFIG.liquidityReserve,
    unlock: "DEX liquidity lock or documented market-making policy required before launch",
    purpose: "Supports orderly trading and reduces launch volatility.",
  },
  {
    key: "treasury",
    label: "Operations treasury",
    percent: 15,
    amount: BURNER_CONFIG.treasuryReserve,
    unlock: "Multi-sig, milestone based",
    purpose: "RPC infrastructure, audits, maintenance, legal and growth.",
  },
  {
    key: "team",
    label: "Team vesting",
    percent: 10,
    amount: BURNER_CONFIG.teamReserve,
    unlock: "12 month cliff, then 36 month linear vesting",
    purpose: "Long-term builder alignment, not immediate liquidity.",
  },
  {
    key: "ecosystem",
    label: "Ecosystem and security",
    percent: 10,
    amount: BURNER_CONFIG.ecosystemReserve,
    unlock: "Governed grants, security programs and partnerships",
    purpose: "Audits, bug bounties, integrations and strategic incentives.",
  },
];

export const REVENUE_ALLOCATION: RevenueAllocation[] = [
  { key: "buyback", label: "Buyback and liquidity support", percent: 50, purpose: "Uses real protocol revenue only; no guaranteed market outcome." },
  { key: "staking", label: "User and staker rewards vault", percent: 25, purpose: "SOL rewards accrue only when fees are actually collected." },
  { key: "treasury", label: "Operations treasury", percent: 15, purpose: "Pays infrastructure, audits, support and product development." },
  { key: "insurance", label: "Security reserve", percent: 10, purpose: "Reserved for incident response and user-protection programs." },
];

export type BurnUtilityTierId = "standard" | "holder" | "pro" | "power";

export interface BurnUtilityTier {
  id: BurnUtilityTierId;
  label: string;
  feePercent: number;
  requiredLiquidOrLockedBurn: number;
  requiredLockedBurn: number;
  requiredRealUsageCount: number;
  maxDiscountSolPerCleanup?: number;
}

export interface BurnUtilityInput {
  liquidBurnBalance: number;
  lockedBurnBalance: number;
  realUsageCount: number;
  burnToBoost: boolean;
  accountsClosed: number;
}

export interface BurnUtilityFeeQuote {
  tier: BurnUtilityTier;
  standardFeePercent: number;
  effectiveFeePercent: number;
  feeSol: number;
  netReclaimSol: number;
  burnToBoostApplied: boolean;
  burnToBoostCostTokens: number;
  burnToBoostDiscountSol: number;
  antiAbuseCapApplied: boolean;
  boostUnavailableReason?: string;
}

export const BURN_UTILITY_TIERS: BurnUtilityTier[] = [
  {
    id: "standard",
    label: "Standard",
    feePercent: 8,
    requiredLiquidOrLockedBurn: 0,
    requiredLockedBurn: 0,
    requiredRealUsageCount: 0,
  },
  {
    id: "holder",
    label: "Holder BURN",
    feePercent: 6,
    requiredLiquidOrLockedBurn: 1_000,
    requiredLockedBurn: 0,
    requiredRealUsageCount: 0,
  },
  {
    id: "pro",
    label: "Holder Pro",
    feePercent: 4,
    requiredLiquidOrLockedBurn: 0,
    requiredLockedBurn: 10_000,
    requiredRealUsageCount: 0,
  },
  {
    id: "power",
    label: "Power user",
    feePercent: 2,
    requiredLiquidOrLockedBurn: 0,
    requiredLockedBurn: 50_000,
    requiredRealUsageCount: 25,
    maxDiscountSolPerCleanup: 0.02,
  },
];

export const BURN_TO_BOOST_CONFIG = {
  costTokens: 250,
  discountPercentPoints: 1,
  minFeePercent: 2,
  maxDiscountSolPerCleanup: 0.01,
} as const;

function safeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function getBurnUtilityTier(input: Pick<BurnUtilityInput, "liquidBurnBalance" | "lockedBurnBalance" | "realUsageCount">): BurnUtilityTier {
  const liquid = safeAmount(input.liquidBurnBalance);
  const locked = safeAmount(input.lockedBurnBalance);
  const total = liquid + locked;
  const usage = Math.max(0, Math.floor(safeAmount(input.realUsageCount)));

  for (const tier of [...BURN_UTILITY_TIERS].reverse()) {
    if (
      total >= tier.requiredLiquidOrLockedBurn &&
      locked >= tier.requiredLockedBurn &&
      usage >= tier.requiredRealUsageCount
    ) {
      return tier;
    }
  }

  return BURN_UTILITY_TIERS[0];
}

export function calculateBurnUtilityFee(rawReclaimSol: number, input: BurnUtilityInput): BurnUtilityFeeQuote {
  const raw = safeAmount(rawReclaimSol);
  const tier = getBurnUtilityTier(input);
  const standardFeePercent = BURNER_CONFIG.defaultProtocolFeePercent;
  const standardFeeSol = (raw * standardFeePercent) / 100;
  let effectiveFeePercent = tier.feePercent;
  let feeSol = (raw * effectiveFeePercent) / 100;
  let antiAbuseCapApplied = false;

  if (tier.maxDiscountSolPerCleanup && raw > 0) {
    const tierDiscountSol = Math.max(0, standardFeeSol - feeSol);
    if (tierDiscountSol > tier.maxDiscountSolPerCleanup) {
      feeSol = Math.max(0, standardFeeSol - tier.maxDiscountSolPerCleanup);
      effectiveFeePercent = raw > 0 ? (feeSol / raw) * 100 : tier.feePercent;
      antiAbuseCapApplied = true;
    }
  }

  let burnToBoostApplied = false;
  let burnToBoostCostTokens = 0;
  let burnToBoostDiscountSol = 0;
  let boostUnavailableReason: string | undefined;
  const hasBoostBalance = safeAmount(input.liquidBurnBalance) >= BURN_TO_BOOST_CONFIG.costTokens;
  const canApplyBoost = Boolean(input.burnToBoost) && input.accountsClosed > 0 && hasBoostBalance;

  if (input.burnToBoost && !hasBoostBalance) {
    boostUnavailableReason = `Burn To Boost requires ${BURN_TO_BOOST_CONFIG.costTokens.toLocaleString()} liquid BURN.`;
  }

  if (canApplyBoost) {
    const boostedPercent = Math.max(
      BURN_TO_BOOST_CONFIG.minFeePercent,
      effectiveFeePercent - BURN_TO_BOOST_CONFIG.discountPercentPoints
    );

    if (raw === 0) {
      effectiveFeePercent = boostedPercent;
      burnToBoostApplied = true;
      burnToBoostCostTokens = BURN_TO_BOOST_CONFIG.costTokens;
    } else {
      const boostedFeeSol = (raw * boostedPercent) / 100;
      burnToBoostDiscountSol = Math.min(
        Math.max(0, feeSol - boostedFeeSol),
        BURN_TO_BOOST_CONFIG.maxDiscountSolPerCleanup
      );
      if (burnToBoostDiscountSol > 0) {
        feeSol = Math.max(0, feeSol - burnToBoostDiscountSol);
        effectiveFeePercent = raw > 0 ? (feeSol / raw) * 100 : boostedPercent;
        burnToBoostApplied = true;
        burnToBoostCostTokens = BURN_TO_BOOST_CONFIG.costTokens;
      }
    }
  }

  return {
    tier,
    standardFeePercent,
    effectiveFeePercent,
    feeSol,
    netReclaimSol: Math.max(0, raw - feeSol),
    burnToBoostApplied,
    burnToBoostCostTokens,
    burnToBoostDiscountSol,
    antiAbuseCapApplied,
    boostUnavailableReason,
  };
}

export const STAKING_APY_BASE = 0;
export const MIN_STAKE_AMOUNT = 1000;
export const REWARD_EPOCH_SECONDS = 2 * 24 * 60 * 60;

export function calculateFixedAllocations(): TokenAllocation[] {
  return TOKEN_ALLOCATION;
}

export function calculateProtocolRevenueSplit(totalSolFee: number): {
  buyback: number;
  staking: number;
  treasury: number;
  insurance: number;
} {
  return {
    buyback: (totalSolFee * BURNER_CONFIG.buybackPercent) / 100,
    staking: (totalSolFee * BURNER_CONFIG.stakingPercent) / 100,
    treasury: (totalSolFee * BURNER_CONFIG.treasuryPercent) / 100,
    insurance: (totalSolFee * BURNER_CONFIG.insurancePercent) / 100,
  };
}

export function distributeFee(totalSolFee: number): {
  buyback: number;
  staking: number;
  treasury: number;
  insurance: number;
} {
  return calculateProtocolRevenueSplit(totalSolFee);
}

export function calculateRewardGrant({
  protocolFeeSol,
  accountsClosed,
  remainingRewardReserve = BURNER_CONFIG.rewardReserve,
  epochRemainingBudget = BURNER_CONFIG.dailyRewardBudget,
  rewardTokensPerSolFee = BURNER_CONFIG.rewardTokensPerSolFee,
}: RewardGrantInput): RewardGrant {
  const safeFee = Math.max(0, Number.isFinite(protocolFeeSol) ? protocolFeeSol : 0);
  const safeAccounts = Math.max(0, Math.floor(Number.isFinite(accountsClosed) ? accountsClosed : 0));
  const feeBasedReward = safeFee * rewardTokensPerSolFee;
  const accountActivityCap = safeAccounts * 75;
  const requested = Math.min(feeBasedReward, accountActivityCap, BURNER_CONFIG.maxRewardTokensPerBurn);
  const tokens = Math.floor(Math.max(0, Math.min(requested, remainingRewardReserve, epochRemainingBudget)));

  return {
    tokens,
    capped: tokens < Math.floor(requested),
    source: "fixed_community_reward_reserve",
    reason: tokens > 0
      ? "Reward funded from the fixed community reserve. No new supply is minted."
      : "No reward generated because the fee, reserve or epoch budget is zero.",
  };
}

export function validateTokenomicsConfig(): string[] {
  const issues: string[] = [];
  const allocationTotal = TOKEN_ALLOCATION.reduce((sum, item) => sum + item.percent, 0);
  const revenueTotal = REVENUE_ALLOCATION.reduce((sum, item) => sum + item.percent, 0);
  const reserveTotal = BURNER_CONFIG.rewardReserve + BURNER_CONFIG.liquidityReserve + BURNER_CONFIG.treasuryReserve + BURNER_CONFIG.teamReserve + BURNER_CONFIG.ecosystemReserve;

  if (allocationTotal !== 100) issues.push(`Token allocation totals ${allocationTotal}%, expected 100%.`);
  if (revenueTotal !== 100) issues.push(`Revenue allocation totals ${revenueTotal}%, expected 100%.`);
  if (BURNER_CONFIG.circulatingSupply !== 0) issues.push("Pre-launch circulating supply must remain zero until the token is created.");
  if (BURNER_CONFIG.defaultProtocolFeePercent > BURNER_CONFIG.maxProtocolFeePercent) issues.push("Default protocol fee exceeds the hard cap.");
  if (BURN_UTILITY_TIERS[0].feePercent !== BURNER_CONFIG.defaultProtocolFeePercent) issues.push("Standard utility fee must match the default protocol fee.");
  if (BURN_UTILITY_TIERS.some((tier) => tier.feePercent < BURN_TO_BOOST_CONFIG.minFeePercent)) issues.push("Utility tier fee is below the Burn To Boost safety floor.");
  if (reserveTotal !== BURNER_CONFIG.totalSupply) issues.push("Reserve amounts do not sum to the fixed total supply.");

  return issues;
}

export function calculateStakingRewards(stakedAmount: number, totalStaked: number, epochRewardPool: number, daysSinceLastClaim: number): number {
  if (totalStaked === 0 || stakedAmount === 0) return 0;
  return (epochRewardPool / 2) * (stakedAmount / totalStaked) * daysSinceLastClaim;
}

export function calculateAPY(totalStaked: number, annualRewardPool: number): number {
  if (totalStaked === 0 || annualRewardPool === 0) return 0;
  return (annualRewardPool / totalStaked) * 100;
}

export function calculateImpermanentLoss(entryPrice: number, currentPrice: number): number {
  if (entryPrice <= 0) return 0;
  return ((currentPrice - entryPrice) / entryPrice) * 100;
}

export function calculateBuybackAmount(solReserve: number, currentPrice: number, slippage: number = 0.5): {
  tokensRepurchased: number;
  effectivePrice: number;
  solCost: number;
} {
  if (currentPrice <= 0 || solReserve <= 0) return { tokensRepurchased: 0, effectivePrice: 0, solCost: 0 };
  const effectivePrice = currentPrice * (1 + slippage / 100);
  return { tokensRepurchased: solReserve / effectivePrice, effectivePrice, solCost: solReserve };
}

export function simulateBuybackImpact(currentSupply: number, buybackAmount: number, totalSupply: number): number {
  if (totalSupply <= 0) return 0;
  const newSupply = Math.max(0, currentSupply - buybackAmount);
  return Math.max(0, ((currentSupply - newSupply) / totalSupply) * 100);
}

export interface ProtocolStats {
  totalBurned: number;
  totalReclaimedSol: number;
  activeWallets: number;
  totalAccountsClosed: number;
  buybackExecuted: number;
  stakingPoolsActive: number;
  averageFeePercent: number;
}

export function simulateProtocolStats(): ProtocolStats {
  return {
    totalBurned: 0,
    totalReclaimedSol: 0,
    activeWallets: 0,
    totalAccountsClosed: 0,
    buybackExecuted: 0,
    stakingPoolsActive: 0,
    averageFeePercent: BURNER_CONFIG.defaultProtocolFeePercent,
  };
}

export function getLocalStakingData(): StakingPool {
  try {
    const data = localStorage.getItem("burner_staking");
    if (data) return JSON.parse(data);
  } catch (e) {}

  return { totalStaked: 0, apy: 0, rewardRate: 0, userStaked: 0, pendingRewards: 0, lastClaimTime: new Date().toISOString() };
}

export function saveLocalStakingData(pool: StakingPool): void {
  localStorage.setItem("burner_staking", JSON.stringify(pool));
}

export function getLocalRevenue(): ProtocolRevenue {
  try {
    const data = localStorage.getItem("burner_revenue");
    if (data) return JSON.parse(data);
  } catch (e) {}

  return { totalCollected: 0, buybackTotal: 0, stakingTotal: 0, treasuryTotal: 0, insuranceTotal: 0, buybacks: [] };
}

export function saveLocalRevenue(rev: ProtocolRevenue): void {
  localStorage.setItem("burner_revenue", JSON.stringify(rev));
}