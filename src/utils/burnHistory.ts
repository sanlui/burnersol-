export interface StoredBurnTx {
  id: string;
  txHash: string;
  timestamp: string;
  itemCount: number;
  solReclaimed: number;
  walletAddress: string;
  walletName: string;
  status: "success" | "pending";
}

const STORAGE_KEY = "burner_burn_history";

export function loadBurnHistory(): StoredBurnTx[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveBurnTransaction(tx: StoredBurnTx): void {
  try {
    const history = loadBurnHistory();
    const updated = [tx, ...history].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}