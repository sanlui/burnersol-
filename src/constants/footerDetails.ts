export const ORIGINAL_CHART_DATA = [
  { name: "Mon", Price: 0.0120 },
  { name: "Tue", Price: 0.0150 },
  { name: "Wed", Price: 0.0130 },
  { name: "Thu", Price: 0.0180 },
  { name: "Fri", Price: 0.0240 },
  { name: "Sat", Price: 0.0210 },
  { name: "Now", Price: 0.0324 },
];

interface FooterDetailEntry {
  title: string;
  subtitle: string;
  desc: string;
  points: string[];
}

export const FOOTER_DETAILS: Record<string, FooterDetailEntry> = {
  "sol-burner": {
    title: "FLAGSHIP SOL BURNER UTILITY",
    subtitle: "Account Pruning & State Rent Release Engineering",
    desc: "The primary utility of BurnerSOL scans and flags unused accounts, expired token mints, empty Associated Token Accounts (ATA), and orphaned metadata inside your Solana wallet. Each of these accounts locks storage rent which can be safely unlocked.",
    points: [
      "Enables instant State Rent recovery to your primary address.",
      "Reclaims exactly ~0.00203 SOL for every single pruned Associated Token Account.",
      "Backed by strict pre-execution safety and dry-run block simulations.",
      "Earns additional $BURNER token incentives as bonus protocol utility."
    ]
  },
  "rent-recovery": {
    title: "SOLANA RENT RECOVERY PIPELINE",
    subtitle: "Unlocking Dormant Cryptographic Capital",
    desc: "Recovering locked SOL from unused accounts is an optimal way to streamline your wallet. Many users unknowingly leave tens of dollars in SOL trapped in residual account structures created by old swaps.",
    points: [
      "Instant recovery with 100% on-chain transparency and zero waiting time.",
      "Non-custodial design: funds route straight back into your own self-custody wallet.",
      "Automatic discovery tool querying high-performance Solana RPC nodes.",
      "Reduces state bloat, contributing directly to network storage health."
    ]
  },
  "how-it-works": {
    title: "INSTRUCTION PROGRAM FLOW",
    subtitle: "Under-the-Hood Dynamics of Blockchain Rent",
    desc: "Solana requires accounts to lock up a small SOL deposit as collateral to occupy the blockchain's memory (rent exemption). When you sell all corresponding tokens, the structural state shell persists in locking your collateral.",
    points: [
      "The dApp queries the blockchain and discovers these empty skeletal units.",
      "Safe construction of closeAccount instructions prevents transaction conflicts.",
      "Dormant rent collateral is immediately dissolved and released to you.",
      "Get two-fold reward: reclaim real SOL and clean your active wallet."
    ]
  },
  "about-us": {
    title: "BURNERSOL TECHNOLOGICAL EDGE",
    subtitle: "Pioneers of Modern Decentralized Utilities",
    desc: "We are an engineering collective focused on building premium smart contract utilities. Our operational vision is to make complex Web3 structures accessible with highly secure, automated systems.",
    points: [
      "Dedicated block-storage developers committing to state efficiency.",
      "Advocates for clean, high-performance decentralized storage layers.",
      "Specialized in pre-execution transaction simulations and HUD interfaces.",
      "Over 5 million simulated transactions processed safely globally."
    ]
  },
  "faq": {
    title: "FREQUENTLY ASKED QUESTIONS (FAQ)",
    subtitle: "Instant Operational & Safety Information",
    desc: "Want to learn more about the technical details? Here are the ideal explanations covering safety, wallets, and standard blockchain workflows.",
    points: [
      "Is the dApp secure? Yes, it only constructs verified empty account closure transactions.",
      "Which wallets are supported? Phantom, Solflare, Backpack and all standard web3 providers.",
      "Are there any major costs? Only the basic Solana gas network fees (~0.000005 SOL).",
      "How much SOL do I get? ~0.00203 SOL per account is immediately unlocked upon approval."
    ]
  },
  "security": {
    title: "ENHANCED CRYPTOGRAPHIC SAFETY RIGOR",
    subtitle: "Standard Integrity with Pre-Execution Sandbox Checks",
    desc: "Your assets are covered under absolute fail-safe environments. Prior to any wallet signature call, the protocol executes multiple state validations to eliminate user error or data loss.",
    points: [
      "Transaction Dry-Run simulations expose the exact changes beforehand.",
      "Failsafe exclusion blocks closure instructions on anything with positive monetary value.",
      "Native Program Instructions: Uses official audited Solana System Program constructs only.",
      "Seed Separation: Absolute zero custody. Your keys remain fully sealed inside your chosen wallet API."
    ]
  },
  "contacts": {
    title: "TECHNICAL COMMUNICATIONS CORE",
    subtitle: "Active Operations & Community Access Hub",
    desc: "We are always responsive to user feedback, technical queries, and feature suggestions. Feel free to contact us through any of our operational hubs.",
    points: [
      "Official Developer Email Desk: support@burnersol.io",
      "Live technical updates & community reviews available via Discord servers.",
      "Daily status posts and optimization stats published on X.com.",
      "Open GitHub repository discussions for reporting UI glitches or script errors."
    ]
  },
  "terms": {
    title: "TERMS & CONDITIONS OF SERVICE",
    subtitle: "Legal Directives for On-Chain Protocol Use",
    desc: "Using BurnerSOL constitutes active agreement with the technical standards, user responsibilities, and structural behaviors of Web3 applications.",
    points: [
      "Irreversibility: Signed on-chain state clearance procedures are forever permanent by network design.",
      "Self-Custody Responsibility: You hold complete visual selection and transaction signing control.",
      "Utility Purpose: The protocol is engineered for state cleanup and rent-exemption recovery.",
      "RPC Reliability: Transaction estimates reflect live, non-binding Solana block metrics."
    ]
  },
  "privacy": {
    title: "DECENTRALIZED PRIVACY & CORE ALIGNMENT",
    subtitle: "Absolute Zero-Data Harvesting Manifesto",
    desc: "We prioritize cryptographically secure anonymity. We do not index personal identifiers, cookies, or telemetry to centralized databases.",
    points: [
      "Zero monitoring of user IP logs, cookies, trackers, or system characteristics.",
      "No email registers or credentials: your standard public key represents your workspace context.",
      "Only native blockchain queries to verified public node endpoints are executed.",
      "Strictly free from advertising networks, customer profile sales, and analytical tracking pixels."
    ]
  },
  "resources": {
    title: "RESOURCES & COMMUNITY",
    subtitle: "Official Channels & Developer Hub",
    desc: "Access BurnerSOL's operational resources, community channels, and technical documentation. Stay connected with the latest updates, contribute to the open-source repository, and engage with the developer community.",
    points: [
      "Open GitHub repository for source code, issue tracking, and pull requests.",
      "Official Discord server for real-time community support and developer chat.",
      "X.com for daily status updates, protocol announcements, and security alerts.",
      "Technical documentation and API references for integrators and builders."
    ]
  }
};