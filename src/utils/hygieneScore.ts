/**
 * BurnerSol - Wallet Hygiene Score System
 * Evaluates the overall security, efficiency, and cleanliness of a Solana wallet address.
 */

import { TrashItem } from "../types";

export interface WalletHygieneReport {
  score: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  scamCount: number;
  suspiciousCount: number;
  safeCount: number;
  totalAssets: number;
  reclaimableSol: number;
  colorClass: string;
  statusMessage: string;
  hygieneAspects: {
    name: string;
    score: number;
    status: "clean" | "warning" | "danger";
    description: string;
  }[];
  recommendations: string[];
}

export function calculateWalletHygiene(items: TrashItem[]): WalletHygieneReport {
  const totalAssets = items.length;
  let scamCount = 0;
  let suspiciousCount = 0;
  let safeCount = 0;
  let accountClutterCount = 0;
  let totalReclaimableSol = 0;

  items.forEach(item => {
    totalReclaimableSol += item.reclaimableSol || 0;
    
    // Classify risk level based on the item risk report or fallback properties
    const riskLevel = item.riskReport?.level || (item.isScam ? "SCAM" : "SAFE");
    if (riskLevel === "SCAM") {
      scamCount++;
    } else if (riskLevel === "HIGH_RISK") {
      scamCount++; // treat high_risk under scam count for convenience or split
    } else if (riskLevel === "SUSPICIOUS") {
      suspiciousCount++;
    } else {
      safeCount++;
    }

    // Check for empty dust accounts (type === 'account' or zero balance token accounts)
    if (item.type === "account" || (item.type === "token" && item.amount === 0)) {
      accountClutterCount++;
    }
  });

  if (totalAssets === 0) {
    return {
      score: 100,
      grade: "A+",
      scamCount: 0,
      suspiciousCount: 0,
      safeCount: 0,
      totalAssets: 0,
      reclaimableSol: 0,
      colorClass: "text-[#14F195] border-[#14F195]/20 bg-[#14F195]/5",
      statusMessage: "Pristine & Untouched. Your wallet has zero toxic clutter or inactive on-chain accounts.",
      hygieneAspects: [
        { name: "Phishing Immunity", score: 100, status: "clean", description: "No scam-infused memo tokens or fake vouchers detected." },
        { name: "Account Efficiency", score: 100, status: "clean", description: "Zero dusty rent-locked accounts occupying Solana storage." },
      ],
      recommendations: ["Maintain hygiene by skipping non-verified public airdrops."]
    };
  }

  // Scoring weights
  // Baseline: 100
  // Scam/High Risk: deduct 25 points per incident
  // Suspicious: deduct 10 points per incident
  // Inactive/Dust Accounts: deduct 3 points per account
  let calculatedScore = 100;
  calculatedScore -= (scamCount * 25);
  calculatedScore -= (suspiciousCount * 10);
  calculatedScore -= (accountClutterCount * 4);

  // Clamp score
  const score = Math.min(100, Math.max(0, Math.round(calculatedScore)));

  // Map to grade
  let grade: "A+" | "A" | "B" | "C" | "D" | "F";
  let colorClass = "text-[#14F195] border-[#14F195]/20 bg-[#14F195]/5";
  let statusMessage = "";

  if (score >= 95) {
    grade = "A+";
    colorClass = "text-[#14F195] border-[#14F195]/20 bg-[#14F195]/5";
    statusMessage = "Excellent. Your wallet has exceptional on-chain security standing.";
  } else if (score >= 82) {
    grade = "A";
    colorClass = "text-[#10B981] border-[#10B981]/20 bg-[#10B981]/5";
    statusMessage = "Good Hygiene. Minimal risk tags, few minor closed account optimizations remain.";
  } else if (score >= 68) {
    grade = "B";
    colorClass = "text-yellow-400 border-yellow-400/20 bg-yellow-400/5";
    statusMessage = "Moderate Risk. Multiple dust accounts and inactive elements are accumulating clutter.";
  } else if (score >= 52) {
    grade = "C";
    colorClass = "text-orange-400 border-orange-400/20 bg-orange-400/5";
    statusMessage = "Sub-optimal. High counts of suspicious tokens could trigger accidental smart contract leaks.";
  } else if (score >= 35) {
    grade = "D";
    colorClass = "text-[#F46328] border-[#F46328]/20 bg-[#F46328]/5";
    statusMessage = "Poor Hygiene. Crucial risk profiles detected. Airdrop phishing targets active session keys.";
  } else {
    grade = "F";
    colorClass = "text-[#E42525] border-[#E42525]/20 bg-[#E42525]/5";
    statusMessage = "Extreme Threat Level. Highly cluttered. Multiple active phishing trackers and scam triggers logged.";
  }

  // Construct structured aspects
  const threatAspectScore = Math.max(0, 100 - (scamCount * 30 + suspiciousCount * 12));
  const efficiencyAspectScore = Math.max(0, 100 - (accountClutterCount * 12));
  
  const hygieneAspects = [
    {
      name: "Phishing Immunity",
      score: threatAspectScore,
      status: threatAspectScore > 80 ? "clean" as const : threatAspectScore > 45 ? "warning" as const : "danger" as const,
      description: scamCount > 0 
        ? `Found ${scamCount} highly dangerous threat indicators.` 
        : "No critical malware, draining history or fake tokens recorded."
    },
    {
      name: "Account Efficiency",
      score: efficiencyAspectScore,
      status: efficiencyAspectScore > 80 ? "clean" as const : efficiencyAspectScore > 45 ? "warning" as const : "danger" as const,
      description: accountClutterCount > 0
        ? `${accountClutterCount} open rent-locked accounts can be reclaimed for SOL.`
        : "All open storage keys are fully active with active balances."
    }
  ];

  // Specific actionable recommendations
  const recommendations: string[] = [];
  if (scamCount > 0) {
    recommendations.push(`Safely burn/purge the ${scamCount} scam assets with freeze-authorities to shield session keys.`);
  }
  if (accountClutterCount > 0) {
    recommendations.push(`Close the ${accountClutterCount} inactive rent-holding accounts to instantly reclaim ~${(accountClutterCount * 0.002).toFixed(3)} SOL.`);
  }
  if (score < 80 && recommendations.length === 0) {
    recommendations.push("Initiate a routine weekly vault cleanup operation.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Your wallet is in ideal condition! Continue avoiding unsafe dapp authorizations.");
  }

  return {
    score,
    grade,
    scamCount,
    suspiciousCount,
    safeCount,
    totalAssets,
    reclaimableSol: totalReclaimableSol,
    colorClass,
    statusMessage,
    hygieneAspects,
    recommendations
  };
}
