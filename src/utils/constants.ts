/**
 * Centralized constants for BurnerSol
 * All magic numbers and reusable values live here
 */

// ============================================================
// SOLANA CONSTANTS
// ============================================================

/** Minimum Base58 public key length in bytes */
export const MIN_PUBKEY_LENGTH = 32;

/** Default Solana RPC endpoints */
export const PRIMARY_SOLANA_RPC = "https://solana-mainnet.g.alchemy.com/v2/XhvbwzXZcW2UhCcCj5cC1";
export const FALLBACK_SOLANA_RPC = "https://solana-api.projectserum.com";
export const HELIUS_RPC = "https://mainnet.helius-rpc.com/?api-key=228a6dca-c288-4f6a-b85c-23561fb9e946";

/** Token program address for SPL tokens */
export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

/** Rent exempt lamports for one token account */
export const ACCOUNT_RENT_LAMPORTS = 2039280;

/** Lamports per 1 SOL (1 billion) */
export const LAMPORTS_PER_SOL = 1_000_000_000;

/** Base transaction fee in SOL (approximate signature fee) */
export const BASE_SIGNATURE_FEE_SOL = 0.000005;

// ============================================================
// API CONFIGURATION
// ============================================================

/** Default timeout for resilient fetch (ms) */
export const DEFAULT_FETCH_TIMEOUT_MS = 2500;

/** Default max retries for resilient fetch */
export const DEFAULT_MAX_RETRIES = 2;

/** Max concurrent outstanding RPC requests */
export const MAX_CONCURRENT_REQUESTS = 6;

/** Max batch size for RPC arrays (DoS protection) */
export const MAX_RPC_BATCH_SIZE = 150;

/** Max wallet accounts to scan for performance */
export const MAX_SCANNED_ACCOUNTS = 150;

// ============================================================
// MARKET & PRICING
// ============================================================

/** Default SOL price in USD (fallback) */
export const DEFAULT_SOL_PRICE_USD = 145;

/** Default fee percentages for burn operations */
export const FEE_PERCENTAGES = {
  LOW: 1.0,
  MEDIUM: 2.5,
  HIGH: 5.0,
} as const;

// ============================================================
// UI CONSTANTS
// ============================================================

/** Poll interval for gas fees (ms) */
export const GAS_FEE_POLL_INTERVAL_MS = 12000;

/** Poll interval for live burn feed (ms) */
export const BURN_FEED_POLL_INTERVAL_MS = 8000;

/** Max chat message length */
export const MAX_CHAT_MESSAGE_LENGTH = 500;

/** Max chat history messages */
export const MAX_CHAT_HISTORY = 100;
