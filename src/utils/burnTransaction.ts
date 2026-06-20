import {
  Transaction,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  createCloseAccountInstruction,
  createBurnInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { TrashItem } from "../types";
import { getSmartDynamicFeePercent } from "./riskEngine";
import { FEE_WALLET_ADDRESS } from "../config";

const TOKEN_2022_PROGRAM_ID_STR = TOKEN_2022_PROGRAM_ID.toBase58();

function resolveProgramId(programId?: string): PublicKey {
  if (programId === TOKEN_2022_PROGRAM_ID_STR) return TOKEN_2022_PROGRAM_ID;
  return TOKEN_PROGRAM_ID;
}

export interface BurnTransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  totalReclaimedSol: number;
  protocolFeeSol: number;
  netReclaimedSol: number;
}

export async function buildAndSendBurnTransaction(
  items: TrashItem[],
  walletPublicKey: PublicKey,
  sendTransaction: any,
  connection: any,
  burnIntensity: number = 1
): Promise<BurnTransactionResult> {
  if (!items || items.length === 0) {
    return { success: false, error: "No items selected for burning", totalReclaimedSol: 0, protocolFeeSol: 0, netReclaimedSol: 0 };
  }

  const feeWallet = new PublicKey(FEE_WALLET_ADDRESS);
  const instructions: TransactionInstruction[] = [];

  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 })
  );

  let totalReclaimableLamports = 0;

  for (const item of items) {
    if (!item.mintAddress) continue;

    const mintPubkey = new PublicKey(item.mintAddress);
    const programId = resolveProgramId(item.programId);

    if (item.amount > 0 && item.type !== "account") {
      try {
        const burnIx = createBurnInstruction(
          mintPubkey,
          new PublicKey(item.id),
          walletPublicKey,
          item.amount,
          [],
          programId
        );
        instructions.push(burnIx);
      } catch (err) {
        console.warn(`Burn instruction failed for ${item.symbol}, skipping burn:`, err);
      }
    }

    try {
      const closeIx = createCloseAccountInstruction(
        new PublicKey(item.id),
        walletPublicKey,
        walletPublicKey,
        [],
        programId
      );
      instructions.push(closeIx);
      totalReclaimableLamports += Math.floor(item.reclaimableSol * LAMPORTS_PER_SOL);
    } catch (err) {
      console.warn(`Close account instruction failed for ${item.symbol}:`, err);
    }
  }

  if (instructions.length <= 2) {
    return { success: false, error: "No valid burn/close instructions could be created", totalReclaimedSol: 0, protocolFeeSol: 0, netReclaimedSol: 0 };
  }

  const feePercent = getSmartDynamicFeePercent();
  const burnIntensityBonusPct = Math.min(0.15, burnIntensity * 0.03);
  const effectiveFeePercent = feePercent * (1 - burnIntensityBonusPct);

  const totalProtocolFeeLamports = Math.floor(totalReclaimableLamports * effectiveFeePercent / 100);

  if (totalProtocolFeeLamports > 0 && totalProtocolFeeLamports >= 5000) {
    const transferFeeIx = SystemProgram.transfer({
      fromPubkey: walletPublicKey,
      toPubkey: feeWallet,
      lamports: totalProtocolFeeLamports,
    });
    instructions.push(transferFeeIx);
  }

  const transaction = new Transaction();
  transaction.add(...instructions);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPublicKey;

  try {
    const signature = await sendTransaction(transaction, connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });

    const confirmation = await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    if (confirmation.value.err) {
      return {
        success: false,
        error: `Transaction confirmed with errors: ${JSON.stringify(confirmation.value.err)}`,
        totalReclaimedSol: 0,
        protocolFeeSol: 0,
        netReclaimedSol: 0,
      };
    }

    const totalReclaimedSol = totalReclaimableLamports / LAMPORTS_PER_SOL;
    const protocolFeeSol = totalProtocolFeeLamports / LAMPORTS_PER_SOL;
    const netReclaimedSol = totalReclaimedSol - protocolFeeSol;

    return {
      success: true,
      signature,
      totalReclaimedSol,
      protocolFeeSol,
      netReclaimedSol,
    };
  } catch (err: any) {
    console.error("Burn transaction failed:", err);
    return {
      success: false,
      error: err?.message || "Transaction failed to send or confirm",
      totalReclaimedSol: 0,
      protocolFeeSol: 0,
      netReclaimedSol: 0,
    };
  }
}
