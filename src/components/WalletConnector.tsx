import { useState, useEffect, useCallback } from "react";
import WalletSelectionModal from "./WalletSelectionModal";

interface EIP6963Wallet {
  rdns: string;
  name: string;
  icon: string;
  provider: unknown;
}

interface WalletConnectorProps {
  onConnected: (address: string, walletId: string) => void;
  onDisconnected: () => void;
  connectedAddress: string | null;
}

function isSolanaWallet(wallet: EIP6963Wallet): boolean {
  const provider = wallet.provider as { chains?: string[]; features?: Record<string, unknown> };
  if (!provider) return false;
  const chains = provider.chains;
  if (chains && Array.isArray(chains)) {
    return chains.some((chain) => typeof chain === "string" && chain.startsWith("solana:"));
  }
  return true;
}

function useEIP6963Wallets() {
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
    return () => window.removeEventListener("eip6963:announceProvider", handler);
  }, [handleEIP6963]);

  return wallets;
}

async function connectSolanaWallet(provider: unknown, chain: string = "solana:mainnet"): Promise<string> {
  const wallet = provider as { connect: (opts?: { chain?: string }) => Promise<{ publicKey: { toString: () => string } }> };
  if (!wallet.connect) throw new Error("Wallet does not support standard connect");
  const response = await wallet.connect({ chain });
  return response.publicKey.toString();
}

export default function WalletConnector({
  onConnected,
  onDisconnected,
  connectedAddress,
}: WalletConnectorProps) {
  const eip6963Wallets = useEIP6963Wallets();
  const [showModal, setShowModal] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [hasAutoConnected, setHasAutoConnected] = useState(false);

  const storedProvider = localStorage.getItem("burner_solana_wallet_provider");
  const storedAddress = localStorage.getItem("burner_solana_wallet_address");

  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener("burner:openWalletModal", handler);
    return () => window.removeEventListener("burner:openWalletModal", handler);
  }, []);

  useEffect(() => {
    if (eip6963Wallets.length === 0) return;
    if (connectedAddress) return;
    if (hasAutoConnected) return;

    if (storedProvider && storedAddress) {
      const match = eip6963Wallets.find(
        (w) =>
          w.rdns === storedProvider ||
          w.rdns.includes(storedProvider) ||
          storedProvider.includes(w.rdns)
      );
      if (match) {
        setHasAutoConnected(true);
        connectToWallet(match);
        return;
      }
    }

    if (eip6963Wallets.length === 1) {
      setHasAutoConnected(true);
      connectToWallet(eip6963Wallets[0]);
    } else if (eip6963Wallets.length > 1) {
      setShowModal(true);
    }
  }, [eip6963Wallets.length]);

  const connectToWallet = async (wallet: EIP6963Wallet) => {
    setConnectingWallet(wallet.rdns);
    setConnectionError(null);

    try {
      const address = await connectSolanaWallet(wallet.provider, "solana:mainnet");

      localStorage.setItem("burner_solana_wallet_address", address);
      localStorage.setItem("burner_solana_wallet_provider", wallet.rdns);

      onConnected(address, wallet.rdns);
      setShowModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      if (!message.includes("User rejected") && !message.includes("rejected")) {
        setConnectionError(`Error: ${message}`);
      }
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <>
      {showModal && eip6963Wallets.length > 0 && (
        <WalletSelectionModal
          wallets={eip6963Wallets}
          onSelect={(wallet) => {
            setConnectingWallet(wallet.rdns);
            connectToWallet(wallet);
          }}
          onClose={() => setShowModal(false)}
          connectingWallet={connectingWallet}
          error={connectionError}
        />
      )}
    </>
  );
}

export function dispatchOpenWalletModal() {
  window.dispatchEvent(new CustomEvent("burner:openWalletModal"));
}