# BurnerSol Protocol — Complete Audit Report

---

# DELIVERABLE 1: Architecture Overview

## 1.1 System Identity

**Name:** BurnerSol Protocol  
**Tagline:** "Clean Your Wallet. Burn the Trash. Reclaim Your SOL."  
**Purpose:** A Solana wallet cleanup dApp that scans wallets for spam/low-value tokens, allows users to burn them (close token accounts), and reclaim SOL rent. Includes an AI-powered burn chat (Gemini), a simulated global burn feed, and a fake swap terminal.

## 1.2 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.x |
| Build Tool | Vite | 6.x |
| CSS | TailwindCSS | 4.x |
| Backend | Express.js | 4.x (ts-node/esm) |
| AI | Google Gemini | @google/genai |
| Blockchain | @solana/web3.js | 1.x |
| Wallet | @solana/wallet-adapter | react-ui + wallet-adapter-base + wallet-adapter-wallets |
| Charts | Recharts | 2.x |
| Animation | canvas-confetti | 1.x |
| Deployment | Vercel (serverless functions + SPA) | — |

## 1.3 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (SPA)                            │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ App.tsx  │  │ScannerTerminal│  │SwapTerminal │  │GlobalBurn│ │
│  │(orchestr.)│  │  (scan/burn) │  │  (fake swap)│  │  Feed    │ │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘  └────┬─────┘ │
│       │               │                 │              │        │
│  ┌────┴───────────────┴─────────────────┴──────────────┴─────┐ │
│  │                    Utility Layer                          │ │
│  │  solana.ts │ riskEngine.ts │ transactionSafety.ts │       │ │
│  │  sanitizeExternalData.ts │ marketData.ts │ audio.ts │    │ │
│  │  burnPreview.ts │ burnHistory.ts │ imageFallback.ts │     │ │
│  └────────────────────────┬──────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────┴──────────────────────────────────┐ │
│  │          SolanaWalletProvider (Context)                    │ │
│  │   Dynamic import wallet-adapter, SSR fallback (5s)       │ │
│  └────────────────────────┬──────────────────────────────────┘ │
└────────────────────────────┼──────────────────────────────────┘
                             │ HTTPS
          ┌──────────────────┼──────────────────────┐
          │                  │                      │
┌─────────▼──────┐  ┌───────▼────────┐  ┌──────────▼─────────┐
│  Vercel        │  │  Express       │  │  Solana RPC        │
│  Serverless    │  │  server.ts     │  │  (Alchemy/Helius/  │
│  Functions     │  │  (dev/prod)    │  │   public)          │
│                │  │                │  │                    │
│ /api/solana/   │  │ /api/burn/chat │  │  getAccountInfo    │
│   scan         │  │ /api/burn/     │  │  getTokenAccounts  │
│   recent-txs   │  │   preview      │  │  getRecentBlockhash│
│   gas-fee      │  │ Rate limiter   │  │  sendTransaction   │
│ /api/burn/     │  │ CSP headers    │  │  simulateTransaction│
│   preview      │  │ Gemini AI      │  │                    │
│   history      │  │                │  │                    │
└────────────────┘  └───────┬────────┘  └────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Google Gemini │
                    │  AI API        │
                    │  (burn chat)   │
                    └────────────────┘
```

## 1.4 Deployment Architecture

```
Production (Vercel):
├── /api/**          → Vercel Serverless Functions (Node.js)
├── /assets/**       → Static (1yr cache, immutable)
├── /*               → SPA fallback (index.html)
└── /public/**       → Static i18n HTML pages (pt, ko, tr, zh, es, ja, de, fr, hi, ru)

Development (local):
├── scripts/dev-server.mjs → Express + Vite middleware mode
└── server.ts → ts-node/esm (PORT 3001)
```

## 1.5 Directory Structure

```
BURN-main-main/
├── api/                          # Vercel serverless functions
│   ├── solana/
│   │   ├── scan.js               # Wallet token scanner
│   │   ├── recent-txs.js         # Recent burn transactions
│   │   └── gas-fee.js            # Prioritization fee estimate
│   └── burn/
│       ├── preview.js            # Burn preview calculation
│       └── history.js            # Burn history lookup
├── public/                       # Static assets
│   ├── token-metadata.json       # BURN token metadata
│   ├── token-logo.png            # Token logo
│   ├── sitemap.xml               # SEO sitemap
│   ├── robots.txt                # SEO robots
│   └── {pt,ko,tr,zh,es,ja,de,fr,hi,ru}/  # Pre-rendered i18n pages
├── scripts/                      # Utility scripts
│   ├── dev-server.mjs            # Local dev server
│   ├── verify-token-authorities.mjs  # Token authority verifier
│   ├── token-preflight.mjs       # Token metadata validator
│   └── estimate-token-cost.mjs   # Token creation cost estimator
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Main app (orchestrator)
│   ├── index.css                 # Global styles (Tailwind v4)
│   ├── types.ts                  # TypeScript type definitions
│   ├── constants/
│   │   └── footerDetails.ts      # Localized footer content
│   ├── components/
│   │   ├── ScannerTerminal.tsx    # Core scanning/burning UI
│   │   ├── CombustionChamber.tsx # Canvas particle animation
│   │   ├── GlobalBurnFeed.tsx    # Live burn feed (simulated)
│   │   ├── SwapTerminal.tsx      # Fake swap terminal
│   │   ├── Header.tsx            # Navigation header
│   │   ├── Footer.tsx            # Footer component
│   │   ├── FooterHUD.tsx         # HUD with stats (i18n bug)
│   │   ├── BurnSuccessModal.tsx  # Post-burn success modal
│   │   ├── WalletConnector.tsx   # Wallet connect button
│   │   ├── ResilientImage.tsx    # Image with fallback/cache
│   │   └── TokenDistributionChart.tsx  # Allocation pie chart
│   ├── providers/
│   │   └── SolanaWalletProvider.tsx  # Wallet adapter context
│   └── utils/
│       ├── solana.ts             # RPC connection layer
│       ├── riskEngine.ts         # Risk scoring engine
│       ├── transactionSafety.ts  # Transaction validation
│       ├── sanitizeExternalData.ts # Input sanitization
│       ├── marketData.ts         # Token price data
│       ├── burnPreview.ts        # Burn preview calculations
│       ├── burnHistory.ts        # localStorage burn history
│       ├── audio.ts              # Web Audio synthesizer
│       └── imageFallback.ts      # Image fallback handler
├── server.ts                     # Express backend (Gemini AI)
├── index.html                    # SPA entry (SEO, polyfills)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite build config
├── vercel.json                   # Deployment config
├── SECURITY.md                   # Security policy
├── TOKENOMICS.md                  # Token economics spec
├── .env.example                   # Environment variable template
└── .gitignore                     # Git ignore rules
```

## 1.6 Key Architectural Patterns

| Pattern | Implementation | Location |
|---|---|---|
| Context Provider | SolanaWalletProvider wraps | `src/providers/SolanaWalletProvider.tsx` |
| Monolithic Orchestrator | App.tsx holds all state + burn logic | `src/App.tsx` |
| Serverless API Routes | Vercel /api/ functions | `api/**/*.js` |
| Express + Vite Dev | Custom dev-server.mjs | `scripts/dev-server.mjs` |
| Dual Backend | Express server.ts + Vercel functions | Production vs Dev divergence |
| LRU Cache | Image fallback cache | `src/utils/imageFallback.ts` |
| localStorage Persistence | Burn history | `src/utils/burnHistory.ts` |
| Risk Scoring | Weighted category engine | `src/utils/riskEngine.ts` |
| Program Whitelist | Transaction safety | `src/utils/transactionSafety.ts` |
| Rate Limiting | In-memory Express middleware | `server.ts` |
| Gemini AI Integration | Burn chat feature | `server.ts` |
| CSP Headers | Express middleware | `server.ts` |
| Dynamic Import | Wallet adapter with SSR fallback | `SolanaWalletProvider.tsx` |

## 1.7 Critical Architecture Issues

1. **Dual Backend Divergence:** `server.ts` (Express for Gemini AI, burn chat, rate limiting) vs `api/` (Vercel serverless functions for Solana RPC). Both exist in production but serve different routes. The dev server (`scripts/dev-server.mjs`) only mounts the `api/` routes, not the Express `server.ts` routes — meaning burn chat and Gemini features are absent in local dev.

2. **Monolithic App.tsx:** ~700+ lines containing all state management, burn orchestration, confetti triggers, AI chat integration, and UI routing. This is the single point of failure for the entire frontend.

3. **Hardcoded API Keys in Source:** Alchemy key `XhvbwzXZcW2UhCcCj5cC1` and Helius key `228a6dca-c288-4f6a-b85c-23561fb9e946` are hardcoded in `solana.ts`, duplicated in every `api/` file, and used in `server.ts`. These should be environment variables.

4. **Fake vs Real Feature Mixing:** SwapTerminal claims "SECURED BY JUPITER AGGREGATOR" but uses a hardcoded exchange rate. GlobalBurnFeed mixes simulated feed data with real user burn history. This creates user trust issues.

5. **No Shared API Utilities:** Every `api/` file independently re-declares `fetchWithRetry`, `rpcCallWithRetry`, RPC URLs, and API keys. No shared module across serverless functions.

---

# DELIVERABLE 2: System Flow Analysis

## 2.1 User Journey: Connect → Scan → Burn → Success

```
User Opens App
       │
       ▼
  index.html loads
  - Sandbox polyfill patch applied
  - SEO meta tags rendered
  - React app hydrates
       │
       ▼
  App.tsx mounts
  - SolanaWalletProvider wraps app
  - Header renders WalletConnector
  - ScannerTerminal renders idle state
  - GlobalBurnFeed starts simulating
       │
       ▼
  User clicks "Connect Wallet"
       │
       ▼
  SolanaWalletProvider activates
  - Dynamic import of wallet-adapter
  - If fails, 5s setTimeout fallback
  - Wallet modal appears
  - User selects wallet (Phantom, Solflare, etc.)
       │
       ▼
  App.tsx detects wallet connection
  - Triggers scan via solana.ts RPC calls
  - OR calls /api/solana/scan (Vercel function)
       │
       ▼
  ScannerTerminal displays results
  - Hardcoded demo trash items shown first
  - Real RPC results merged in
  - riskEngine.ts scores each token
  - transactionSafety.ts validates programs
  - Items sorted by risk (CRITICAL → LOW)
       │
       ▼
  User selects items to burn
  - Checkboxes on trash items
  - burnPreview.ts calculates:
      - Estimated SOL recovery
      - Protocol fee (8% standard, 6% BURN lock)
      - Net recovery amount
       │
       ▼
  User clicks "BURN SELECTED"
       │
       ▼
  App.tsx burnModal state activates
  - CombustionChamber canvas animation starts
  - Audio synth plays furnace roar
  - Transaction constructed:
      - Create CloseAccount instructions
      - transactionSafety.ts simulates first
      - If simulation passes, send to wallet
       │
       ▼
  Wallet prompts signature
       │
       ├── FAIL → Transaction rejected
       │         - Error message shown
       │         - Audio: error sound
       │
       └── SUCCESS → Transaction confirmed
                 - CombustionChamber particle burst
                 - canvas-confetti fires
                 - Audio: success chime
                 - BurnSuccessModal appears
                 - burnHistory.ts saves to localStorage
                 - GlobalBurnFeed updates
                 - Confetti animation
       │
       ▼
  User views burn history
  - burnHistory reads from localStorage
  - Displayed in ScannerTerminal
```

## 2.2 RPC Call Flow

```
Client (solana.ts)                    Solana RPC
       │                                  │
       │  getConnection()                 │
       ├──► getEndpoint() ───────────────►│
       │   (Alchemy → Helius → public)    │
       │                                  │
       │  getTokenAccounts(wallet)        │
       ├──► fetchWithRetry() ────────────►│
       │   retry: 3, backoff: 500ms       │
       │                                  │
       │  filterZeroBalance()             │
       ├──► Local filtering               │
       │                                  │
       │  getAccountInfo(token)           │
       ├──► rpcCallWithRetry() ───────────►│
       │   throttle: 300ms between calls  │
       │   dedup: in-flight deduplication │
       │                                  │
       │  Result → riskEngine.score()     │
       │  Result → transactionSafety      │
       │  Result → marketData enrichment  │
```

## 2.3 API Route Flow (Vercel Serverless)

```
/api/solana/scan
  → Receives wallet address
  → Calls Helius/Alchemy RPC (hardcoded keys)
  → Returns token accounts + metadata
  
/api/solana/recent-txs
  → Fetches recent burn transactions
  → Returns transaction signatures + details

/api/solana/gas-fee
  → Calls getRecentBlockhash + getFeeCalculator
  → Returns prioritization fee estimate

/api/burn/preview
  → Server-side burn preview calculation
  → Returns estimated recovery, fees, net

/api/burn/history
  → Looks up historical burn data
  → Returns aggregated burn statistics
```

## 2.4 Gemini AI Chat Flow

```
User types burn question
       │
       ▼
App.tsx sends POST /api/burn/chat
  - Message body: user question
  - Rate limiter checks (100 req/15min)
       │
       ▼
server.ts forwards to Gemini API
  - GEMINI_API_KEY from env
  - System prompt: burn protocol context
       │
       ▼
Gemini responds
  - AI-generated burn insights
  - Token risk analysis
  - Burning recommendations
       │
       ▼
Response streamed back to client
  - Displayed in App.tsx chat UI
```

## 2.5 Data Flow Summary

```
┌────────────────────────────────────────────────────┐
│                    DATA SOURCES                     │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Solana   │  │ Gemini   │  │ localStorage     │ │
│  │ RPC      │  │ AI API   │  │ (burn history,   │ │
│  │ (tokens, │  │ (burn    │  │  image cache,    │ │
│  │  txs,    │  │  chat)   │  │  wallet prefs)   │ │
│  │  fees)   │  │          │  │                  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────────────┘ │
│       │             │             │                │
│  ┌────▼─────────────▼─────────────▼─────────────┐ │
│  │              App.tsx State                    │ │
│  │  - wallet address                            │ │
│  │  - scanned items                             │ │
│  │  - selected items                            │ │
│  │  - burn results                              │ │
│  │  - chat messages                             │ │
│  │  - burn ledger                               │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

## 2.6 Failure Modes

| Failure | Impact | Handling |
|---|---|---|
| RPC endpoint down | No scanning/burning | Fallback to next RPC (Alchemy→Helius→public) |
| Wallet not installed | No connection | WalletConnector shows install prompt |
| Gemini API key missing | No AI chat | server.ts returns 500 |
| localStorage full | No burn history | Silent failure, no migration |
| Vercel function timeout (>10s) | API route fails | No retry on client side for API routes |
| Rate limit hit | Burn chat blocked | 429 response, no user-facing message |
| Token account already closed | Burn fails | transactionSafety simulation catches this |
| Transaction simulation fails | Burn blocked | Error shown to user |
| Wallet adapter dynamic import fails | No wallet | 5s setTimeout fallback attempt |
| Canvas API unavailable | No CombustionChamber | Silent degradation |

---

# DELIVERABLE 3: File-by-File Documentation

## Entry & Configuration Files

### `index.html`
- **Purpose:** SPA entry point, SEO metadata hub, polyfill patch
- **Architecture Role:** The first HTML delivered to browsers. Contains JSON-LD structured data, Open Graph tags, hreflang alternates, and an extensive sandbox polyfill patch for browser compatibility
- **Dependencies:** Vite injects scripts; Google Fonts loaded externally (Press Start 2P, Orbitron, Share Tech Mono)
- **Bugs:** Sandbox polyfill patch (~60 lines) is a workaround for browser sandbox issues — fragile and may break with browser updates
- **Tech Debt:** Pre-rendered i18n pages in public/ are English content with only `lang` attribute changed — not actual translations
- **Security:** No integrity checks on external font/style CDN loads

### `package.json`
- **Purpose:** Project manifest, dependencies, scripts
- **Architecture Role:** Defines all deps (React 19, Solana wallet adapters, Express, Gemini SDK, Recharts, canvas-confetti)
- **Key Scripts:** `dev` (vite), `build` (vite build), `start` (ts-node server.ts), `preview` (vite preview)
- **Bugs:** Dev script runs Vite directly, not `dev-server.mjs` — so API routes and Gemini features aren't available in dev
- **Tech Debt:** `@solana/wallet-adapter-wallets` is deprecated (use `@solana/wallet-adapter-wallets` v1 or individual adapter packages)

### `tsconfig.json`
- **Purpose:** TypeScript configuration
- **Architecture Role:** Enables strict mode, ES2022 target, JSX preserve for Vite
- **Notable:** Uses `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`

### `vite.config.ts`
- **Purpose:** Vite build configuration
- **Architecture Role:** Configures React plugin, dev server port (5173), HMR
- **Notable:** Clean build output, sourcemaps disabled for production

### `vercel.json`
- **Purpose:** Vercel deployment configuration
- **Architecture Role:** Routes configuration, caching headers
- **Key:** `/assets/**` cached 1yr immutable, SPA fallback for all routes
- **Tech Debt:** No caching headers for API routes

### `.env.example`
- **Purpose:** Environment variable template
- **Architecture Role:** Documents required env vars (VITE_ALCHEMY_KEY, VITE_HELIUS_KEY, GEMINI_API_KEY, SOLANA_RPC_URL)
- **Critical Issue:** Keys listed in .env.example are ALSO hardcoded in source code

## Backend Files

### `server.ts` (~200 lines)
- **Purpose:** Express backend server with Gemini AI integration
- **Architecture Role:** Provides /api/burn/chat (AI chat), /api/burn/preview (server-side burn calculation), rate limiting, CSP headers
- **Dependencies:** express, @google/genai, cors, dotenv
- **Interactions:** Called as `npm run start` — runs on PORT 3001; NOT used by Vercel deployment (Vercel uses api/ functions)
- **Bugs:**
  - Hardcoded Helius API key `228a6dca-c288-4f6a-b85c-23561fb9e946`
  - CSP includes `script-src 'unsafe-inline' 'unsafe-eval'` — negates XSS protection
  - In-memory rate limiter resets on every deploy/restart
  - Gemini API key read from env but RPC keys hardcoded
- **Tech Debt:** No authentication on API endpoints; no request validation schema
- **Security:** Rate limiting (100 req/15min) is trivially bypassable; CSP is permissive

### `api/solana/scan.js`
- **Purpose:** Vercel serverless function for wallet token scanning
- **Architecture Role:** Server-side wallet scanning via Helius/Alchemy RPC
- **Dependencies:** @solana/web3.js (bundled)
- **Bugs:**
  - Hardcoded Alchemy key `XhvbwzXZcW2UhCcCj5cC1`
  - Hardcoded Helius key `228a6dca-c288-4f6a-b85c-23561fb9e946`
  - Duplicates `fetchWithRetry` and `rpcCallWithRetry` (also in scan.js, recent-txs.js, gas-fee.js, solana.ts)
- **Tech Debt:** No input validation on wallet address parameter
- **Security:** API keys exposed in source; no rate limiting on serverless functions

### `api/solana/recent-txs.js`
- **Purpose:** Vercel serverless function for recent burn transaction lookup
- **Architecture Role:** Provides recent burn activity data for GlobalBurnFeed
- **Dependencies:** @solana/web3.js
- **Bugs:** Same hardcoded keys; same duplicated utility functions
- **Tech Debt:** No pagination; returns fixed number of transactions

### `api/solana/gas-fee.js`
- **Purpose:** Vercel serverless function for prioritization fee estimation
- **Architecture Role:** Provides gas fee estimates for burn transactions
- **Dependencies:** @solana/web3.js
- **Bugs:** Same hardcoded keys; same duplicated utility functions
- **Tech Debt:** Returns static/fallback fee if RPC fails — no clear indication to client

### `api/burn/preview.js`
- **Purpose:** Vercel serverless function for server-side burn preview
- **Architecture Role:** Calculates burn recovery estimates server-side
- **Dependencies:** @solana/web3.js
- **Bugs:** Same hardcoded keys; same duplicated utility functions
- **Tech Debt:** Duplicates logic from client-side `burnPreview.ts`

### `api/burn/history.js`
- **Purpose:** Vercel serverless function for burn history lookup
- **Architecture Role:** Provides on-chain burn history data
- **Dependencies:** @solana/web3.js
- **Bugs:** Same hardcoded keys; same duplicated utility functions
- **Tech Debt:** No caching; queries on-chain data per request

## Frontend Entry Files

### `src/main.tsx`
- **Purpose:** React entry point
- **Architecture Role:** Mounts <App /> into #root div
- **Dependencies:** React 19, ReactDOM, App.tsx, index.css
- **Notable:** Minimal — just render

### `src/index.css`
- **Purpose:** Global styles via TailwindCSS v4
- **Architecture Role:** Defines theme variables, animations (burn-glow, scan-line, fade-in, pulse, float, burn-flicker, etc.), custom scrollbar, terminal CRT effects
- **Notable:** Extensive animation definitions; Tailwind v4 @theme tokens; CRT scan-line overlay effect

### `src/types.ts`
- **Purpose:** TypeScript type definitions
- **Architecture Role:** Defines `TrashItem` interface (the core data model for burnable items)
- **Key Types:** TrashItem { mint, name, symbol, balance, decimals, risk, usdValue, category, logo, account, programId, closeInstruction, ca, recoverableSol }
- **Tech Debt:** No discriminated unions; no branded types for wallet addresses

## Core Components

### `src/App.tsx` (~700+ lines)
- **Purpose:** Main application orchestrator
- **Architecture Role:** THE monolithic component. Holds ALL state, burn orchestration, confetti, AI chat, ledger management, wallet detection, UI routing
- **Dependencies:** Every component, every utility, canvas-confetti, React state
- **Interactions:**
  - Manages wallet connection state
  - Triggers scanning via solana.ts
  - Orchestrates burn flow (select → preview → execute → success)
  - Integrates Gemini AI chat (POST to /api/burn/chat)
  - Manages burn ledger (localStorage via burnHistory.ts)
  - Fires confetti + audio on success
  - Renders ScannerTerminal, CombustionChamber, GlobalBurnFeed, BurnSuccessModal
- **Bugs:**
  - Monolithic — impossible to unit test
  - Mixed concerns (state + business logic + UI in one file)
  - AI chat feature has no error boundary
  - No memoization on expensive computations
- **Tech Debt:** Should be decomposed into: StateProvider, BurnOrchestrator, ChatInterface, UIController
- **Security:** AI chat responses rendered without strict sanitization

### `src/components/ScannerTerminal.tsx` (~1000+ lines)
- **Purpose:** Core scanning and burning UI
- **Architecture Role:** The primary user interface. Displays wallet scan results, risk assessments, item selection, and burn initiation
- **Dependencies:** solana.ts, riskEngine.ts, transactionSafety.ts, burnPreview.ts, marketData.ts, audio.ts, App.tsx (via props)
- **Interactions:**
  - Receives wallet address and triggers scan
  - Displays hardcoded demo trash items initially
  - Merges real RPC scan results
  - Shows risk labels (CRITICAL, HIGH, MEDIUM, LOW, INFO)
  - Manages item selection (checkboxes)
  - Plays audio feedback on interactions
- **Bugs:**
  - Hardcoded demo items ("DeFi Dinosaur", "Spam Airdrop #1337", etc.) are always shown regardless of real scan results — users may try to "burn" fake items
  - Sizing is enormous — should be split into: ScanResults, ItemCard, RiskBadge, SelectionPanel
- **Tech Debt:** No virtualization for large token lists; hardcoded demo data mixed with real data
- **Performance:** Re-renders entire list on any selection change

### `src/components/GlobalBurnFeed.tsx`
- **Purpose:** Live burn activity feed
- **Architecture Role:** Displays simulated global burn activity + real user burn history
- **Dependencies:** burnHistory.ts, App.tsx (via props)
- **Interactions:** Generates fake feed entries on interval; reads real burn history from localStorage
- **Bugs:** Fake feed entries are indistinguishable from real user burns — misleading users into thinking there's more activity than reality
- **Tech Debt:** No WebSocket or real-time data; all simulated with `setInterval`
- **Security:** No distinction between simulated and real data (trust issue)

### `src/components/SwapTerminal.tsx`
- **Purpose:** Token swap interface (FAKE)
- **Architecture Role:** Displays swap UI with hardcoded exchange rate
- **Dependencies:** None (no real swap integration)
- **Bugs:** 
  - Claims "SECURED BY JUPITER AGGREGATOR" but has NO Jupiter integration
  - Hardcoded rate: 1 SOL = 45,000 BURNER
  - Fake slippage protection
  - Could mislead users into thinking swaps are real
- **Tech Debt:** Entire component is decorative/fake — misleading
- **Security:** Fraud risk — users may believe they're executing real swaps

### `src/components/CombustionChamber.tsx`
- **Purpose:** Canvas-based particle animation
- **Architecture Role:** Provides visual burn effect with particles, flames, and embers
- **Dependencies:** HTML5 Canvas API
- **Interactions:** Activated by App.tsx during burn flow; renders particles based on burn state
- **Bugs:** No canvas cleanup on unmount (potential memory leak)
- **Tech Debt:** requestAnimationFrame loop not cancelled properly
- **Performance:** Canvas redraws every frame — no optimization for idle state

### `src/components/Header.tsx`
- **Purpose:** Navigation header with branding
- **Architecture Role:** Top-level navigation and branding
- **Dependencies:** WalletConnector component
- **Notable:** Minimal, no significant issues

### `src/components/Footer.tsx`
- **Purpose:** Page footer with links
- **Architecture Role:** Standard footer component
- **Dependencies:** footerDetails.ts constants
- **Notable:** Minimal, no significant issues

### `src/components/FooterHUD.tsx`
- **Purpose:** HUD dashboard with protocol stats
- **Architecture Role:** Displays protocol statistics (total burned, SOL recovered, etc.)
- **Dependencies:** footerDetails.ts
- **Bugs:** Language fallback defaults to Italian (`'it'`) when current language is NOT Italian — all non-Italian locales get Italian text instead of English
- **Tech Debt:** Only supports English and Italian; hardcoded stats

### `src/components/BurnSuccessModal.tsx`
- **Purpose:** Post-burn success overlay
- **Architecture Role:** Displays after successful burn transaction with confetti
- **Dependencies:** canvas-confetti, App.tsx (via props)
- **Notable:** No significant issues beyond styling

### `src/components/WalletConnector.tsx`
- **Purpose:** Wallet connection button
- **Architecture Role:** Wraps @solana/wallet-adapter React UI
- **Dependencies:** @solana/wallet-adapter-react-ui
- **Notable:** Minimal wrapper, no significant issues

### `src/components/ResilientImage.tsx`
- **Purpose:** Image component with fallback and caching
- **Architecture Role:** Loads token logos with graceful fallback for broken URLs
- **Dependencies:** imageFallback.ts
- **Interactions:** Uses LRU cache + localStorage for previously resolved images
- **Bugs:** localStorage writes on every image load (performance concern)
- **Tech Debt:** LRU cache size is unbounded; no eviction policy for localStorage

### `src/components/TokenDistributionChart.tsx`
- **Purpose:** Token allocation pie chart
- **Architecture Role:** Visualizes BURN token allocation from TOKENOMICS.md
- **Dependencies:** Recharts (PieChart, Pie, Cell, Tooltip)
- **Bugs:** Some Italian text remnants in chart labels
- **Tech Debt:** Chart data is hardcoded, not from TOKENOMICS.md or API

## Providers

### `src/providers/SolanaWalletProvider.tsx`
- **Purpose:** Wallet adapter context provider
- **Architecture Role:** Wraps entire app with Solana wallet adapter context, enabling wallet connection
- **Dependencies:** @solana/wallet-adapter-base, @solana/wallet-adapter-react, @solana/wallet-adapter-react-ui, @solana/wallet-adapter-wallets
- **Interactions:** Dynamic imports wallet adapter libraries with 5s setTimeout fallback
- **Bugs:** 
  - Dynamic import with setTimeout fallback is fragile
  - SSR/hydration safety achieved through delayed rendering
  - If dynamic import fails and setTimeout fallback also fails, wallet never loads
- **Tech Debt:** Uses deprecated `@solana/wallet-adapter-wallets` package
- **Performance:** 5s delay before fallback activation — users may see blank state

## Utility Files

### `src/utils/solana.ts`
- **Purpose:** Solana RPC connection layer
- **Architecture Role:** Central RPC interaction layer with retry logic, throttling, endpoint failover
- **Dependencies:** @solana/web3.js
- **Interactions:** Used by ScannerTerminal, App.tsx, burnPreview, transactionSafety
- **Bugs:**
  - **CRITICAL:** Hardcoded Alchemy key `XhvbwzXZcW2UhCcCj5cC1`
  - **CRITICAL:** Hardcoded Helius key `228a6dca-c288-4f6a-b85c-23561fb9e946`
  - Endpoint failover order: Alchemy → Helius → public RPC
- **Tech Debt:** `fetchWithRetry` and `rpcCallWithRetry` are duplicated in every api/ file
- **Security:** API keys should be in environment variables, never in client-side code
- **Performance:** Throttling at 300ms between calls; deduplication for in-flight requests

### `src/utils/riskEngine.ts`
- **Purpose:** Risk scoring engine for token assessment
- **Architecture Role:** Assigns risk levels (CRITICAL, HIGH, MEDIUM, LOW, INFO) to tokens based on weighted category scores
- **Dependencies:** None (pure functions)
- **Interactions:** Called by ScannerTerminal for each scanned token
- **Notable:** Well-structured weighted scoring system; dynamic fee calculation
- **Tech Debt:** Weight values are magic numbers; no configuration

### `src/utils/transactionSafety.ts`
- **Purpose:** Transaction validation and simulation
- **Architecture Role:** Pre-flight transaction safety checks — program ID whitelist, simulation, instruction validation
- **Dependencies:** @solana/web3.js
- **Interactions:** Called before any burn transaction is sent to wallet
- **Notable:** Good security practice — simulates before sending
- **Tech Debt:** Program whitelist may become outdated; no auto-update mechanism

### `src/utils/sanitizeExternalData.ts`
- **Purpose:** Input sanitization for external data
- **Architecture Role:** Strips HTML, validates URLs, clamps prices, sanitizes token names
- **Dependencies:** None (pure functions)
- **Interactions:** Used when processing RPC responses and API data
- **Notable:** Good defensive programming
- **Tech Debt:** No schema validation (zod/joi) — only ad-hoc sanitization

### `src/utils/marketData.ts`
- **Purpose:** Token price/market data fetching
- **Architecture Role:** Provides USD value estimates for tokens
- **Dependencies:** Fetch API (external price oracles)
- **Interactions:** Used by riskEngine and ScannerTerminal for USD values
- **Tech Debt:** No caching; stale price data; no fallback for failed price fetch

### `src/utils/burnPreview.ts`
- **Purpose:** Client-side burn preview calculations
- **Architecture Role:** Estimates SOL recovery, protocol fees, net return before burning
- **Dependencies:** solana.ts (for rent exemption data)
- **Interactions:** Called by App.tsx/ScannerTerminal when user selects items
- **Bugs:** Duplicates server-side logic in api/burn/preview.js
- **Tech Debt:** Fee percentages hardcoded (8%, 6%, 5%) — should match TOKENOMICS.md

### `src/utils/burnHistory.ts`
- **Purpose:** Burn history persistence via localStorage
- **Architecture Role:** Saves and retrieves burn transaction history from localStorage
- **Dependencies:** localStorage API
- **Interactions:** Written by App.tsx on burn success; read by GlobalBurnFeed
- **Bugs:**
  - No encryption on stored data
  - No validation on read (corrupt data crashes)
  - No size limits — localStorage quota exceeded silently
  - No migration strategy for schema changes
- **Security:** Anyone with browser access can modify burn history; no integrity checks

### `src/utils/audio.ts`
- **Purpose:** Web Audio API synthesizer
- **Architecture Role:** Generates sound effects (hover plucks, furnace roars, success chimes) without audio files
- **Dependencies:** Web Audio API
- **Interactions:** Called by ScannerTerminal and App.tsx for audio feedback
- **Bugs:** No cleanup of AudioContext on unmount (browser limits number of contexts)
- **Tech Debt:** AudioContext created per-call rather than singleton

### `src/utils/imageFallback.ts`
- **Purpose:** Image fallback and LRU cache handler
- **Architecture Role:** Provides fallback URLs for failed token logo images; manages LRU cache
- **Dependencies:** localStorage (for persisted cache)
- **Interactions:** Used by ResilientImage.tsx
- **Bugs:** No size limit on localStorage cache
- **Tech Debt:** LRU implementation is naive — full scan on eviction

## Constants

### `src/constants/footerDetails.ts`
- **Purpose:** Localized footer content and chart data
- **Architecture Role:** Provides English and Italian translations for footer, HUD stats, and chart configuration
- **Bugs:** Only en/it supported; Italian used as fallback incorrectly
- **Tech Debt:** Should use i18n library instead of manual objects

## Scripts

### `scripts/dev-server.mjs`
- **Purpose:** Local development server combining Express + Vite
- **Architecture Role:** Runs Express with Vite middleware for local dev (PORT 3000)
- **Bugs:** Only mounts api/ routes — NOT server.ts routes (no Gemini AI, no burn chat in local dev)
- **Tech Debt:** Diverges from production architecture

### `scripts/verify-token-authorities.mjs`
- **Purpose:** On-chain token authority verification
- **Architecture Role:** Pre-launch security script — verifies mint/freeze authorities are revoked
- **Dependencies:** @solana/web3.js, @solana/spl-token
- **Notable:** Good security practice; exit code 1 on failure

### `scripts/token-preflight.mjs`
- **Purpose:** Token metadata and tokenomics validation
- **Architecture Role:** Pre-launch checklist — validates metadata, logo, risk language
- **Dependencies:** Node.js fs
- **Notable:** Good compliance check; validates risk language presence

### `scripts/estimate-token-cost.mjs`
- **Purpose:** Token creation cost estimation
- **Architecture Role:** Pre-launch utility — estimates SOL needed for mint + metadata
- **Dependencies:** Solana RPC (fetch)
- **Notable:** Offline fallback estimates if RPC unavailable; safety buffer included

---

# DELIVERABLE 4: SEO Audit

## 4.1 Current SEO Implementation

### Strengths
- **JSON-LD Structured Data:** Full WebApplication + Organization + SoftwareApplication schema in index.html
- **Open Graph Tags:** og:title, og:description, og:image, og:url, og:type properly set
- **Twitter Card Tags:** twitter:card, twitter:title, twitter:description, twitter:image configured
- **Canonical URL:** `<link rel="canonical">` set
- **hreflang Alternates:** 11 language alternates (en, pt, ko, tr, zh, es, ja, de, fr, hi, ru)
- **Sitemap Reference:** sitemap.xml in public/
- **robots.txt:** Present in public/
- **Semantic HTML:** Proper heading hierarchy, meta viewport, charset

### Critical Issues

| Issue | Severity | Description |
|---|---|---|
| **Fake i18n Pages** | CRITICAL | All 11 language pages in public/ are identical English content with only `lang` attribute changed. Google detects this as doorway/cloaking spam and may penalize the entire domain. |
| **SPA with No SSR** | HIGH | Single-page React app with no server-side rendering. Search engines may not execute JavaScript — all content is invisible to crawlers without JS execution. |
| **No Pre-rendered Content** | HIGH | index.html is a shell — all useful content is rendered client-side. Even with Google's JS rendering, initial paint is empty. |
| **Duplicate Content** | HIGH | 11 "translated" pages are 100% identical — Google sees 12 copies of the same page (canonical + 11 alternates) |
| **Missing Meta Descriptions** | MEDIUM | Some i18n pages lack unique meta descriptions |
| **Endpoint Divergence** | MEDIUM | Sitemap likely references production URLs that differ from actual deployment (Vercel preview vs production) |

### Recommendations

1. **Remove fake i18n pages immediately** — they risk a Google spam penalty
2. **Implement real i18n with proper translations** or remove hreflang tags
3. **Add pre-rendering** (Vite SSR, React Helmet, or static generation) so crawlers see content without JS
4. **Add noscript fallback** in index.html with key content
5. **Implement unique meta descriptions** per language
6. **Add structured data for each page** (not just the shell)
7. **Submit sitemap to Google Search Console** after fixing i18n
8. **Add breadcrumb schema** for navigation structure
9. **Implement canonical URL management** for Vercel preview deployments

---

# DELIVERABLE 5: Security Audit

## 5.1 Critical Security Issues

### CRITICAL: Hardcoded API Keys in Source Code

**Files Affected:**
- `src/utils/solana.ts` — Alchemy key `XhvbwzXZcW2UhCcCj5cC1`, Helius key `228a6dca-c288-4f6a-b85c-23561fb9e946`
- `server.ts` — Helius key `228a6dca-c288-4f6a-b85c-23561fb9e946`
- `api/solana/scan.js` — Both keys
- `api/solana/recent-txs.js` — Both keys
- `api/solana/gas-fee.js` — Both keys
- `api/burn/preview.js` — Both keys
- `api/burn/history.js` — Both keys

**Impact:** These keys are in the Git repository and will be cloned by anyone. Alchemy/Helius keys allow unlimited RPC usage on the project's plan. Attackers can:
- Exhaust RPC rate limits
- Use keys for their own applications
- Modify data if any write endpoints are exposed

**Remediation:**
1. Rotate ALL compromised keys immediately
2. Move keys to environment variables
3. Use `.env.local` for local dev (in .gitignore)
4. Use Vercel environment variables for production
5. Add key rotation documentation to SECURITY.md
6. Scan git history for leaked keys

### CRITICAL: Client-Side Key Exposure

**File:** `src/utils/solana.ts`

The Alchemy key is embedded in client-side JavaScript that ships to every user's browser. Even with environment variables, any key used in `VITE_` prefixed variables is visible in the production bundle.

**Remediation:** Route ALL RPC calls through the backend (Vercel functions or server.ts). Never include API keys in client-side code.

### HIGH: Permissive CSP Headers

**File:** `server.ts`

```javascript
"script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```

`'unsafe-inline'` allows inline script injection (XSS). `'unsafe-eval'` allows `eval()` and `new Function()`. Together they effectively negate CSP protection.

**Remediation:** Remove `'unsafe-inline'` (use nonces/hashes). Remove `'unsafe-eval'`. Use strict CSP.

### HIGH: No Input Validation on API Routes

**Files:** All `api/` files, `server.ts`

No validation of incoming request parameters. Wallet addresses, query parameters, and POST bodies are used directly without schema validation.

**Remediation:** Add validation with zod/joi schemas. Validate wallet addresses are valid base58 Solana addresses.

### HIGH: Misleading SwapTerminal

**File:** `src/components/SwapTerminal.tsx`

Claims "SECURED BY JUPITER AGGREGATOR" but has zero Jupiter integration. Users may be misled into thinking swaps are real and secure. Potential fraud liability.

**Remediation:** Either integrate Jupiter for real swaps, or remove the misleading branding and replace with a "Coming Soon" indicator.

### MEDIUM: In-Memory Rate Limiter

**File:** `server.ts`

Rate limiter uses in-memory storage. On Vercel serverless, each function invocation may get a new instance. Rate limiting is effectively non-functional in serverless deployment.

**Remediation:** Use Vercel KV (Redis) or Upstash for distributed rate limiting. Or use Vercel Edge Middleware for rate limiting.

### MEDIUM: No Authentication on API Endpoints

**Files:** `server.ts`, all `api/` files

No authentication required for any endpoint. Anyone can call burn/chat, burn/preview, solana/scan without connecting a wallet.

**Remediation:** Add wallet signature verification for sensitive endpoints. Add CORS restrictions.

### MEDIUM: localStorage Without Validation

**File:** `src/utils/burnHistory.ts`

Burn history stored in localStorage with no integrity checks. Malicious browser extensions or XSS could inject fake burn history.

**Remediation:** Validate data on read. Consider signing burn history entries with wallet signature.

### MEDIUM: No CORS Configuration

**Files:** `server.ts` (uses `cors()` with defaults), `api/` (no CORS)

Production API has no origin restrictions. Any website can call your API endpoints.

**Remediation:** Configure CORS to allow only your production domain.

### LOW: Gemini API Error Handling

**File:** `server.ts`

If GEMINI_API_KEY is missing, server crashes with a cryptic error. No graceful degradation.

**Remediation:** Check for API key on startup. Return helpful error if missing.

### LOW: No Request Size Limits

**File:** `server.ts`

`express.json()` has no size limit, allowing potential body parsing DoS.

**Remediation:** Add `express.json({ limit: '10kb' })`

## 5.2 Security Checklist

| Check | Status | Notes |
|---|---|---|
| API keys in environment variables | FAIL | Hardcoded in source |
| API keys not in client bundle | FAIL | VITE_ prefix ships to client |
| CSP headers are strict | FAIL | unsafe-inline, unsafe-eval |
| Input validation on all routes | FAIL | None present |
| Rate limiting on all routes | PARTIAL | server.ts only, in-memory |
| CORS configured | FAIL | Open CORS |
| localStorage data validation | FAIL | No validation on read |
| Transaction simulation before send | PASS | transactionSafety.ts |
| Program ID whitelist | PASS | transactionSafety.ts |
| Sanitization of external data | PASS | sanitizeExternalData.ts |
| No wallet-draining paths | PASS | Only CloseAccount instructions |
| HTTPS enforcement | PASS | Vercel provides |
| Security headers (X-Frame, etc.) | PARTIAL | server.ts adds some, inconsistent |
| Dependency audit | UNKNOWN | No audit step in CI |

---

# DELIVERABLE 6: Performance Audit

## 6.1 Bundle & Loading Performance

| Issue | Severity | Impact | Location |
|---|---|---|---|
| **No code splitting** | HIGH | Entire app loads upfront; ScannerTerminal (~1000 lines) and all components in one chunk | App.tsx imports everything eagerly |
| **No lazy loading** | HIGH | SwapTerminal, BurnSuccessModal, CombustionChamber load even when not visible | No React.lazy() usage |
| **@solana/web3.js in client bundle** | HIGH | ~200KB library ships to client; should be server-side only | `src/utils/solana.ts` |
| **No tree-shaking optimization** | MEDIUM | Recharts imports not optimized | `TokenDistributionChart.tsx` |
| **Large inline styles** | MEDIUM | Heavy TailwindCSS with many custom animations | `src/index.css` |
| **External font loading** | MEDIUM | 3 Google Fonts block render | `index.html` — Press Start 2P, Orbitron, Share Tech Mono |
| **No image optimization** | LOW | Token logos fetched at original size | ResilientImage.tsx |

## 6.2 Runtime Performance

| Issue | Severity | Impact | Location |
|---|---|---|---|
| **Monolithic App.tsx re-renders** | CRITICAL | ANY state change re-renders entire component tree | `src/App.tsx` (~700 lines, 20+ useState hooks) |
| **No React.memo on list items** | HIGH | ScannerTerminal re-renders entire token list on any selection change | `ScannerTerminal.tsx` |
| **No virtualization for token lists** | HIGH | Wallets with 100+ spam tokens cause DOM bloat | `ScannerTerminal.tsx` |
| **Canvas animation runs when idle** | MEDIUM | CombustionChamber renders frames even when not animating | `CombustionChamber.tsx` |
| **AudioContext created per call** | MEDIUM | Browser limits AudioContext instances; no singleton | `src/utils/audio.ts` |
| **localStorage writes on every image** | LOW | ResilientImage writes cache on each load | `ResilientImage.tsx` |
| **No debouncing on scan triggers** | LOW | Rapid wallet changes can trigger multiple scans | `App.tsx` |

## 6.3 Network Performance

| Issue | Severity | Impact | Location |
|---|---|---|---|
| **No API response caching** | HIGH | Every scan calls RPC every time; no ETags or stale-while-revalidate | All `api/` files |
| **Sequential RPC calls** | HIGH | Token metadata fetched one-by-one instead of batched | `src/utils/solana.ts` |
| **No request deduplication on client** | MEDIUM | Multiple components calling same RPC data | No data layer (React Query/SWR) |
| **Full API route duplication** | MEDIUM | 5 serverless functions all duplicate fetchWithRetry/rpcCallWithRetry | All `api/` files |
| **No prefetching** | LOW | Gas fee and burn preview could be prefetched after scan | No strategy |

## 6.4 Deployment Performance

| Issue | Severity | Impact | Location |
|---|---|---|---|
| **No CDN for API routes** | MEDIUM | API responses aren't cached at edge | `vercel.json` |
| **No compression config** | LOW | Vercel provides by default, but no explicit config | `vercel.json` |
| **Vercel function cold starts** | LOW | Serverless functions have ~200ms cold start; no keep-warm | All `api/` functions |

## 6.5 Performance Recommendations

1. **Decompose App.tsx** into smaller components with memoization
2. **Add React.lazy()** for SwapTerminal, BurnSuccessModal, CombustionChamber
3. **Add virtualized list** (react-window) for token scanning
4. **Route RPC through backend** — remove @solana/web3.js from client bundle
5. **Add React Query or SWR** for data caching and deduplication
6. **Batch RPC calls** instead of sequential
7. **Font-display: swap** for Google Fonts
8. **Add AudioContext singleton** pattern
9. **Debounce scan triggers** on wallet changes
10. **Cache API responses** with stale-while-revalidate

---

# DELIVERABLE 7: Final Report & Implementation Plan

## 7.1 Executive Summary

BurnerSol Protocol is a Solana wallet cleanup dApp with a core scanning/burning feature that works. However, the codebase has **critical security vulnerabilities** (hardcoded API keys in source and client bundle), **misleading features** (fake swap terminal claiming Jupiter integration, simulated burn feed mixed with real data), **severe architectural issues** (monolithic App.tsx, no code splitting, duplicated utility code across 6+ files), **SEO risks** (fake i18n pages risking Google penalty), and **performance problems** (no memoization, no virtualization, no data caching).

The core burn feature (scan → close token accounts → reclaim rent) works correctly with good safety practices (transaction simulation, program whitelist). The Gemini AI chat integration is functional but lacks error boundaries and proper rate limiting for serverless deployment.

## 7.2 Priority Matrix

| Priority | Category | Issue | Effort |
|---|---|---|---|
| P0 | Security | Rotate and remove hardcoded API keys | 1 day |
| P0 | Security | Move RPC calls to backend, remove keys from client | 2 days |
| P0 | Fraud Risk | Remove or clearly mark SwapTerminal as "Coming Soon" | 0.5 day |
| P1 | Security | Fix CSP headers (remove unsafe-inline/eval) | 0.5 day |
| P1 | Security | Add input validation to all API routes | 1 day |
| P1 | Security | Add CORS configuration | 0.5 day |
| P1 | SEO | Remove fake i18n pages or add real translations | 1 day |
| P1 | Trust | Mark simulated feed entries as "simulated" | 0.5 day |
| P2 | Architecture | Decompose App.tsx into focused modules | 3 days |
| P2 | Architecture | Extract shared API utilities from duplicated code | 1 day |
| P2 | Architecture | Fix dev-server.mjs to include server.ts routes | 0.5 day |
| P2 | Performance | Add code splitting and lazy loading | 1 day |
| P2 | Performance | Add React Query for data caching | 2 days |
| P2 | Performance | Add list virtualization for ScannerTerminal | 1 day |
| P2 | Performance | Add React.memo and useMemo for re-render optimization | 1 day |
| P2 | Bug | Fix FooterHUD Italian fallback bug | 0.5 day |
| P2 | Bug | Remove hardcoded demo items from ScannerTerminal | 0.5 day |
| P2 | Bug | Fix CombustionChamber canvas cleanup on unmount | 0.5 day |
| P2 | Bug | Fix AudioContext singleton pattern | 0.5 day |
| P2 | Bug | Fix burnHistory localStorage validation | 0.5 day |
| P3 | Performance | Route @solana/web3.js to backend | 2 days |
| P3 | Performance | Batch RPC calls | 1 day |
| P3 | Performance | Add API response caching | 1 day |
| P3 | Architecture | Add rate limiting with Vercel KV for serverless | 1 day |
| P3 | Security | Add wallet signature verification for API endpoints | 2 days |
| P3 | Architecture | Implement proper i18n with react-intl or next-intl | 5 days |
| P3 | DevEx | Add ESLint, Prettier, Husky pre-commit hooks | 1 day |
| P3 | DevEx | Add CI/CD pipeline with dependency audit step | 1 day |
| P3 | DevEx | Add unit tests for riskEngine, transactionSafety, sanitizeExternalData | 3 days |

## 7.3 Implementation Phases

### Phase 1: Critical Security (Week 1) — 3.5 days
1. **Rotate ALL API keys** (Alchemy, Helius, Gemini)
2. **Remove hardcoded keys** from all files — use `process.env` / `import.meta.env`
3. **Route client RPC calls through backend** (Vercel functions) — remove `@solana/web3.js` from client bundle
4. **Redesign SwapTerminal** — remove "JUPITER AGGREGATOR" branding, mark as "Coming Soon"
5. **Add .env.local** to .gitignore with documentation

### Phase 2: Security Hardening & Trust (Week 2) — 3 days
1. **Fix CSP headers** — strict policy with nonces
2. **Add input validation** (zod) to all API routes
3. **Configure CORS** — restrict to production domain
4. **Remove/mark fake i18n pages** — remove hreflang alternates until real translations exist
5. **Mark simulated burn feed entries** — add "simulated" badge or visual distinction
6. **Add burnHistory localStorage validation** on read
7. **Add request size limits** to express.json()

### Phase 3: Architecture & Performance (Weeks 3-4) — 8 days
1. **Decompose App.tsx** into: StateProvider, BurnOrchestrator, ChatInterface, UIRouter
2. **Extract shared API utilities** — single `api-utils.js` imported by all serverless functions
3. **Add code splitting** — React.lazy for SwapTerminal, BurnSuccessModal, CombustionChamber
4. **Add React Query** — data caching, deduplication, background refresh
5. **Add list virtualization** — react-window for ScannerTerminal
6. **Add memoization** — React.memo for token list items, useMemo for computed values
7. **Fix all identified bugs** — FooterHUD, demo items, canvas cleanup, AudioContext
8. **Fix dev-server.mjs** — mount server.ts routes for local AI chat

### Phase 4: Polish & Infrastructure (Weeks 5-6) — 8 days
1. **Add distributed rate limiting** (Vercel KV / Upstash)
2. **Add wallet signature verification** for sensitive API endpoints
3. **Batch RPC calls** for token metadata
4. **Add API response caching** with stale-while-revalidate
5. **Implement proper i18n** or remove all fake translated pages
6. **Add ESLint + Prettier + pre-commit hooks**
7. **Add CI/CD with dependency audit**
8. **Add unit tests** for riskEngine, transactionSafety, sanitizeExternalData

## 7.4 Total Effort Estimate

| Phase | Duration | Focus |
|---|---|---|
| Phase 1 | 3.5 days | Critical security fixes |
| Phase 2 | 3 days | Security hardening & trust |
| Phase 3 | 8 days | Architecture & performance |
| Phase 4 | 8 days | Polish & infrastructure |
| **Total** | **~22.5 days** | **~4.5 weeks** |

## 7.5 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API keys already compromised (in git history) | HIGH | HIGH | Rotate keys immediately; consider git history rewrite |
| Google penalty for fake i18n pages | MEDIUM | HIGH | Remove in Phase 2 |
| User executes fake swap expecting real transaction | LOW | CRITICAL | Fix in Phase 1 |
| CSP bypass leads to XSS | MEDIUM | HIGH | Fix in Phase 2 |
| App.tsx refactoring introduces regressions | MEDIUM | MEDIUM | Add tests before refactoring (Phase 4 → move to Phase 3) |
| Rate limiter fails in serverless | HIGH | LOW | Acceptable in Phase 1-2; fix in Phase 4 |

---

*Audit completed. All 7 deliverables produced. Ready for implementation upon approval.*
