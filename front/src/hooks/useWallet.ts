import { useState, useEffect, useCallback } from 'react';
import { Provider } from "@massalabs/massa-web3";
import { getWallets, Wallet } from "@massalabs/wallet-provider";

export interface WalletState {
  provider: Provider | undefined;
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  accounts: Provider[];
  selectedAccount: Provider | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  address: string | null;
}

const STORAGE_KEY = 'burner_last_wallet';

interface StoredWalletInfo {
  walletName: string;
  accountAddress: string;
}

function saveWalletInfo(walletName: string, accountAddress: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ walletName, accountAddress }));
  } catch {
    // Ignore storage errors
  }
}

function loadWalletInfo(): StoredWalletInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function clearWalletInfo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function useWallet() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<Provider[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Provider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize wallets on mount
  useEffect(() => {
    const initWallets = async () => {
      try {
        const walletList = await getWallets();
        setWallets(walletList);
        
        // Try to restore last used wallet
        const storedInfo = loadWalletInfo();
        if (storedInfo && walletList.length > 0) {
          const lastWallet = walletList.find(w => w.name() === storedInfo.walletName);
          if (lastWallet) {
            setSelectedWallet(lastWallet);
          }
        }
        setInitialized(true);
      } catch (err) {
        console.error("Failed to get wallets:", err);
        setError("Failed to detect wallets");
        setInitialized(true);
      }
    };
    initWallets();
  }, []);

  // Load accounts when wallet is selected
  useEffect(() => {
    if (!selectedWallet || !initialized) {
      setAccounts([]);
      setSelectedAccount(null);
      return;
    }

    const loadAccounts = async () => {
      try {
        setIsConnecting(true);
        setError(null);
        const walletAccounts = await selectedWallet.accounts();
        setAccounts(walletAccounts);
        
        // Try to restore last used account
        const storedInfo = loadWalletInfo();
        if (storedInfo && storedInfo.walletName === selectedWallet.name()) {
          const lastAccount = walletAccounts.find(a => a.address === storedInfo.accountAddress);
          if (lastAccount) {
            setSelectedAccount(lastAccount);
          }
        }
      } catch (err) {
        console.error("Failed to load accounts:", err);
        setError("Failed to load accounts from wallet");
        setAccounts([]);
      } finally {
        setIsConnecting(false);
      }
    };
    loadAccounts();
  }, [selectedWallet, initialized]);

  // Save wallet info when account is selected
  useEffect(() => {
    if (selectedWallet && selectedAccount) {
      saveWalletInfo(selectedWallet.name(), selectedAccount.address);
    }
  }, [selectedWallet, selectedAccount]);

  const selectWallet = useCallback((wallet: Wallet | null) => {
    setSelectedWallet(wallet);
    setSelectedAccount(null);
    setAccounts([]);
    if (!wallet) {
      clearWalletInfo();
    }
  }, []);

  const selectAccount = useCallback((account: Provider | null) => {
    setSelectedAccount(account);
    if (!account && selectedWallet) {
      // Clear the stored account but keep the wallet
      clearWalletInfo();
    }
  }, [selectedWallet]);

  const disconnect = useCallback(() => {
    setSelectedWallet(null);
    setSelectedAccount(null);
    setAccounts([]);
    setError(null);
    clearWalletInfo();
  }, []);

  const isConnected = selectedAccount !== null;
  const address = selectedAccount?.address ?? null;

  return {
    provider: selectedAccount ?? undefined,
    wallets,
    selectedWallet,
    accounts,
    selectedAccount,
    isConnected,
    isConnecting,
    error,
    address,
    selectWallet,
    selectAccount,
    disconnect,
  };
}
