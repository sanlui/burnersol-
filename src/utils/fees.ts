/**
 * BurnerSol - Secure Fee Calculation & Manipulation Protection Protocol
 * Ensures dynamic split commissions remain client-safe, deterministic, and bounded within [5%, 15%].
 */

/**
 * Validates, filters, and sanitizes dangerous input scores.
 * Under no circumstances can a NaN, extreme value, or null value cause fee computation exploits.
 */
export function validateFeeInputs(spamScore: any): number {
  if (spamScore === undefined || spamScore === null) {
    return 0; // Default baseline score
  }

  const scoreNum = typeof spamScore === "number" ? spamScore : parseFloat(String(spamScore));

  if (isNaN(scoreNum) || !isFinite(scoreNum)) {
    return 100; // Treat invalid input with maximum defensive suspicion (100% spam indicator)
  }

  // Force strict bounding [0, 100]
  return Math.min(100, Math.max(0, scoreNum));
}

/**
 * Computes deterministic protocol burn fee percentage.
 * Enforces strict boundaries: no external or dynamic input can decrease the fee below 5%
 * or elevate it above 15% (hard caps).
 * 
 * Spam Score > 80   => Fee = 5%
 * Spam Score 60-80  => Fee = 8%
 * Spam Score 40-60  => Fee = 10%
 * Spam Score < 40   => Fee = 15%
 */
export function getSmartDynamicFeePercentSecure(spamScore: any): number {
  const sanitizedScore = validateFeeInputs(spamScore);

  let proposedFee = 15;
  if (sanitizedScore > 80) {
    proposedFee = 5;
  } else if (sanitizedScore >= 60) {
    proposedFee = 8;
  } else if (sanitizedScore >= 40) {
    proposedFee = 10;
  } else {
    proposedFee = 15;
  }

  // Hard cap verification check (Security assertion guardrail)
  return Math.min(15, Math.max(5, proposedFee));
}
