/**
 * BurnerSol - Advanced Risk Engine & Smart Dynamic Fee Protocol
 * Type-definitions, configurable weights, heuristic classifications, and fee utility.
 */

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

export interface AdvancedRiskReport {
  score: number; // 0 - 100
  confidence: number; // 0 - 100
  level: "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "SCAM";
  reasons: string[];
}

// Configurable weights as mandated by Phase 1 Requirements
export const RISK_WEIGHTS = {
  metadataWeight: 25,
  liquidityWeight: 35,
  holderWeight: 20,
  ageWeight: 10,
  behaviorWeight: 10,
};

/**
 * Calculates a fully explained and weighted risk report for a given asset.
 * Includes complete security schema guarding, input sanitization, confidence degradation,
 * and automatic unsafe classifications for incomplete telemetry.
 */
export function evaluateAssetRisk(
  name: string,
  symbol: string,
  inputs: RiskCategoryInputs,
  livePriceUsd?: number
): AdvancedRiskReport {
  const reasons: string[] = [];
  let confidence = 85; // Default baseline assessment confidence
  
  // Security Guard: Handle entirely missing or null input payload gracefully (Never Trust Missing Data)
  if (!inputs) {
    return {
      score: 95,
      confidence: 30, // Highly degraded confidence due to telemetry absence
      level: "SCAM",
      reasons: ["Security Warning: Data telemetry is missing completely. Flagged as SCAM under defensive rules."]
    };
  }

  // Ensure robust fallback instantiation for all nested structures to avert runtime undefined crashes
  const metadataQuality = inputs.metadataQuality || { hasVerifiedLogo: false, hasProperDescription: false, hasWebsiteLink: false, isClonedOfficialName: true };
  const liquidity = inputs.liquidity || { poolBalanceUsd: 0, hasActiveAmmPool: false, hasSellLiquidityLocked: false };
  const holderDistribution = inputs.holderDistribution || { top10HoldersSharePct: 100, isCreatorHoldingAllTokens: true, numberOfActiveHolders: 0 };
  const tokenAge = inputs.tokenAge || { daysSinceCreation: 0 };
  const behavioralSignals = inputs.behavioralSignals || { hasInjectedAirdropMemo: true, hasWalletDrainingHistory: true, isTransferDisabled: true };

  // Detect missing critical data structures (Degrade confidence and elevate risk score default)
  if (!inputs.metadataQuality || !inputs.liquidity || !inputs.holderDistribution || !inputs.tokenAge || !inputs.behavioralSignals) {
    confidence = Math.max(10, confidence - 40);
    reasons.push("Telemetry payload is incomplete or malformed (degraded confidence rating)");
  }

  // Detect fake/spoofed symbols & suspicious phishing URLs (e.g., claiming official links in metadata)
  const isSpoofedSpoof = (symbol || "").toUpperCase().includes("CLAIM") || 
                         (name || "").toUpperCase().includes("GIFT") || 
                         (symbol || "").toUpperCase().includes(".NET") || 
                         (symbol || "").toUpperCase().includes(".ORG");

  // Risk component scores: 0 (Safe) to 100 (Scam/Extreme Danger)
  
  // 1. Metadata Quality Score (Weight: 25)
  let metadataScore = 0;
  if (!metadataQuality.hasVerifiedLogo) {
    metadataScore += 40;
    reasons.push("No verified logo found in token registry");
  }
  if (!metadataQuality.hasProperDescription) {
    metadataScore += 30;
    reasons.push("Incomplete description or lacking basic on-chain details");
  }
  if (!metadataQuality.hasWebsiteLink) {
    metadataScore += 20;
    reasons.push("Missing official website or developer social handles");
  }
  if (metadataQuality.isClonedOfficialName || isSpoofedSpoof) {
    metadataScore += 65;
    reasons.push("Suspiciously replicates name / metadata of trusted protocols (Phishing Spoof)");
  }
  metadataScore = Math.min(100, metadataScore);

  // 2. Liquidity Score (Weight: 35)
  let liquidityScore = 0;
  // Guard against NaN/Infinity in poolBalanceUsd
  const poolValUnclamped = liquidity.poolBalanceUsd;
  const poolVal = (typeof poolValUnclamped !== "number" || isNaN(poolValUnclamped) || !isFinite(poolValUnclamped)) 
    ? 0 
    : Math.max(0, poolValUnclamped);

  if (!liquidity.hasActiveAmmPool) {
    liquidityScore = 100;
    reasons.push("Absence of public liquidity pools on standard AMMs");
  } else if (poolVal === 0) {
    liquidityScore = 100;
    reasons.push("Empty liquidity contract. Extreme honeypot risk");
  } else if (poolVal < 500) {
    liquidityScore = 80;
    reasons.push(`Low liquidity detected: $${poolVal.toFixed(0)} usd`);
  } else if (poolVal < 5000) {
    liquidityScore = 50;
    reasons.push("Moderate liquidity pool depth requires high slippage");
  }
  if (!liquidity.hasSellLiquidityLocked && liquidity.hasActiveAmmPool) {
    liquidityScore += 15;
    reasons.push("Developer liquidity pool is unlocked and ruggable");
  }
  liquidityScore = Math.min(100, Math.max(0, liquidityScore));

  // 3. Holder Distribution Score (Weight: 20)
  let holderScore = 0;
  // Guard against NaN / undefined holder stats
  const topPctUnclamped = holderDistribution.top10HoldersSharePct;
  const topPct = (typeof topPctUnclamped !== "number" || isNaN(topPctUnclamped) || !isFinite(topPctUnclamped))
    ? 100
    : Math.min(100, Math.max(0, topPctUnclamped));

  if (holderDistribution.isCreatorHoldingAllTokens) {
    holderScore = 100;
    reasons.push("Creator holds 100% of supply allocation");
  } else if (topPct > 80) {
    holderScore = 80;
    reasons.push(`Top 10 holders control over ${topPct}% of the outstanding supply`);
  } else if (topPct > 50) {
    holderScore = 50;
    reasons.push(`Significant holder concentration: top 10 owns ${topPct}%`);
  }
  
  const numHolders = holderDistribution.numberOfActiveHolders || 0;
  if (numHolders < 12) {
    holderScore += 15;
    reasons.push("Very inactive community ledger; extremely low holder count");
  }
  holderScore = Math.min(100, Math.max(0, holderScore));

  // 4. Token Age Score (Weight: 10)
  let ageScore = 0;
  const daysRaw = tokenAge.daysSinceCreation;
  const days = (typeof daysRaw !== "number" || isNaN(daysRaw) || !isFinite(daysRaw)) ? 0 : Math.max(0, daysRaw);
  if (days < 2) {
    ageScore = 100;
    reasons.push("Token created within the past 48 hours");
  } else if (days < 7) {
    ageScore = 60;
    reasons.push("Freshly deployed address (less than 1 week old)");
  } else if (days < 30) {
    ageScore = 20;
  }
  ageScore = Math.min(100, Math.max(0, ageScore));

  // 5. Behavioral Signals Score (Weight: 10)
  let behaviorScore = 0;
  if (behavioralSignals.hasInjectedAirdropMemo) {
    behaviorScore += 80;
    reasons.push("Airdropped memo contains phishing claims redirecting outside Solana");
  }
  if (behavioralSignals.hasWalletDrainingHistory) {
    behaviorScore += 100;
    reasons.push("Linked to verified transaction signature drain exploits");
  }
  if (behavioralSignals.isTransferDisabled) {
    behaviorScore += 90;
    reasons.push("Smart contract freeze-authority is active");
  }
  behaviorScore = Math.min(100, Math.max(0, behaviorScore));

  // Compute final weighted risk score
  let rawScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (metadataScore * RISK_WEIGHTS.metadataWeight +
          liquidityScore * RISK_WEIGHTS.liquidityWeight +
          holderScore * RISK_WEIGHTS.holderWeight +
          ageScore * RISK_WEIGHTS.ageWeight +
          behaviorScore * RISK_WEIGHTS.behaviorWeight) /
          100
      )
    )
  );

  // Apply real-time market pricing discounts & verified checks
  let finalScore = rawScore;
  if (livePriceUsd && livePriceUsd > 0) {
    let discount = 0;
    if (livePriceUsd > 10) {
      discount = 35;
      reasons.unshift(`Active institutional-grade assets pricing validated ($${livePriceUsd.toFixed(2)})`);
    } else if (livePriceUsd > 0.01) {
      discount = 20;
      reasons.unshift(`Verified active trading market price detected ($${livePriceUsd.toFixed(3)})`);
    } else {
      discount = 12;
      reasons.unshift(`Jupiter Router lists active market volume for asset`);
    }
    finalScore = Math.max(0, rawScore - discount);
    confidence = Math.min(98, confidence + 8);
  }

  // Classify level based on market-enriched score
  let level: "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "SCAM";
  if (finalScore < 30) {
    level = "SAFE";
  } else if (finalScore < 60) {
    level = "SUSPICIOUS";
  } else if (finalScore < 80) {
    level = "HIGH_RISK";
  } else {
    level = "SCAM";
  }

  // Adjust confidence slightly if metadata or transaction history correlates highly
  if (reasons.length > 3) {
    confidence = Math.min(99, confidence + 10);
  } else if (reasons.length === 0) {
    confidence = 95;
  }

  return {
    score: finalScore,
    confidence,
    level,
    reasons: reasons.length > 0 ? reasons : ["No anomalous threat patterns detected"],
  };
}

import { TrashItem } from "../types";
import { getSmartDynamicFeePercentSecure } from "./fees";

/**
 * Determines if an asset is safely burnable based on risk, value, and type.
 * Conservative: an asset is NOT burnable by default.
 * Only burnable when it is provably safe to close/destroy.
 */
export function determineBurnability(item: TrashItem): boolean {
  // Empty token accounts are always safe to close
  if (item.type === "account") return true;

  // NFTs are NEVER burnable (irreversible, may have unseen value)
  if (item.type === "nft") return false;

  // LP tokens are NEVER burnable (may have locked value)
  if (item.type === "lp") return false;

  // Regular tokens are burnable ONLY if explicitly flagged as scam/high-risk
  if (item.type === "token") {
    if (item.isScam) return true;
    if (item.riskReport?.level === "SCAM" || item.riskReport?.level === "HIGH_RISK") return true;
  }

  // Everything else is protected
  return false;
}

/**
 * Calculates the dynamic reclaim fee percent based on the spam/risk score.
 * Security hardened to prevent input exploits or invalid fee states.
 */
export function getSmartDynamicFeePercent(spamScore: number): number {
  return getSmartDynamicFeePercentSecure(spamScore);
}

/**
 * Clean simulation defaults helper to generate inputs from item characteristics
 */
export function getSimulatedInfo(name: string, symbol: string, isScamFlag: boolean): RiskCategoryInputs {
  const isScam = isScamFlag || symbol.includes("CLAIM") || name.toLowerCase().includes("free");
  return {
    metadataQuality: {
      hasVerifiedLogo: !isScam,
      hasProperDescription: !isScam,
      hasWebsiteLink: !isScam,
      isClonedOfficialName: isScam && (name.includes("JUPITER") || name.includes("SOLANA")),
    },
    liquidity: {
      poolBalanceUsd: isScam ? 0 : 12500,
      hasActiveAmmPool: !isScam,
      hasSellLiquidityLocked: !isScam,
    },
    holderDistribution: {
      top10HoldersSharePct: isScam ? 95 : 42,
      isCreatorHoldingAllTokens: isScam,
      numberOfActiveHolders: isScam ? 3 : 1580,
    },
    tokenAge: {
      daysSinceCreation: isScam ? 1 : 240,
    },
    behavioralSignals: {
      hasInjectedAirdropMemo: isScam,
      hasWalletDrainingHistory: isScam && symbol.includes("GIFT"),
      isTransferDisabled: false,
    },
  };
}
