const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

const LAMPORTS_PER_SOL = 1_000_000_000;
const MINT_SIZE = 82;
const ACCOUNT_SIZE = 165;
const METADATA_ESTIMATED_BYTES = 679;
const SAFETY_BUFFER_SOL = 0.006;
const TX_FEE_BUFFER_SOL = 0.001;
const USER_BALANCE_SOL = Number(process.env.USER_SOL_BALANCE || "0.0059");

async function getRentExemption(bytes) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getMinimumBalanceForRentExemption",
        params: [bytes],
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`RPC status ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "RPC error");
    return Number(data.result || 0);
  } finally {
    clearTimeout(timer);
  }
}

let mintRent;
let ataRent;
let metadataRent;
let source = "mainnet-rpc";

try {
  [mintRent, ataRent, metadataRent] = await Promise.all([
    getRentExemption(MINT_SIZE),
    getRentExemption(ACCOUNT_SIZE),
    getRentExemption(METADATA_ESTIMATED_BYTES),
  ]);
} catch (error) {
  source = "offline-estimate";
  mintRent = 1_461_600;
  ataRent = 2_039_280;
  metadataRent = 5_610_000;
}

const rentSol = (mintRent + ataRent + metadataRent) / LAMPORTS_PER_SOL;
const recommendedSol = rentSol + TX_FEE_BUFFER_SOL + SAFETY_BUFFER_SOL;
const minimalWithoutMetadataSol = (mintRent + ataRent) / LAMPORTS_PER_SOL + TX_FEE_BUFFER_SOL;

const estimate = {
  source,
  mintRentSol: mintRent / LAMPORTS_PER_SOL,
  tokenAccountRentSol: ataRent / LAMPORTS_PER_SOL,
  metadataRentEstimateSol: metadataRent / LAMPORTS_PER_SOL,
  txFeeBufferSol: TX_FEE_BUFFER_SOL,
  safetyBufferSol: SAFETY_BUFFER_SOL,
  minimalWithoutMetadataSol,
  recommendedWithMetadataSol: recommendedSol,
  userBalanceSol: USER_BALANCE_SOL,
  enoughForMinimalMintWithoutMetadata: USER_BALANCE_SOL >= minimalWithoutMetadataSol,
  enoughForProfessionalLaunchWithMetadata: USER_BALANCE_SOL >= recommendedSol,
};

console.log(JSON.stringify(estimate, null, 2));

if (USER_BALANCE_SOL < recommendedSol) {
  console.log(`\n${USER_BALANCE_SOL} SOL is not enough for a professional token launch with metadata. Recommended minimum: ${recommendedSol.toFixed(4)} SOL.`);
}