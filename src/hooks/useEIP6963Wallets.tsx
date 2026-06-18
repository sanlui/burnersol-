import { useState, useEffect, useCallback } from "react";
import React from "react";

export interface EIP6963Wallet {
  rdns: string;
  name: string;
  icon: string;
  provider: unknown;
}

interface StandardWalletProvider {
  connected: boolean;
  connect: (opts?: { chain?: string }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on?: (event: string, callback: (args: unknown) => void) => void;
  removeListener?: (event: string, callback: (args: unknown) => void) => void;
}

function isSolanaWallet(wallet: EIP6963Wallet): boolean {
  const provider = wallet.provider as {
    chains?: string[];
    features?: Record<string, unknown>;
  };
  
  if (!provider) return false;

  const chains = provider.chains;
  if (chains && Array.isArray(chains)) {
    const hasSolanaChain = chains.some(
      (chain) => typeof chain === "string" && chain.startsWith("solana:")
    );
    if (!hasSolanaChain) return false;
  }

  const features = provider.features;
  if (features) {
    const hasConnect = "standard:connect" in features || "connect" in features;
    if (!hasConnect) return false;
  }

  return true;
}

export function useEIP6963Wallets() {
  const [wallets, setWallets] = useState<EIP6963Wallet[]>([]);

  const handleEIP6963 = useCallback((event: CustomEvent) => {
    const wallet: EIP6963Wallet = {
      rdns: event.detail.info.rdns,
      name: event.detail.info.name || event.detail.info.rdns,
      icon: event.detail.info.icon,
      provider: event.detail.provider,
    };

    if (!isSolanaWallet(wallet)) return;

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
  return rdns;
}

export function getNameForRdns(rdns: string): string {
  return rdns;
}

export function getIconForRdns(rdns: string, _provider?: unknown): React.ReactNode {
  const prov = _provider as { icon?: string } | undefined;
  if (prov?.icon) {
    return (
      <img
        src={prov.icon}
        alt={rdns}
        className="w-8 h-8"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="#666"/>
      <rect x="44" y="54" width="40" height="32" rx="4" fill="white"/>
      <rect x="54" y="86" width="20" height="10" fill="white"/>
    </svg>
  );
}

export async function connectSolanaWallet(
  provider: unknown,
  chain: string = "solana:mainnet"
): Promise<string> {
  const wallet = provider as StandardWalletProvider;
  
  if (!wallet.connect) {
    throw new Error("Wallet does not support standard connect");
  }

  const response = await wallet.connect({ chain });
  return response.publicKey.toString();
}