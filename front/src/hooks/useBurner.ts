import { useState, useEffect, useCallback, useRef } from 'react';
import { Provider, JsonRpcPublicProvider, PublicApiUrl, Args, OperationStatus, DatastoreKeysRequest, AddressDatastoreKeys } from "@massalabs/massa-web3";

// Smart contract address - deployed on Massa Mainnet
export const SC_ADDR = "AS14T6cJRdt8FaNDo7f3AhhAv6gt8zWMT8tFuSsDgp7GxEeW26Xt";

// Storage key tags (must match smart contract)
const BURN_COUNTER_KEY: Uint8Array = new Uint8Array([0x00]);
const TOTAL_BURNED_KEY: Uint8Array = new Uint8Array([0x01]);
const BURN_HISTORY_TAG: Uint8Array = new Uint8Array([0x02]);
const LEADERBOARD_TAG: Uint8Array = new Uint8Array([0x04]);

// Convert big-endian bytes to bigint
function BEBytesToBigInt(arr: Uint8Array): bigint {
  let result = 0n;
  for (let i = 0; i < arr.length; i++) {
    result = (result << 8n) | BigInt(arr[i]);
  }
  return result;
}

// Convert nanoMAS to MAS (display format)
export function nanoMasToMas(nanoMas: bigint): string {
  const mas = Number(nanoMas) / 1_000_000_000;
  return mas.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

// Convert MAS to nanoMAS
export function masToNanoMas(mas: number): bigint {
  return BigInt(Math.floor(mas * 1_000_000_000));
}

export interface BurnRecord {
  id: bigint;
  address: string;
  amount: bigint;
}

export interface LeaderboardEntry {
  address: string;
  totalBurned: bigint;
  rank: number;
}

export interface BurnerState {
  totalBurned: bigint;
  burnCount: bigint;
  recentBurns: BurnRecord[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

// Type for providers that can read data (both wallet provider and public provider)
type ReadableProvider = Provider | JsonRpcPublicProvider;

// Helper to get datastore keys
async function getAddressesDatastoreKeys(provider: ReadableProvider, requests: DatastoreKeysRequest[]): Promise<AddressDatastoreKeys[] | null> {
  try {
    const { url } = await provider.networkInfos();
    const publicProvider = JsonRpcPublicProvider.fromRPCUrl(url ?? PublicApiUrl.Mainnet) as JsonRpcPublicProvider;
    return await publicProvider.client.getAddressesDatastoreKeys(requests);
  } catch {
    return null;
  }
}

export function useBurner(provider: ReadableProvider | undefined) {
  const [totalBurned, setTotalBurned] = useState<bigint>(0n);
  const [burnCount, setBurnCount] = useState<bigint>(0n);
  const [recentBurns, setRecentBurns] = useState<BurnRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBurning, setIsBurning] = useState(false);
  const refreshIntervalRef = useRef<number | null>(null);

  // Fetch burn statistics
  const fetchStats = useCallback(async () => {
    if (!provider) return;

    try {
      // Read total burned and burn count from storage
      const results = await provider.readStorage(SC_ADDR, [
        TOTAL_BURNED_KEY,
        BURN_COUNTER_KEY,
      ], false);

      if (results[0]) {
        setTotalBurned(BEBytesToBigInt(results[0]));
      }
      if (results[1]) {
        setBurnCount(BEBytesToBigInt(results[1]));
      }
    } catch (err) {
      console.error("Failed to fetch burn stats:", err);
    }
  }, [provider]);

  // Fetch recent burns from history
  const fetchRecentBurns = useCallback(async () => {
    if (!provider) return;

    try {
      // Get keys with BURN_HISTORY_TAG prefix, ordered lexicographically (newest first due to inverted counter)
      const result = await getAddressesDatastoreKeys(provider, [{
        address: SC_ADDR,
        prefix: BURN_HISTORY_TAG,
        final: false,
        maxCount: 100
      }]);

      if (!result || !result[0]?.keys) {
        return;
      }

      const burns: BurnRecord[] = [];
      const U64_MAX = 18446744073709551615n;

      for (const key of result[0].keys) {
        // Parse key format: [BURN_HISTORY_TAG(1)][inverted_counter(8)][addr_len(1)][addr][amount(8)]
        if (key.length < 18) continue; // Minimum: 1 + 8 + 1 + 0 + 8

        let offset = 1; // Skip tag

        // Read inverted counter
        const invertedCounter = BEBytesToBigInt(key.slice(offset, offset + 8));
        const counter = U64_MAX - invertedCounter;
        offset += 8;

        // Read address length and address
        const addrLen = key[offset];
        offset += 1;
        const addressBytes = key.slice(offset, offset + addrLen);
        const address = new TextDecoder().decode(addressBytes);
        offset += addrLen;

        // Read amount
        const amount = BEBytesToBigInt(key.slice(offset, offset + 8));

        burns.push({
          id: counter,
          address,
          amount,
        });
      }

      setRecentBurns(burns);
    } catch (err) {
      console.error("Failed to fetch recent burns:", err);
    }
  }, [provider]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    if (!provider) return;

    try {
      // Get keys with LEADERBOARD_TAG prefix, ordered lexicographically (highest first due to inverted total)
      const result = await getAddressesDatastoreKeys(provider, [{
        address: SC_ADDR,
        prefix: LEADERBOARD_TAG,
        final: false,
        maxCount: 50
      }]);

      if (!result || !result[0]?.keys) {
        return;
      }

      const entries: LeaderboardEntry[] = [];
      const U64_MAX = 18446744073709551615n;

      for (const key of result[0].keys) {
        // Parse key format: [LEADERBOARD_TAG(1)][inverted_total(8)][addr_len(1)][addr]
        if (key.length < 10) continue; // Minimum: 1 + 8 + 1 + 0

        let offset = 1; // Skip tag

        // Read inverted total
        const invertedTotal = BEBytesToBigInt(key.slice(offset, offset + 8));
        const totalBurned = U64_MAX - invertedTotal;
        offset += 8;

        // Read address length and address
        const addrLen = key[offset];
        offset += 1;
        const addressBytes = key.slice(offset, offset + addrLen);
        const address = new TextDecoder().decode(addressBytes);

        entries.push({
          address,
          totalBurned,
          rank: entries.length + 1,
        });
      }

      setLeaderboard(entries);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
  }, [provider]);

  // Main refresh function
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchRecentBurns(), fetchLeaderboard()]);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, fetchRecentBurns, fetchLeaderboard]);

  // Initial load and periodic refresh
  useEffect(() => {
    if (provider) {
      refresh();
      
      // Refresh every 10 seconds
      refreshIntervalRef.current = window.setInterval(() => {
        refresh();
      }, 10000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [provider, refresh]);

  // Check if provider has wallet capabilities
  const isWalletProvider = (p: ReadableProvider | undefined): p is Provider => {
    return p !== undefined && 'callSC' in p;
  };

  // Burn MAS
  const burn = useCallback(async (amountMas: number): Promise<boolean> => {
    if (!isWalletProvider(provider)) {
      setError("Wallet not connected");
      return false;
    }

    if (amountMas <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }

    setIsBurning(true);
    setError(null);

    try {
      const amountNanoMas = masToNanoMas(amountMas);
      
      const operation = await provider.callSC({
        func: "burn",
        target: SC_ADDR,
        parameter: new Args(),
        coins: amountNanoMas,
      });

      const status = await operation.waitSpeculativeExecution();
      
      if (status !== OperationStatus.SpeculativeSuccess) {
        throw new Error("Burn operation failed");
      }

      // Refresh stats after successful burn
      await refresh();
      
      return true;
    } catch (err) {
      console.error("Burn failed:", err);
      setError(err instanceof Error ? err.message : "Burn failed");
      return false;
    } finally {
      setIsBurning(false);
    }
  }, [provider, refresh]);

  return {
    totalBurned,
    burnCount,
    recentBurns,
    leaderboard,
    isLoading,
    error,
    isBurning,
    burn,
    refresh,
  };
}
