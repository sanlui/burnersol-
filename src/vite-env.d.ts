/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALCHEMY_API_KEY: string;
  readonly VITE_HELIUS_API_KEY: string;
  readonly VITE_SOLANA_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}