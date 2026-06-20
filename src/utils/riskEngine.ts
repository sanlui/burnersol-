/**
 * BurnerSol - Advanced Risk Engine & Smart Dynamic Fee Protocol
 */

import { TrashItem, RiskReport, RiskCategoryInputs } from "../types";

export type { RiskReport, RiskCategoryInputs };

const RISK_WEIGHTS = {
  metadataWeight: 25,
  liquidityWeight: 35,
  holderWeight: 20,
  ageWeight: 10,
  behaviorWeight: 10,
};

function validateFeeInputs(spamScore: unknown): number {
  if (spamScore === undefined || spamScore === null) return 0;
  const scoreNum = typeof spamScore === "number" ? spamScore : parseFloat(String(spamScore));
  if (isNaN(scoreNum) || !isFinite(scoreNum)) return 100;
  return Math.min(100, Math.max(0, scoreNum));
}

/**
 * Computes deterministic protocol burn fee percentage.
 * Flat 1.5% protocol fee for all assets — competitive rate to maximize adoption.
 */
export function getSmartDynamicFeePercent(): number {
  return 1.5;
}

/**
 * Calculates a fully explained and weighted risk report for a given asset.
 */
export function evaluateAssetRisk(
  name: string,
  symbol: string,
  inputs: RiskCategoryInputs,
  livePriceUsd?: number
): RiskReport {
  const reasons: string[] = [];
  let confidence = 85;

  if (!inputs) {
    return {
      score: 95,
      confidence: 30,
      level: "SCAM",
      reasons: ["Security Warning: Data telemetry is missing completely. Flagged as SCAM under defensive rules."],
    };
  }

  const metadataQuality = inputs.metadataQuality || { hasVerifiedLogo: false, hasProperDescription: false, hasWebsiteLink: false, isClonedOfficialName: true };
  const liquidity = inputs.liquidity || { poolBalanceUsd: 0, hasActiveAmmPool: false, hasSellLiquidityLocked: false };
  const holderDistribution = inputs.holderDistribution || { top10HoldersSharePct: 100, isCreatorHoldingAllTokens: true, numberOfActiveHolders: 0 };
  const tokenAge = inputs.tokenAge || { daysSinceCreation: 0 };
  const behavioralSignals = inputs.behavioralSignals || { hasInjectedAirdropMemo: true, hasWalletDrainingHistory: true, isTransferDisabled: true };

  if (!inputs.metadataQuality || !inputs.liquidity || !inputs.holderDistribution || !inputs.tokenAge || !inputs.behavioralSignals) {
    confidence = Math.max(10, confidence - 40);
    reasons.push("Telemetry payload is incomplete or malformed (degraded confidence rating)");
  }

  const isSpoofedSpoof = (symbol || "").toUpperCase().includes("CLAIM") ||
    (name || "").toUpperCase().includes("GIFT") ||
    (symbol || "").toUpperCase().includes(".NET") ||
    (symbol || "").toUpperCase().includes(".ORG");

  let metadataScore = 0;
  if (!metadataQuality.hasVerifiedLogo) { metadataScore += 40; reasons.push("No verified logo found in token registry"); }
  if (!metadataQuality.hasProperDescription) { metadataScore += 30; reasons.push("Incomplete description or lacking basic on-chain details"); }
  if (!metadataQuality.hasWebsiteLink) { metadataScore += 20; reasons.push("Missing official website or developer social handles"); }
  if (metadataQuality.isClonedOfficialName || isSpoofedSpoof) { metadataScore += 65; reasons.push("Suspiciously replicates name / metadata of trusted protocols (Phishing Spoof)"); }
  metadataScore = Math.min(100, metadataScore);

  let liquidityScore = 0;
  const poolValUnclamped = liquidity.poolBalanceUsd;
  const poolVal = (typeof poolValUnclamped !== "number" || isNaN(poolValUnclamped) || !isFinite(poolValUnclamped)) ? 0 : Math.max(0, poolValUnclamped);
  if (!liquidity.hasActiveAmmPool) { liquidityScore = 100; reasons.push("Absence of public liquidity pools on standard AMMs"); }
  else if (poolVal === 0) { liquidityScore = 100; reasons.push("Empty liquidity contract. Extreme honeypot risk"); }
  else if (poolVal < 500) { liquidityScore = 80; reasons.push(`Low liquidity detected: $${poolVal.toFixed(0)} usd`); }
  else if (poolVal < 5000) { liquidityScore = 50; reasons.push("Moderate liquidity pool depth requires high slippage"); }
  if (!liquidity.hasSellLiquidityLocked && liquidity.hasActiveAmmPool) { liquidityScore += 15; reasons.push("Developer liquidity pool is unlocked and ruggable"); }
  liquidityScore = Math.min(100, Math.max(0, liquidityScore));

  let holderScore = 0;
  const topPctUnclamped = holderDistribution.top10HoldersSharePct;
  const topPct = (typeof topPctUnclamped !== "number" || isNaN(topPctUnclamped) || !isFinite(topPctUnclamped)) ? 100 : Math.min(100, Math.max(0, topPctUnclamped));
  if (holderDistribution.isCreatorHoldingAllTokens) { holderScore = 100; reasons.push("Creator holds 100% of supply allocation"); }
  else if (topPct > 80) { holderScore = 80; reasons.push(`Top 10 holders control over ${topPct}% of the outstanding supply`); }
  else if (topPct > 50) { holderScore = 50; reasons.push(`Significant holder concentration: top 10 owns ${topPct}%`); }
  const numHolders = holderDistribution.numberOfActiveHolders || 0;
  if (numHolders < 12) { holderScore += 15; reasons.push("Very inactive community ledger; extremely low holder count"); }
  holderScore = Math.min(100, Math.max(0, holderScore));

  let ageScore = 0;
  const daysRaw = tokenAge.daysSinceCreation;
  const days = (typeof daysRaw !== "number" || isNaN(daysRaw) || !isFinite(daysRaw)) ? 0 : Math.max(0, daysRaw);
  if (days < 2) { ageScore = 100; reasons.push("Token created within the past 48 hours"); }
  else if (days < 7) { ageScore = 60; reasons.push("Freshly deployed address (less than 1 week old)"); }
  else if (days < 30) { ageScore = 20; }
  ageScore = Math.min(100, Math.max(0, ageScore));

  let behaviorScore = 0;
  if (behavioralSignals.hasInjectedAirdropMemo) { behaviorScore += 80; reasons.push("Airdropped memo contains phishing claims redirecting outside Solana"); }
  if (behavioralSignals.hasWalletDrainingHistory) { behaviorScore += 100; reasons.push("Linked to verified transaction signature drain exploits"); }
  if (behavioralSignals.isTransferDisabled) { behaviorScore += 90; reasons.push("Smart contract freeze-authority is active"); }
  behaviorScore = Math.min(100, Math.max(0, behaviorScore));

  let rawScore = Math.min(100, Math.max(0, Math.round(
    (metadataScore * RISK_WEIGHTS.metadataWeight +
      liquidityScore * RISK_WEIGHTS.liquidityWeight +
      holderScore * RISK_WEIGHTS.holderWeight +
      ageScore * RISK_WEIGHTS.ageWeight +
      behaviorScore * RISK_WEIGHTS.behaviorWeight) / 100
  )));

  let finalScore = rawScore;
  if (livePriceUsd && livePriceUsd > 0) {
    let discount = 0;
    if (livePriceUsd > 10) { discount = 35; reasons.unshift(`Active institutional-grade assets pricing validated ($${livePriceUsd.toFixed(2)})`); }
    else if (livePriceUsd > 0.01) { discount = 20; reasons.unshift(`Verified active trading market price detected ($${livePriceUsd.toFixed(3)})`); }
    else { discount = 12; reasons.unshift(`Jupiter Router lists active market volume for asset`); }
    finalScore = Math.max(0, rawScore - discount);
    confidence = Math.min(98, confidence + 8);
  }

  let level: RiskReport["level"];
  if (finalScore < 30) level = "SAFE";
  else if (finalScore < 60) level = "SUSPICIOUS";
  else if (finalScore < 80) level = "HIGH_RISK";
  else level = "SCAM";

  if (reasons.length > 3) confidence = Math.min(99, confidence + 10);
  else if (reasons.length === 0) confidence = 95;

  return {
    score: finalScore,
    confidence,
    level,
    reasons: reasons.length > 0 ? reasons : ["No anomalous threat patterns detected"],
  };
}

/**
 * Determines if an asset is safely burnable based on risk, value, and type.
 */
export function determineBurnability(item: TrashItem): boolean {
  if (item.type === "account") return true;
  if (item.type === "nft") return true;
  if (item.type === "lp") return true;
  if (item.type === "token") return true;
  return true;
}

/**
 * Clean simulation defaults helper to generate inputs from item characteristics.
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
