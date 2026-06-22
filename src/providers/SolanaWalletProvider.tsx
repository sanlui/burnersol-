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

// Lazy connection singleton - only loads @solana/web3.js when first accessed
let solanaConnection: any = null;
const getSolanaConnection = async () => {
  if (!solanaConnection) {
    const { Connection, clusterApiUrl } = await import('@solana/web3.js');
    solanaConnection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  }
  return solanaConnection;
};

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

        const endpoint = "https://api.mainnet-beta.solana.com";
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

        const conn = await getSolanaConnection();

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
