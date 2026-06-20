/**
 * BurnerSol - Burn Preview Protocol Engine
 * Computes exact rent-reclaims, tiered commissions, gas thresholds, and intensity multiplier bonuses.
 */

import { TrashItem } from "../types";
import { getSmartDynamicFeePercent } from "./riskEngine";

export interface BurnPreviewReport {
  items: {
    id: string;
    name: string;
    symbol: string;
    type: string;
    reclaimableSol: number;
    protocolFeeSol: number;
    netReclaimSol: number;
    riskScore: number;
    riskLevel: string;
  }[];
  totalItems: number;
  rawReclaimSol: number;
  totalProtocolFeeSol: number;
  totalNetReclaimSol: number;
  estimatedSolanaTxFee: number;
  burnIntensityBonusPct: number;
}

export function generateBurnPreview(
  selectedItems: TrashItem[],
  burnIntensity: number = 0
): BurnPreviewReport {
  const previewItems = selectedItems.map(item => {
    const riskScore = item.riskReport?.score ?? (item.isScam ? 90 : 10);
    const feePct = getSmartDynamicFeePercent();
    const protocolFee = (item.reclaimableSol * feePct) / 100;
    
    return {
      id: item.id,
      name: item.name,
      symbol: item.symbol,
      type: item.type,
      reclaimableSol: item.reclaimableSol,
      protocolFeeSol: protocolFee,
      netReclaimSol: item.reclaimableSol - protocolFee,
      riskScore,
      riskLevel: item.riskReport?.level || (item.isScam ? "SCAM" : "SAFE"),
    };
  });

  const rawReclaimSol = previewItems.reduce((acc, curr) => acc + curr.reclaimableSol, 0);
  const baseProtocolFeeSol = previewItems.reduce((acc, curr) => acc + curr.protocolFeeSol, 0);

  // Intensity Bonus: Higher settings (1, 2, 3) reduce protocol fees slightly as a loyalty multiplier
  const burnIntensityBonusPct = Math.min(0.15, burnIntensity * 0.03); // Up to 15% discount on the fee
  const totalProtocolFeeSol = Math.max(0, baseProtocolFeeSol * (1 - burnIntensityBonusPct));
  const totalNetReclaimSol = rawReclaimSol - totalProtocolFeeSol;

  return {
    items: previewItems,
    totalItems: selectedItems.length,
    rawReclaimSol,
    totalProtocolFeeSol,
    totalNetReclaimSol,
    estimatedSolanaTxFee: 0.000005 * selectedItems.length, // standard rent-closing txn size
    burnIntensityBonusPct,
  };
}
