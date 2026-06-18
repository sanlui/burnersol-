import { useState, useEffect, useCallback } from "react";
import React from "react";

export interface EIP6963Wallet {
  rdns: string;
  name: string;
  icon: string;
  provider: unknown;
}

const RDNS_TO_ID: Record<string, string> = {
  "project.phantom": "phantom",
  "app.phantom": "phantom",
  "phantom": "phantom",
  "project.solflare": "solflare",
  "app.solflare": "solflare",
  "solflare": "solflare",
  "so0g6yyy3RPbLPvqNcBzcWPSS7A7GDcaAwqeYFNPRxS": "solflare_ledger",
  "project.backpack": "backpack",
  "app.backpack": "backpack",
  "backpack": "backpack",
  "coin98": "coin98",
  "exodus": "exodus",
  "app.magiceden": "magiceden",
  "magiceden": "magiceden",
  "trust": "trust",
  "walletconnect": "wallet_connect",
  "glow": "glow",
  "nightly": "nightly",
  "blade": "blade",
  "com.bitkeep": "bitkeep",
  "ultimate": "ultimate",
  "app.core": "core",
  "core": "core",
  "solong": "solong",
  "mathwallet": "math",
  "tokenpocket": "tokenpocket",
  "com.okx": "okx",
  "whale": "whale",
  "sollet": "sollet",
};

const WALLET_ICONS: Record<string, React.ReactNode> = {
  phantom: (
    <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 58.7C9.5 54.3 13.1 50.7 17.5 50.7H45.3L88.1 100.5C90.6 102.8 94.7 102.8 97.2 100.5L121.7 77.7C125.4 74.4 124.8 68.5 120.5 65.8L68.5 39.5C63.9 37.2 58.3 39.8 56.4 44.7L44.9 78.2C43.4 81.7 39.9 84 36 84H17.5C13.1 84 9.5 80.4 9.5 76V58.7Z" fill="#AB9FF2"/>
      <path d="M9.5 42.2C9.5 37.8 13.1 34.2 17.5 34.2H45.3L88.1 83.9C90.6 86.2 94.7 86.2 97.2 83.9L121.7 61.2C125.4 57.9 124.8 52 120.5 49.2L68.5 23C63.9 20.7 58.3 23.3 56.4 28.2L44.9 61.6C43.4 65.1 39.9 67.5 36 67.5H17.5C13.1 67.5 9.5 63.9 9.5 59.5V42.2Z" fill="#8B7BC5"/>
      <circle cx="92" cy="45" r="7" fill="white"/>
    </svg>
  ),
  solflare: (
    <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="#FAB214"/>
      <path d="M64 16L77.6 55.7H100.8L82.2 79.9L91.4 119.8L64 95.7L36.6 119.8L45.8 79.9L27.2 55.7H50.4L64 16Z" fill="white"/>
    </svg>
  ),
  backpack: (
    <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="#E42525"/>
      <path d="M64 26C43.12 26 26 43.12 26 64C26 84.88 43.12 102 64 102C84.88 102 102 84.88 102 64C102 43.12 84.88 26 64 26ZM64 92C50.75 92 40 81.25 40 68C40 54.75 50.75 44 64 44C77.25 44 88 54.75 88 68C88 81.25 77.25 92 64 92Z" fill="white"/>
      <rect x="54" y="55" width="20" height="24" rx="3" fill="white"/>
      <rect x="62" y="63" width="4" height="8" rx="1" fill="#E42525"/>
    </svg>
  ),
  core: (
    <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="#5546FF"/>
      <circle cx="64" cy="64" r="25" fill="white"/>
      <circle cx="64" cy="64" r="12" fill="#5546FF"/>
    </svg>
  ),
  glow: (
    <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="#1C1C1C"/>
      <circle cx="64" cy="64" r="45" fill="#FF6B35"/>
      <circle cx="64" cy="64" r="20" fill="#FF6B35"/>
      <path d="M54 64L64 50L74 64L64 78L54 64Z" fill="white"/>
    </svg>
  ),
};

function getIconForRdns(rdns: string): React.ReactNode {
  const id = RDNS_TO_ID[rdns] || rdns;
  return WALLET_ICONS[id] || (
    <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="#666"/>
      <rect x="44" y="54" width="40" height="32" rx="4" fill="white"/>
      <rect x="54" y="86" width="20" height="10" fill="white"/>
    </svg>
  );
}

function getNameForRdns(rdns: string): string {
  const names: Record<string, string> = {
    "project.phantom": "Phantom",
    "app.phantom": "Phantom",
    "phantom": "Phantom",
    "project.solflare": "Solflare",
    "app.solflare": "Solflare",
    "solflare": "Solflare",
    "so0g6yyy3RPbLPvqNcBzcWPSS7A7GDcaAwqeYFNPRxS": "Solflare Ledger",
    "project.backpack": "Backpack",
    "app.backpack": "Backpack",
    "backpack": "Backpack",
    "coin98": "Coin98",
    "exodus": "Exodus",
    "app.magiceden": "Magic Eden",
    "magiceden": "Magic Eden",
    "trust": "Trust",
    "walletconnect": "WalletConnect",
    "glow": "Glow",
    "nightly": "Nightly",
    "blade": "Blade",
    "com.bitkeep": "Bitget",
    "ultimate": "Ultimate",
    "app.core": "Core",
    "core": "Core",
    "solong": "Solong",
    "mathwallet": "Math Wallet",
    "tokenpocket": "TokenPocket",
    "com.okx": "OKX",
    "whale": "Whale",
    "sollet": "Sollet",
  };
  return names[rdns] || rdns;
}

export function useEIP6963Wallets() {
  const [wallets, setWallets] = useState<EIP6963Wallet[]>([]);

  const handleEIP6963 = useCallback((event: CustomEvent) => {
    const wallet: EIP6963Wallet = {
      rdns: event.detail.info.rdns,
      name: event.detail.info.name || getNameForRdns(event.detail.info.rdns),
      icon: event.detail.info.icon,
      provider: event.detail.provider,
    };
    setWallets((prev) => {
      const exists = prev.some((w) => w.rdns === wallet.rdns);
      if (exists) return prev;
      return [...prev, wallet];
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => handleEIP6963(event as CustomEvent);

    window.addEventListener("eip6963:announceProvider", handler);

    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handler);
    };
  }, [handleEIP6963]);

  return wallets;
}

export function getWalletIdFromRdns(rdns: string): string {
  return RDNS_TO_ID[rdns] || rdns;
}

export { getIconForRdns, getNameForRdns };