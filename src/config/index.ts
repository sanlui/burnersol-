const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "";
const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY || "";

export const RPC_CONFIG = {
  alchemy: {
    http: ALCHEMY_API_KEY
      ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : "https://solana-mainnet.g.alchemy.com/v2/demo",
    ws: ALCHEMY_API_KEY
      ? `wss://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : undefined,
  },
  helius: {
    rpc: HELIUS_API_KEY
      ? `https://mainnet.helius-rpc.com/${HELIUS_API_KEY}`
      : "https://mainnet.helius-rpc.com",
    ws: HELIUS_API_KEY
      ? `wss://mainnet.helius-rpc.com/${HELIUS_API_KEY}`
      : undefined,
  },
  fallback: "https://solana-api.projectserum.com",
} as const;

export const KNOWN_TOKENS: Record<string, { name: string; symbol: string }> = {
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { name: "USD Coin", symbol: "USDC" },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { name: "Tether USD", symbol: "USDT" },
  "So11111111111111111111111111111111111111112": { name: "Wrapped SOL", symbol: "WSOL" },
  "JUPyiwrYJF2ip9vdJjN2BLm9S85FmP9X9bJ65h6Nzo6": { name: "Jupiter", symbol: "JUP" },
  "DezXAZ8z7PnrnRJjz3wX4mP97EGAtfA6AtC8Zq1A2Uq": { name: "Bonk", symbol: "BONK" },
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": { name: "Marinade Staked SOL", symbol: "mSOL" },
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": { name: "Lido Staked SOL", symbol: "stSOL" },
  "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE": { name: "Orca", symbol: "ORCA" },
  "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt": { name: "Serum", symbol: "SRM" },
};

export const SPAM_KEYWORDS = [
  "CLAIM", "FREE", "GIFT", "REWARD", "AIRDROP", "TICKET", "VOUCHER", "WINNER",
  ".NET", ".COM", ".ORG", ".XYZ", ".CC", ".LINK", "CLICK", "VISIT"
] as const;

export const PROTOCOL_FEE_PERCENT = 1.5;

export const FEE_WALLET_ADDRESS = import.meta.env.VITE_FEE_WALLET_ADDRESS || "G1efdrKAJrXmaimMcZGTsDsGuBTxBNBfh1PrMkq1mR7S";

export const SOL_RENT_EXEMPTION_LAMPORTS = 2039280;

export const ALLOWED_ORIGINS = [
  "https://burnersol.io",
  "https://www.burnersol.io",
  "http://localhost:5173",
  "http://localhost:3000",
] as const;