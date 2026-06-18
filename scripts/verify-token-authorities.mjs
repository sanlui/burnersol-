import { Connection, PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const mintAddress = process.argv[2];
if (!mintAddress) {
  console.error("Usage: npm run token:verify -- <MINT_ADDRESS>");
  process.exit(1);
}

const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(rpcUrl, "confirmed");
const mint = new PublicKey(mintAddress);
const info = await getMint(connection, mint, "confirmed", TOKEN_PROGRAM_ID);

const result = {
  mint: mint.toBase58(),
  supplyRaw: info.supply.toString(),
  decimals: info.decimals,
  mintAuthority: info.mintAuthority ? info.mintAuthority.toBase58() : null,
  freezeAuthority: info.freezeAuthority ? info.freezeAuthority.toBase58() : null,
  isInitialized: info.isInitialized,
};

console.log(JSON.stringify(result, null, 2));

let ok = true;
if (result.decimals !== 9) {
  console.error("FAIL: decimals must be 9.");
  ok = false;
}
if (result.mintAuthority !== null) {
  console.error("FAIL: mint authority is still active.");
  ok = false;
}
if (result.freezeAuthority !== null) {
  console.error("FAIL: freeze authority is still active.");
  ok = false;
}

if (!ok) process.exit(1);
console.log("PASS: token authority verification passed.");