import React from "react";

export type WalletId =
  | "phantom"
  | "solflare"
  | "solflare_ledger"
  | "backpack"
  | "coin98"
  | "exodus"
  | "magiceden"
  | "trust"
  | "wallet_connect"
  | "glow"
  | "nightly"
  | "blade"
  | "bitkeep"
  | "ultimate"
  | "core"
  | "solong"
  | "math"
  | "tokenpocket"
  | "okx"
  | "whale";

export type DetectionConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface DetectedWallet {
  id: WalletId;
  name: string;
  icon: React.ReactNode;
  detected: boolean;
  confidence: DetectionConfidence;
  connect: () => Promise<string | null>;
  downloadUrl: string;
}

type WalletDefinition = {
  id: WalletId;
  name: string;
  downloadUrl: string;
  detected: (w: Window) => { found: boolean; confidence: DetectionConfidence };
  connect: (w: Window) => Promise<string | null>;
  icon: React.ReactNode;
};

const PhantomIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 58.7C9.5 54.3 13.1 50.7 17.5 50.7H45.3L88.1 100.5C90.6 102.8 94.7 102.8 97.2 100.5L121.7 77.7C125.4 74.4 124.8 68.5 120.5 65.8L68.5 39.5C63.9 37.2 58.3 39.8 56.4 44.7L44.9 78.2C43.4 81.7 39.9 84 36 84H17.5C13.1 84 9.5 80.4 9.5 76V58.7Z" fill="#AB9FF2"/>
    <path d="M9.5 42.2C9.5 37.8 13.1 34.2 17.5 34.2H45.3L88.1 83.9C90.6 86.2 94.7 86.2 97.2 83.9L121.7 61.2C125.4 57.9 124.8 52 120.5 49.2L68.5 23C63.9 20.7 58.3 23.3 56.4 28.2L44.9 61.6C43.4 65.1 39.9 67.5 36 67.5H17.5C13.1 67.5 9.5 63.9 9.5 59.5V42.2Z" fill="#8B7BC5"/>
    <circle cx="92" cy="45" r="7" fill="white"/>
  </svg>
);

const SolflareIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#FAB214"/>
    <path d="M64 16L77.6 55.7H100.8L82.2 79.9L91.4 119.8L64 95.7L36.6 119.8L45.8 79.9L27.2 55.7H50.4L64 16Z" fill="white"/>
  </svg>
);

const SolflareLedgerIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#000"/>
    <rect x="20" y="38" width="88" height="58" rx="8" fill="#1A1A1A"/>
    <rect x="30" y="48" width="68" height="38" rx="5" fill="#0A0A0A"/>
    <circle cx="50" cy="67" r="7" fill="#00D632"/>
    <circle cx="78" cy="67" r="7" fill="#00D632"/>
    <path d="M64 20L71.5 38H56.5L64 20Z" fill="#00D632"/>
  </svg>
);

const BackpackIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#E42525"/>
    <path d="M64 26C43.12 26 26 43.12 26 64C26 84.88 43.12 102 64 102C84.88 102 102 84.88 102 64C102 43.12 84.88 26 64 26ZM64 92C50.75 92 40 81.25 40 68C40 54.75 50.75 44 64 44C77.25 44 88 54.75 88 68C88 81.25 77.25 92 64 92Z" fill="white"/>
    <rect x="54" y="55" width="20" height="24" rx="3" fill="white"/>
    <rect x="62" y="63" width="4" height="8" rx="1" fill="#E42525"/>
  </svg>
);

const Coin98Icon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#EAAF1A"/>
    <path d="M64 26L88 64L64 102L40 64L64 26Z" fill="white"/>
    <path d="M64 26V102M40 64L64 102M64 26L88 64" stroke="#EAAF1A" strokeWidth="4"/>
    <circle cx="64" cy="64" r="10" fill="#EAAF1A"/>
  </svg>
);

const ExodusIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#1E1E2E"/>
    <path d="M40 40L64 24L88 40L64 56L40 40Z" fill="#4EC1E0"/>
    <path d="M40 88L64 104L88 88L64 72L40 88Z" fill="#FF6B6B"/>
    <path d="M24 64L40 40V88L24 64Z" fill="#2A2A4A"/>
    <path d="M104 64L88 88V40L104 64Z" fill="#2A2A4A"/>
  </svg>
);

const MagicEdenIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#1A1A2E"/>
    <path d="M64 30L94 64L64 98L34 64L64 30Z" fill="#FF9D00"/>
    <path d="M46 54L64 36L82 54L64 72L46 54Z" fill="white"/>
  </svg>
);

const TrustIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#3375BB"/>
    <path d="M64 30L88 54L64 98L40 54L64 30Z" fill="white"/>
    <circle cx="64" cy="58" r="8" fill="#3375BB"/>
  </svg>
);

const WalletConnectIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#3B99FC"/>
    <path d="M25.7 61.5c13.8-13.1 36.2-13.1 50 0l2.8 2.6c.8.7 2 .7 2.8 0l2.8-2.6c13.8-13.1 36.2-13.1 50 0l.4.4c.8.7.8 1.9 0 2.7L85.1 89.2c-1.5 1.4-3.8 1.5-5.4.3L64 74.8 49.1 89.5c-1.5 1.2-3.9 1.1-5.4-.3L26.5 64.6c-.8-.7-.8-2 0-2.7l.4-.4h-.2ZM104 73.5c-5.4 0-9.8 4.4-9.8 9.8s4.4 9.8 9.8 9.8 9.8-4.4 9.8-9.8-4.4-9.8-9.8-9.8ZM24 73.5c-5.4 0-9.8 4.4-9.8 9.8s4.4 9.8 9.8 9.8 9.8-4.4 9.8-9.8-4.4-9.8-9.8-9.8Z" fill="white"/>
  </svg>
);

const GlowIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#1C1C1C"/>
    <circle cx="64" cy="64" r="45" fill="url(#glow)"/>
    <defs>
      <radialGradient id="glow" cx="64" cy="64" r="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6B35"/>
        <stop offset="1" stopColor="#FF6B35" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="64" cy="64" r="20" fill="#FF6B35"/>
    <path d="M54 64L64 50L74 64L64 78L54 64Z" fill="white"/>
  </svg>
);

const NightlyIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#2B2F4A"/>
    <path d="M80 36C68 36 56 46 56 64C56 82 68 92 80 92C72 84 70 74 72 64C74 54 78 46 80 36Z" fill="white"/>
    <path d="M88 56C90 56 92 58 92 60C92 62 90 64 88 64" stroke="white" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const BladeIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#0F0F0F"/>
    <path d="M64 24L88 64L64 104L40 64L64 24Z" fill="#00D4AA"/>
    <path d="M64 24L88 64L64 104" stroke="#00D4AA" strokeWidth="2"/>
    <path d="M64 44L76 64L64 84L52 64L64 44Z" fill="#0F0F0F"/>
  </svg>
);

const BitkeepIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#83839E"/>
    <circle cx="64" cy="64" r="30" fill="#4A4D5E"/>
    <path d="M64 44L74 64L64 84L54 64L64 44Z" fill="white"/>
    <circle cx="64" cy="64" r="8" fill="#83839E"/>
  </svg>
);

const UltimateIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#1A1A2E"/>
    <path d="M64 30L84 50L84 78L64 98L44 78L44 50L64 30Z" fill="#7B61FF"/>
    <path d="M64 46L76 58L76 70L64 82L52 70L52 58L64 46Z" fill="white"/>
  </svg>
);

const CoreIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#5546FF"/>
    <circle cx="64" cy="64" r="25" fill="white"/>
    <circle cx="64" cy="64" r="12" fill="#5546FF"/>
  </svg>
);

const SolongIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#001E2E"/>
    <ellipse cx="64" cy="64" rx="40" ry="28" fill="#00C9A7"/>
    <ellipse cx="64" cy="60" rx="30" ry="18" fill="#00E3BC"/>
    <circle cx="74" cy="54" r="6" fill="white"/>
  </svg>
);

const MathIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#8A1C14"/>
    <path d="M32 64H96M64 32V96" stroke="white" strokeWidth="10" strokeLinecap="round"/>
  </svg>
);

const TokenPocketIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#EB001B"/>
    <circle cx="64" cy="64" r="40" fill="#F7931A"/>
    <circle cx="64" cy="64" r="20" fill="#EB001B"/>
    <path d="M64 48L72 64L64 80L56 64L64 48Z" fill="white"/>
  </svg>
);

const OKXIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#1A1A1A"/>
    <rect x="38" y="38" width="52" height="52" rx="12" fill="#FFFFFF"/>
    <rect x="48" y="48" width="32" height="32" rx="6" fill="#1A1A1A"/>
    <circle cx="64" cy="64" r="8" fill="#FFFFFF"/>
  </svg>
);

const WhaleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#00B4D8"/>
    <path d="M20 64C20 64 36 44 56 44C76 44 88 56 96 64C104 72 104 84 96 84C88 84 76 80 64 80C52 80 40 84 32 84C24 84 24 72 32 64" stroke="white" strokeWidth="6" fill="none"/>
    <circle cx="44" cy="56" r="4" fill="white"/>
  </svg>
);

const SolletIcon = () => (
  <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#000"/>
    <path d="M64 30L94 64L64 98L34 64L64 30Z" fill="#FF6000"/>
    <path d="M64 46L76 64L64 82L52 64L64 46Z" fill="#FF6000"/>
    <circle cx="64" cy="64" r="8" fill="#FF6000"/>
  </svg>
);

function getPhantom(w: Window) {
  const p = w.phantom?.solana;
  return p?.isPhantom || p?.isConnected ? p : null;
}

function getSolflare(w: Window) {
  const s = w.solflare;
  return s?.isSolflare || s ? s : null;
}

function getBackpack(w: Window) {
  const b = w.backpack;
  return b?.isBackpack || b ? b : null;
}

function getCoin98(w: Window) {
  const c = w.coin98;
  return c?.isCoin98 || c ? c : null;
}

function getExodus(w: Window) {
  const e = w.exodus;
  return e?.solana || e?.isExodus ? e : null;
}

function getMagicEden(w: Window) {
  const m = w.magiceden?.wallet || w.magiceden;
  return m?.isMagicEden || m ? m : null;
}

function getTrust(w: Window) {
  const t = w.trustwallet;
  return t?.isTrust || t ? t : null;
}

function getWalletConnect(w: Window) {
  const wc = (w as any).walletConnectProvider || (w as any).walletconnect;
  return wc ? wc : null;
}

function getGlow(w: Window) {
  const g = w.glow;
  return g?.isGlow || g ? g : null;
}

function getNightly(w: Window) {
  const n = w.nightly;
  return n?.isNightly || n ? n : null;
}

function getBlade(w: Window) {
  const b = w.blade;
  return b?.isBlade || b ? b : null;
}

function getBitkeep(w: Window) {
  const bk = (w as any).bitkeep || w.bitkeep;
  return bk?.isBitKeep || bk ? bk : null;
}

function getUltimate(w: Window) {
  const u = w.ultimate;
  return u?.isUltimate || u ? u : null;
}

function getCore(w: Window) {
  const c = (w as any).core || w.core;
  return c?.isCore || c ? c : null;
}

function getSolong(w: Window) {
  const s = w.solong;
  return s?.isSolong || s ? s : null;
}

function getMath(w: Window) {
  const m = w.mathwallet;
  return m?.isMathWallet || m ? m : null;
}

function getTokenPocket(w: Window) {
  const tp = w.tokenpocket;
  return tp?.isTokenPocket || tp ? tp : null;
}

function getOKX(w: Window) {
  const o = (w as any).okxwallet || w.okx;
  return o?.isOKEx || o ? o : null;
}

function getWhale(w: Window) {
  const wh = (w as any).whale;
  return wh?.isWhale || wh ? wh : null;
}

function getSollet(w: Window) {
  const sl = w.sollet;
  return sl?.isSollet || sl ? sl : null;
}

const WALLET_DEFINITIONS: WalletDefinition[] = [
  {
    id: "phantom",
    name: "Phantom",
    downloadUrl: "https://phantom.app/",
    detected: (w) => {
      const p = getPhantom(w);
      return { found: !!p, confidence: p?.isPhantom ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const p = getPhantom(w);
      if (!p) return null;
      const resp = await p.connect();
      return resp.publicKey?.toString() || p.publicKey?.toString() || null;
    },
    icon: <PhantomIcon />,
  },
  {
    id: "solflare",
    name: "Solflare",
    downloadUrl: "https://solflare.com/",
    detected: (w) => {
      const s = getSolflare(w);
      return { found: !!s, confidence: s?.isSolflare ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const s = getSolflare(w);
      if (!s) return null;
      await s.connect();
      return s.publicKey?.toString() || null;
    },
    icon: <SolflareIcon />,
  },
  {
    id: "solflare_ledger",
    name: "Solflare + Ledger",
    downloadUrl: "https://solflare.com/ledger",
    detected: (w) => {
      const s = getSolflare(w);
      if (!s) return { found: false, confidence: "LOW" };
      return { found: true, confidence: "MEDIUM" };
    },
    connect: async (w) => {
      const s = getSolflare(w);
      if (!s) return null;
      await s.connect({ ledger: true });
      return s.publicKey?.toString() || null;
    },
    icon: <SolflareLedgerIcon />,
  },
  {
    id: "backpack",
    name: "Backpack",
    downloadUrl: "https://backpack.app/",
    detected: (w) => {
      const b = getBackpack(w);
      return { found: !!b, confidence: b?.isBackpack ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const b = getBackpack(w);
      if (!b) return null;
      await b.connect();
      return b.publicKey?.toString() || null;
    },
    icon: <BackpackIcon />,
  },
  {
    id: "exodus",
    name: "Exodus",
    downloadUrl: "https://exodus.com/",
    detected: (w) => {
      const e = getExodus(w);
      return { found: !!e, confidence: e?.isExodus ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const e = getExodus(w);
      if (!e) return null;
      await e.connect();
      return e.publicKey?.toString() || null;
    },
    icon: <ExodusIcon />,
  },
  {
    id: "coin98",
    name: "Coin98",
    downloadUrl: "https://coin98.com/",
    detected: (w) => {
      const c = getCoin98(w);
      return { found: !!c, confidence: c?.isCoin98 ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const c = getCoin98(w);
      if (!c) return null;
      await c.connect();
      return c.publicKey?.toString() || null;
    },
    icon: <Coin98Icon />,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    downloadUrl: "https://trustwallet.com/",
    detected: (w) => {
      const t = getTrust(w);
      return { found: !!t, confidence: "MEDIUM" };
    },
    connect: async (w) => {
      const t = getTrust(w);
      if (!t) return null;
      await t.connect();
      return t.publicKey?.toString() || null;
    },
    icon: <TrustIcon />,
  },
  {
    id: "wallet_connect",
    name: "WalletConnect",
    downloadUrl: "https://walletconnect.com/",
    detected: (w) => {
      const wc = getWalletConnect(w);
      return { found: !!wc, confidence: "MEDIUM" };
    },
    connect: async (w) => {
      const wc = getWalletConnect(w);
      if (!wc) return null;
      try { await wc.connect(); } catch {}
      return (wc as any).publicKey?.toString() || (wc as any).accounts?.[0] || null;
    },
    icon: <WalletConnectIcon />,
  },
  {
    id: "glow",
    name: "Glow",
    downloadUrl: "https://glowwallet.io/",
    detected: (w) => {
      const g = getGlow(w);
      return { found: !!g, confidence: g?.isGlow ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const g = getGlow(w);
      if (!g) return null;
      await g.connect();
      return g.publicKey?.toString() || null;
    },
    icon: <GlowIcon />,
  },
  {
    id: "nightly",
    name: "Nightly",
    downloadUrl: "https://nightly.app/",
    detected: (w) => {
      const n = getNightly(w);
      return { found: !!n, confidence: n?.isNightly ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const n = getNightly(w);
      if (!n) return null;
      await n.connect();
      return n.publicKey?.toString() || null;
    },
    icon: <NightlyIcon />,
  },
  {
    id: "core",
    name: "Core",
    downloadUrl: "https://coredao.org/",
    detected: (w) => {
      const c = getCore(w);
      return { found: !!c, confidence: c?.isCore ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const c = getCore(w);
      if (!c) return null;
      await c.connect();
      return c.publicKey?.toString() || null;
    },
    icon: <CoreIcon />,
  },
  {
    id: "magiceden",
    name: "Magic Eden",
    downloadUrl: "https://magiceden.io/",
    detected: (w) => {
      const m = getMagicEden(w);
      return { found: !!m, confidence: "MEDIUM" };
    },
    connect: async (w) => {
      const m = getMagicEden(w);
      if (!m) return null;
      await m.connect();
      return m.publicKey?.toString() || null;
    },
    icon: <MagicEdenIcon />,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    downloadUrl: "https://ultimatewallet.io/",
    detected: (w) => {
      const u = getUltimate(w);
      return { found: !!u, confidence: u?.isUltimate ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const u = getUltimate(w);
      if (!u) return null;
      await u.connect();
      return u.publicKey?.toString() || null;
    },
    icon: <UltimateIcon />,
  },
  {
    id: "blade",
    name: "Blade",
    downloadUrl: "https://bladewallet.io/",
    detected: (w) => {
      const b = getBlade(w);
      return { found: !!b, confidence: b?.isBlade ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const b = getBlade(w);
      if (!b) return null;
      await b.connect();
      return b.publicKey?.toString() || null;
    },
    icon: <BladeIcon />,
  },
  {
    id: "bitkeep",
    name: "Bitget",
    downloadUrl: "https://bitget.com/",
    detected: (w) => {
      const bk = getBitkeep(w);
      return { found: !!bk, confidence: bk?.isBitKeep ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const bk = getBitkeep(w);
      if (!bk) return null;
      await bk.connect();
      return bk.publicKey?.toString() || null;
    },
    icon: <BitkeepIcon />,
  },
  {
    id: "solong",
    name: "Solong",
    downloadUrl: "https://solong.io/",
    detected: (w) => {
      const s = getSolong(w);
      return { found: !!s, confidence: s?.isSolong ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const s = getSolong(w);
      if (!s) return null;
      await s.connect();
      return s.publicKey?.toString() || null;
    },
    icon: <SolongIcon />,
  },
  {
    id: "math",
    name: "Math Wallet",
    downloadUrl: "https://mathwallet.org/",
    detected: (w) => {
      const m = getMath(w);
      return { found: !!m, confidence: m?.isMathWallet ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const m = getMath(w);
      if (!m) return null;
      await m.connect();
      return m.publicKey?.toString() || null;
    },
    icon: <MathIcon />,
  },
  {
    id: "tokenpocket",
    name: "TokenPocket",
    downloadUrl: "https://tokenpocket.pro/",
    detected: (w) => {
      const tp = getTokenPocket(w);
      return { found: !!tp, confidence: tp?.isTokenPocket ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const tp = getTokenPocket(w);
      if (!tp) return null;
      await tp.connect();
      return tp.publicKey?.toString() || null;
    },
    icon: <TokenPocketIcon />,
  },
  {
    id: "okx",
    name: "OKX",
    downloadUrl: "https://www.okx.com/web3",
    detected: (w) => {
      const o = getOKX(w);
      return { found: !!o, confidence: "MEDIUM" };
    },
    connect: async (w) => {
      const o = getOKX(w);
      if (!o) return null;
      await o.connect();
      return o.publicKey?.toString() || null;
    },
    icon: <OKXIcon />,
  },
  {
    id: "whale",
    name: "Whale",
    downloadUrl: "https://whalewallet.io/",
    detected: (w) => {
      const wh = getWhale(w);
      return { found: !!wh, confidence: wh?.isWhale ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const wh = getWhale(w);
      if (!wh) return null;
      await wh.connect();
      return wh.publicKey?.toString() || null;
    },
    icon: <WhaleIcon />,
  },
  {
    id: "sollet",
    name: "Sollet",
    downloadUrl: "https://sollet.io/",
    detected: (w) => {
      const sl = getSollet(w);
      return { found: !!sl, confidence: sl?.isSollet ? "HIGH" : "MEDIUM" };
    },
    connect: async (w) => {
      const sl = getSollet(w);
      if (!sl) return null;
      await sl.connect();
      return sl.publicKey?.toString() || null;
    },
    icon: <SolletIcon />,
  },
];

export function detectAllWallets(): DetectedWallet[] {
  return WALLET_DEFINITIONS.map((def) => {
    const { found, confidence } = def.detected(window);
    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      detected: found,
      confidence,
      downloadUrl: def.downloadUrl,
      connect: () => def.connect(window),
    };
  });
}

export function getWalletProvider(walletId: WalletId): any {
  switch (walletId) {
    case "phantom": return getPhantom(window);
    case "solflare": return getSolflare(window);
    case "backpack": return getBackpack(window);
    case "coin98": return getCoin98(window);
    case "exodus": return getExodus(window);
    case "trust": return getTrust(window);
    case "wallet_connect": return getWalletConnect(window);
    case "glow": return getGlow(window);
    case "nightly": return getNightly(window);
    case "blade": return getBlade(window);
    case "bitkeep": return getBitkeep(window);
    case "ultimate": return getUltimate(window);
    case "core": return getCore(window);
    case "solong": return getSolong(window);
    case "math": return getMath(window);
    case "tokenpocket": return getTokenPocket(window);
    case "okx": return getOKX(window);
    case "whale": return getWhale(window);
    case "sollet": return getSollet(window);
    case "magiceden": return getMagicEden(window);
    case "solflare_ledger": return getSolflare(window);
    default: return null;
  }
}