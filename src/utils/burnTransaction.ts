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

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

const VALID_TOKEN_PROGRAMS = new Set([
  TOKEN_PROGRAM_ID.toBase58(),
  TOKEN_2022_PROGRAM_ID.toBase58(),
]);

export type { BurnStatus } from "../types";

export async function validateBurnability(
  item: { mintAddress?: string; type: string; id: string },
  walletPublicKey: PublicKey,
  connection: any
): Promise<"valid" | "invalid" | "unknown"> {
  try {
    if (item.type === "account") {
      const accountPubkey = new PublicKey(item.id);
      const accountData = await connection.getAccountInfo(accountPubkey, "confirmed");
      if (!accountData) return "invalid";
      if (accountData.lamports === 0) return "invalid";
      return "valid";
    }

    if (item.type === "nft" || item.type === "token") {
      if (!item.mintAddress) return "invalid";

      const mintPubkey = new PublicKey(item.mintAddress);
      const tokenAccountInfo = await findTokenAccountsByOwnerAndMint(connection, walletPublicKey, mintPubkey);

      if (!tokenAccountInfo) {
        return "invalid";
      }

      return "valid";
    }

    if (item.type === "lp") {
      return "unknown";
    }

    return "unknown";
  } catch (err) {
    console.warn("validateBurnability error:", err);
    return "unknown";
  }
}

async function findTokenAccountsByOwnerAndMint(
  connection: any,
  owner: PublicKey,
  mint: PublicKey
): Promise<{
  pubkey: PublicKey;
  mint: PublicKey;
  amount: bigint;
  decimals: number;
  programId: PublicKey;
  isWrappedSol: boolean;
} | null> {
  try {
    const response = await connection.getParsedTokenAccountsByOwner(owner, {
      mint: mint,
    }, "confirmed");

    const value = response.result?.value || response.value;
    console.log(`[Burn] Looking for token account by mint ${mint.toBase58()}, found ${value?.length || 0} accounts`);

    if (!value || value.length === 0) {
      return null;
    }

    const tokenAccount = value[0];
    if (!tokenAccount) {
      return null;
    }

    const pubkey = tokenAccount.pubkey;
    if (!pubkey) {
      return null;
    }

    const accountData = tokenAccount.account?.data;
    if (!accountData || !accountData.parsed) {
      return null;
    }

    const info = accountData.parsed.info;
    const tokenAmount = info.tokenAmount;

    if (!tokenAmount || !tokenAmount.amount) {
      return null;
    }

    const isWSOL = info.mint === WRAPPED_SOL_MINT;

    return {
      pubkey: new PublicKey(pubkey),
      mint: new PublicKey(info.mint),
      amount: BigInt(tokenAmount.amount),
      decimals: tokenAmount.decimals || 0,
      programId: new PublicKey(tokenAccount.account.owner),
      isWrappedSol: isWSOL,
    };
  } catch (err) {
    console.warn("findTokenAccountsByOwnerAndMint error:", err);
    return null;
  }
}

async function getAccountData(
  connection: any,
  accountPubkey: PublicKey
): Promise<{ lamports: number; owner: PublicKey; programId?: PublicKey } | null> {
  try {
    const info = await connection.getAccountInfo(accountPubkey, "confirmed");
    if (!info) return null;
    return {
      lamports: info.lamports,
      owner: info.owner,
      programId: info.owner,
    };
  } catch {
    return null;
  }
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
  burnIntensity: number = 1,
  wallet?: any
): Promise<BurnTransactionResult> {
  if (!items || items.length === 0) {
    return { success: false, error: "No items selected for burning", totalReclaimedSol: 0, protocolFeeSol: 0, netReclaimedSol: 0 };
  }

  const feeWallet = new PublicKey(FEE_WALLET_ADDRESS);
  const instructions: TransactionInstruction[] = [];
  const skippedItems: string[] = [];
  const processedItems: string[] = [];

  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_200_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 })
  );

  let totalReclaimableLamports = 0;

  for (const item of items) {
    const itemId = item.id;
    const itemMintAddress = item.mintAddress;

    if (!itemMintAddress) {
      const accountPubkey = new PublicKey(itemId);

      if (accountPubkey.toBase58() === walletPublicKey.toBase58()) {
        skippedItems.push(`${item.symbol} (main wallet - skipped)`);
        continue;
      }

      const accountData = await getAccountData(connection, accountPubkey);

      if (!accountData) {
        skippedItems.push(`${item.symbol} (account not found)`);
        continue;
      }

      const ownerBase58 = accountData.owner.toBase58();
      if (!VALID_TOKEN_PROGRAMS.has(ownerBase58)) {
        skippedItems.push(`${item.symbol} (not a token account, skipping)`);
        continue;
      }

      try {
        const closeIx = createCloseAccountInstruction(
          accountPubkey,
          walletPublicKey,
          walletPublicKey,
          [],
          accountData.owner
        );
        instructions.push(closeIx);
        processedItems.push(`${item.symbol} (SOL account closed)`);
        totalReclaimableLamports += Math.floor(item.reclaimableSol * LAMPORTS_PER_SOL);
      } catch (err) {
        console.warn(`Close failed for ${item.symbol}:`, err);
        skippedItems.push(`${item.symbol} (close failed)`);
      }
      continue;
    }

    const mintPubkey = new PublicKey(itemMintAddress);
    const isNFT = item.type === "nft";
    const isFungibleToken = item.type === "token";

    if (isNFT || isFungibleToken) {
      const tokenAccountInfo = await findTokenAccountsByOwnerAndMint(
        connection,
        walletPublicKey,
        mintPubkey
      );

      if (!tokenAccountInfo) {
        skippedItems.push(`${item.symbol} (no token account found)`);
        continue;
      }

      if (tokenAccountInfo.isWrappedSol) {
        try {
          const closeIx = createCloseAccountInstruction(
            tokenAccountInfo.pubkey,
            walletPublicKey,
            walletPublicKey,
            [],
            tokenAccountInfo.programId
          );
          instructions.push(closeIx);
          processedItems.push(`${item.symbol} (WSOL closed)`);
          totalReclaimableLamports += Math.floor(item.reclaimableSol * LAMPORTS_PER_SOL);
        } catch (err) {
          console.warn(`WSOL close failed for ${item.symbol}:`, err);
        }
        continue;
      }

      if (tokenAccountInfo.amount > 0n) {
        try {
          const burnIx = createBurnInstruction(
            tokenAccountInfo.pubkey,
            mintPubkey,
            walletPublicKey,
            tokenAccountInfo.amount,
            [],
            tokenAccountInfo.programId
          );
          instructions.push(burnIx);
          processedItems.push(`${item.symbol} (burned ${tokenAccountInfo.amount.toString()})`);
        } catch (err) {
          console.warn(`Burn failed for ${item.symbol}:`, err);
          skippedItems.push(`${item.symbol} (burn failed)`);
          continue;
        }
      } else {
        processedItems.push(`${item.symbol} (balance 0)`);
      }

      try {
        const closeIx = createCloseAccountInstruction(
          tokenAccountInfo.pubkey,
          walletPublicKey,
          walletPublicKey,
          [],
          tokenAccountInfo.programId
        );
        instructions.push(closeIx);
        totalReclaimableLamports += Math.floor(item.reclaimableSol * LAMPORTS_PER_SOL);
      } catch (err) {
        console.warn(`Close failed for ${item.symbol}:`, err);
        skippedItems.push(`${item.symbol} (close failed)`);
      }
      continue;
    }

    if (item.type === "account") {
      const accountPubkey = new PublicKey(itemId);

      if (accountPubkey.toBase58() === walletPublicKey.toBase58()) {
        skippedItems.push(`${item.symbol} (main wallet - skipped)`);
        continue;
      }

      const accountData = await getAccountData(connection, accountPubkey);

      if (!accountData || accountData.lamports === 0) {
        skippedItems.push(`${item.symbol} (account empty or not found)`);
        continue;
      }

      const ownerBase58 = accountData.owner.toBase58();
      if (!VALID_TOKEN_PROGRAMS.has(ownerBase58)) {
        skippedItems.push(`${item.symbol} (not a token account, skipping)`);
        continue;
      }

      try {
        const closeIx = createCloseAccountInstruction(
          accountPubkey,
          walletPublicKey,
          walletPublicKey,
          [],
          accountData.owner
        );
        instructions.push(closeIx);
        processedItems.push(`${item.symbol} (account closed)`);
        totalReclaimableLamports += Math.floor(item.reclaimableSol * LAMPORTS_PER_SOL);
      } catch (err) {
        console.warn(`Close failed for ${item.symbol}:`, err);
        skippedItems.push(`${item.symbol} (close failed)`);
      }
    }
  }

  if (instructions.length <= 2) {
    return {
      success: false,
      error: `No valid instructions created. Processed: ${processedItems.join(", ") || "none"}. Skipped: ${skippedItems.join(", ") || "none"}`,
      totalReclaimedSol: 0,
      protocolFeeSol: 0,
      netReclaimedSol: 0,
    };
  }

  const feePercent = getSmartDynamicFeePercent();
  const burnIntensityBonusPct = Math.min(0.15, burnIntensity * 0.03);
  const effectiveFeePercent = feePercent * (1 - burnIntensityBonusPct);

  const totalProtocolFeeLamports = Math.floor(totalReclaimableLamports * effectiveFeePercent / 100);

  if (totalProtocolFeeLamports > 0 && totalProtocolFeeLamports >= 1000) {
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
    let signature: string;

    if (wallet?.signTransaction) {
      console.log("[BURN] Explicitly signing transaction with wallet...");
      await wallet.signTransaction(transaction);
      const rawTx = transaction.serialize();
      console.log("[BURN] Sending raw signed transaction...");
      signature = await connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      });
    } else {
      console.log("[BURN] Using sendTransaction (auto-sign)...", typeof sendTransaction);
      signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      });
    }

    const confirmation = await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    if (confirmation.value.err) {
      return {
        success: false,
        error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
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