import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const metadataPath = path.join(root, "public", "token-metadata.json");
const tokenomicsPath = path.join(root, "docs", "TOKENOMICS.md");

const expected = {
  name: "BurnerSOL",
  symbol: "BURN",
  supply: 100_000_000,
  decimals: 9,
  metadataUri: "https://burnersol.com/token-metadata.json",
};

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

if (!fs.existsSync(metadataPath)) {
  fail("public/token-metadata.json is missing.");
} else {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  metadata.name === expected.name ? pass("metadata name is correct.") : fail(`metadata name must be ${expected.name}.`);
  metadata.symbol === expected.symbol ? pass("metadata symbol is correct.") : fail(`metadata symbol must be ${expected.symbol}.`);
  metadata.description && metadata.description.length >= 80 ? pass("metadata description is substantial.") : fail("metadata description is too short.");
  metadata.image === "https://burnersol.com/token-logo.png" ? pass("metadata image points to token-logo.png.") : fail("metadata image must be https://burnersol.com/token-logo.png.");
  fs.existsSync(path.join(root, "public", "token-logo.png")) ? pass("public token logo exists.") : fail("public/token-logo.png is missing.");
  metadata.external_url && metadata.external_url.startsWith("https://") ? pass("external URL is HTTPS.") : fail("external_url must be HTTPS.");
}

if (!fs.existsSync(tokenomicsPath)) {
  fail("docs/TOKENOMICS.md is missing.");
} else {
  const tokenomics = fs.readFileSync(tokenomicsPath, "utf8");
  tokenomics.includes("100,000,000") ? pass("tokenomics supply is documented.") : fail("tokenomics supply is missing.");
  tokenomics.includes("Mint authority should be revoked") ? pass("mint authority policy is documented.") : fail("mint authority policy is missing.");
  tokenomics.includes("Freeze authority should be revoked") ? pass("freeze authority policy is documented.") : fail("freeze authority policy is missing.");
  /no guaranteed|does not guarantee|not guarantee|guaranteed/i.test(tokenomics) ? pass("risk language is present.") : fail("risk language is missing.");
}

console.log("");
console.log("Planned token:");
console.log(JSON.stringify(expected, null, 2));

if (!process.exitCode) {
  console.log("");
  console.log("Token preflight passed. You can proceed to wallet-reviewed mint creation.");
}