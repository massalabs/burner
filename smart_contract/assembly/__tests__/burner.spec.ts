import { Args } from '@massalabs/as-types';
import { 
  constructor, 
  burn, 
  getTotalBurnedAmount, 
  getBurnCount,
  getAddressBurnedAmount,
  BURN_COUNTER_KEY,
  TOTAL_BURNED_KEY,
  BURN_HISTORY_TAG,
  ADDR_TOTAL_TAG,
  LEADERBOARD_TAG,
  createBurnHistoryKey,
  createAddrTotalKey,
  createLeaderboardKey,
  NULL_ADDRESS
} from '../contracts/main';
import { Storage } from '@massalabs/massa-as-sdk';
import { 
  setDeployContext, 
  setLocalContext, 
  mockBalance, 
  mockTransferredCoins,
  resetStorage 
} from '@massalabs/massa-as-sdk/assembly/vm-mock';

const TEST_CALLER = "AU122Em8qkqegdLb1eyH8rdkSCNEf7RZLeTJve4Q2inRPGiTJ2xNv";
const TEST_CALLER_2 = "AU12dG5xP1RDEB5ocdHkymNVvvSJmUL9BgHwCkkDow5GW3VMiYomj";

function u64ToBEBytes(val: u64): StaticArray<u8> {
  let arr = new StaticArray<u8>(8);
  arr[0] = ((val >> 56) & 0xFF) as u8;
  arr[1] = ((val >> 48) & 0xFF) as u8;
  arr[2] = ((val >> 40) & 0xFF) as u8;
  arr[3] = ((val >> 32) & 0xFF) as u8;
  arr[4] = ((val >> 24) & 0xFF) as u8;
  arr[5] = ((val >> 16) & 0xFF) as u8;
  arr[6] = ((val >> 8) & 0xFF) as u8;
  arr[7] = (val & 0xFF) as u8;
  return arr;
}

function BEBytesToU64(arr: StaticArray<u8>): u64 {
  let result: u64 = 0;
  result |= (arr[0] as u64) << 56;
  result |= (arr[1] as u64) << 48;
  result |= (arr[2] as u64) << 40;
  result |= (arr[3] as u64) << 32;
  result |= (arr[4] as u64) << 24;
  result |= (arr[5] as u64) << 16;
  result |= (arr[6] as u64) << 8;
  result |= arr[7] as u64;
  return result;
}

// Run once per file
beforeAll(() => {
  resetStorage();
  setDeployContext();
  constructor([]);
  mockBalance(TEST_CALLER, 100_000_000_000_000); // 100k MAS
  mockBalance(TEST_CALLER_2, 100_000_000_000_000); // 100k MAS
});

describe('Burner Contract Tests', () => {
  test('Burn records history and updates counters', () => {
    setLocalContext(TEST_CALLER);
    const burnAmount: u64 = 1_000_000_000;
    mockTransferredCoins(burnAmount);
    
    const result = burn([]);
    const resultArgs = new Args(result);
    const burnId = resultArgs.nextU64().expect("Burn ID not returned");
    
    // Burn ID should be present (could be 0 or higher depending on previous tests)
    expect(burnId >= 0).toBe(true);
    
    // Total burned should include this burn
    const totalResult = getTotalBurnedAmount([]);
    const totalArgs = new Args(totalResult);
    const total = totalArgs.nextU64().expect("Total not returned");
    expect(total >= burnAmount).toBe(true);
    
    const historyKey = createBurnHistoryKey(burnId, TEST_CALLER, burnAmount);
    expect(Storage.has(historyKey)).toBe(true);
  });

  test('getTotalBurnedAmount returns increasing value', () => {
    setLocalContext(TEST_CALLER);
    
    const beforeResult = getTotalBurnedAmount([]);
    const beforeArgs = new Args(beforeResult);
    const before = beforeArgs.nextU64().expect("Before total not returned");
    
    const burnAmount: u64 = 500_000_000;
    mockTransferredCoins(burnAmount);
    burn([]);
    
    const afterResult = getTotalBurnedAmount([]);
    const afterArgs = new Args(afterResult);
    const after = afterArgs.nextU64().expect("After total not returned");
    
    expect(after).toBe(before + burnAmount);
  });

  test('getBurnCount increments correctly', () => {
    setLocalContext(TEST_CALLER);
    
    const beforeResult = getBurnCount([]);
    const beforeArgs = new Args(beforeResult);
    const before = beforeArgs.nextU64().expect("Before count not returned");
    
    mockTransferredCoins(100_000_000);
    burn([]);
    mockTransferredCoins(200_000_000);
    burn([]);
    
    const afterResult = getBurnCount([]);
    const afterArgs = new Args(afterResult);
    const after = afterArgs.nextU64().expect("After count not returned");
    
    expect(after).toBe(before + 2);
  });

  test('History keys exist after burns', () => {
    setLocalContext(TEST_CALLER);
    
    mockTransferredCoins(100_000_000);
    burn([]);
    mockTransferredCoins(200_000_000);
    burn([]);
    mockTransferredCoins(300_000_000);
    burn([]);
    
    const historyKeys = Storage.getKeys(BURN_HISTORY_TAG);
    expect(historyKeys.length >= 3).toBe(true);
  });

  test('Null address constant is correct', () => {
    expect(NULL_ADDRESS).toBe("AU1111111111111111111111111111111112m1s9K");
  });
});

describe('Leaderboard Tests', () => {
  test('Address total is tracked correctly', () => {
    setLocalContext(TEST_CALLER);
    
    // Get current address total
    let args = new Args().add(TEST_CALLER).serialize();
    const beforeResult = getAddressBurnedAmount(args);
    const beforeArgs = new Args(beforeResult);
    const before = beforeArgs.nextU64().expect("Before total not returned");
    
    const burn1: u64 = 111_000_000;
    const burn2: u64 = 222_000_000;
    
    mockTransferredCoins(burn1);
    burn([]);
    mockTransferredCoins(burn2);
    burn([]);
    
    // Check address total increased
    args = new Args().add(TEST_CALLER).serialize();
    const afterResult = getAddressBurnedAmount(args);
    const afterArgs = new Args(afterResult);
    const after = afterArgs.nextU64().expect("After total not returned");
    
    expect(after).toBe(before + burn1 + burn2);
  });

  test('Leaderboard entry is created', () => {
    setLocalContext(TEST_CALLER);
    
    // Get current address total
    const args = new Args().add(TEST_CALLER).serialize();
    const totalResult = getAddressBurnedAmount(args);
    const totalArgs = new Args(totalResult);
    const currentTotal = totalArgs.nextU64().expect("Current total not returned");
    
    const burnAmount: u64 = 333_000_000;
    mockTransferredCoins(burnAmount);
    burn([]);
    
    // New leaderboard entry should exist with updated total
    const newTotal = currentTotal + burnAmount;
    const leaderboardKey = createLeaderboardKey(newTotal, TEST_CALLER);
    expect(Storage.has(leaderboardKey)).toBe(true);
  });

  test('Old leaderboard entry is deleted on update', () => {
    setLocalContext(TEST_CALLER);
    
    // Get current address total
    const args = new Args().add(TEST_CALLER).serialize();
    const totalResult = getAddressBurnedAmount(args);
    const totalArgs = new Args(totalResult);
    const currentTotal = totalArgs.nextU64().expect("Current total not returned");
    
    const burn1: u64 = 444_000_000;
    mockTransferredCoins(burn1);
    burn([]);
    
    // Leaderboard entry exists for total after first burn
    const leaderboardKey1 = createLeaderboardKey(currentTotal + burn1, TEST_CALLER);
    expect(Storage.has(leaderboardKey1)).toBe(true);
    
    const burn2: u64 = 555_000_000;
    mockTransferredCoins(burn2);
    burn([]);
    
    // Old leaderboard entry should be deleted
    expect(Storage.has(leaderboardKey1)).toBe(false);
    
    // New leaderboard entry should exist with updated total
    const leaderboardKey2 = createLeaderboardKey(currentTotal + burn1 + burn2, TEST_CALLER);
    expect(Storage.has(leaderboardKey2)).toBe(true);
  });

  test('Different address creates its own leaderboard entry', () => {
    setLocalContext(TEST_CALLER_2);
    const args = new Args().add(TEST_CALLER_2).serialize();
    const totalResult = getAddressBurnedAmount(args);
    const totalArgs = new Args(totalResult);
    const caller2Total = totalArgs.nextU64().expect("Caller2 total not returned");
    
    const burnAmount: u64 = 777_000_000;
    mockTransferredCoins(burnAmount);
    burn([]);
    
    // Check that leaderboard entry exists for TEST_CALLER_2
    const leaderboardKey = createLeaderboardKey(caller2Total + burnAmount, TEST_CALLER_2);
    expect(Storage.has(leaderboardKey)).toBe(true);
    
    // Check address total was updated
    const newTotalResult = getAddressBurnedAmount(args);
    const newTotalArgs = new Args(newTotalResult);
    const newTotal = newTotalArgs.nextU64().expect("New total not returned");
    expect(newTotal).toBe(caller2Total + burnAmount);
  });
});
