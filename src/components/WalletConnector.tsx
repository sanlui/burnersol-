import { useState, useEffect } from "react";
import { useEIP6963Wallets, EIP6963Wallet, connectSolanaWallet } from "../hooks/useEIP6963Wallets";
import WalletSelectionModal from "./WalletSelectionModal";

interface WalletConnectorProps {
  onConnected: (address: string, walletId: string) => void;
  onDisconnected: () => void;
  connectedAddress: string | null;
  language: "en" | "it";
}

export default function WalletConnector({
  onConnected,
  onDisconnected,
  connectedAddress,
  language,
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
        setConnectionError(
          language === "it" ? `Errore: ${message}` : `Error: ${message}`
        );
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
          language={language}
        />
      )}
    </>
  );
}

export function dispatchOpenWalletModal() {
  window.dispatchEvent(new CustomEvent("burner:openWalletModal"));
}