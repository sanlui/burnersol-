import { createContext, useContext, useMemo, useState, useEffect, useRef, ReactNode } from "react";

interface WalletState {
  ready: boolean;
  publicKey: any;
  wallet: any;
  connecting: boolean;
  connected: boolean;
  disconnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  select: (name: any) => void;
  wallets: any[];
  setVisible: (visible: boolean) => void;
  sendTransaction: any;
  connection: any;
}

const SafeWalletContext = createContext<WalletState>({
  ready: false,
  publicKey: null,
  wallet: null,
  connecting: false,
  connected: false,
  disconnecting: false,
  connect: async () => {},
  disconnect: async () => {},
  select: () => {},
  wallets: [],
  setVisible: () => {},
  sendTransaction: null,
  connection: null,
});

export function useSafeWallet() {
  return useContext(SafeWalletContext);
}

const DEFAULT_VALUE: WalletState = {
  ready: false, publicKey: null, wallet: null, connecting: false,
  connected: false, disconnecting: false, connect: async () => {},
  disconnect: async () => {}, select: () => {}, wallets: [], setVisible: () => {},
  sendTransaction: null, connection: null,
};

interface Props {
  children: ReactNode;
}

function WalletProviderInner({ children }: Props) {
  const [modules, setModules] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [web3Mod, reactMod, uiMod, phantomMod, solflareMod] = await Promise.all([
          import("@solana/web3.js"),
          import("@solana/wallet-adapter-react"),
          import("@solana/wallet-adapter-react-ui"),
          import("@solana/wallet-adapter-phantom"),
          import("@solana/wallet-adapter-solflare"),
        ]);

        if (cancelled) return;

        const endpoint = `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY || ""}`;
        const {
          ConnectionProvider: CP,
          WalletProvider: WP,
          useWallet,
        } = reactMod;
        const { WalletModalProvider: WMP, useWalletModal } = uiMod;
        const adapters = [
          new phantomMod.PhantomWalletAdapter(),
          new solflareMod.SolflareWalletAdapter(),
        ];

        const conn = new web3Mod.Connection(endpoint, "confirmed");

        setModules({ CP, WP, WMP, useWallet, useWalletModal, endpoint, adapters, conn });

        // @ts-ignore - CSS side-effect import
        import("@solana/wallet-adapter-react-ui/styles.css").catch(() => {});
      } catch (err) {
        console.error("Wallet adapter load failed:", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!modules) {
    return (
      <SafeWalletContext.Provider value={DEFAULT_VALUE}>
        {children}
      </SafeWalletContext.Provider>
    );
  }

  const { CP, WP, WMP, useWallet, useWalletModal, endpoint, adapters, conn } = modules;

  return (
    <CP endpoint={endpoint}>
      <WP wallets={adapters} autoConnect>
        <WMP>
          <WalletBridgeInner useWallet={useWallet} useWalletModal={useWalletModal} conn={conn}>
            {children}
          </WalletBridgeInner>
        </WMP>
      </WP>
    </CP>
  );
}

function WalletBridgeInner({
  useWallet,
  useWalletModal,
  conn,
  children,
}: {
  useWallet: any;
  useWalletModal: any;
  conn: any;
  children: ReactNode;
}) {
  const wallet = useWallet();
  const modal = useWalletModal();

  const value = useMemo<WalletState>(
    () => ({
      ready: true,
      publicKey: wallet.publicKey,
      wallet: wallet.wallet,
      connecting: wallet.connecting,
      connected: wallet.connected,
      disconnecting: wallet.disconnecting,
      connect: wallet.connect,
      disconnect: wallet.disconnect,
      select: wallet.select,
      wallets: wallet.wallets,
      setVisible: modal.setVisible,
      sendTransaction: wallet.sendTransaction,
      connection: conn,
    }),
    [wallet, modal, conn]
  );

  return (
    <SafeWalletContext.Provider value={value}>
      {children}
    </SafeWalletContext.Provider>
  );
}

export default function SolanaWalletProvider({ children }: Props) {
  return (
    <SafeWalletContext.Provider value={DEFAULT_VALUE}>
      <WalletProviderInner>{children}</WalletProviderInner>
    </SafeWalletContext.Provider>
  );
}
