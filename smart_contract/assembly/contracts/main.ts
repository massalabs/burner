/**
 * Massa Burner Smart Contract
 * 
 * This contract allows users to burn MAS coins by sending them to the null address.
 * It keeps track of all burns in a history that can be queried lexicographically
 * to list the latest burns first.
 * 
 * Storage layout:
 * - BURN_COUNTER_KEY: u64 counter of total burn operations
 * - TOTAL_BURNED_KEY: u64 total amount of MAS burned (in nanoMAS)
 * - BURN_HISTORY_TAG + [U64_MAX - counter] + [address bytes] + [amount_u64]: empty value
 *   This key format allows listing burns from newest to oldest via lexicographic iteration
 * - ADDR_TOTAL_TAG + [address bytes]: u64 total burned by this address
 * - LEADERBOARD_TAG + [U64_MAX - total] + [address bytes]: empty value
 *   This key format allows listing top burners via lexicographic iteration
 */

import { Address, Context, Storage, transferCoins, generateEvent } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';

// The null address where coins are burned
export const NULL_ADDRESS = 'AU1111111111111111111111111111111112m1s9K';

// Storage key tags
export const BURN_COUNTER_KEY: StaticArray<u8> = [0x00];
export const TOTAL_BURNED_KEY: StaticArray<u8> = [0x01];
export const BURN_HISTORY_TAG: StaticArray<u8> = [0x02];
export const ADDR_TOTAL_TAG: StaticArray<u8> = [0x03];
export const LEADERBOARD_TAG: StaticArray<u8> = [0x04];

/**
 * Convert a u64 to big-endian bytes (8 bytes)
 */
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

/**
 * Convert big-endian bytes to u64
 */
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

/**
 * Get the current burn counter value
 */
function getBurnCounter(): u64 {
  if (Storage.has(BURN_COUNTER_KEY)) {
    return BEBytesToU64(Storage.get(BURN_COUNTER_KEY));
  }
  return 0;
}

/**
 * Increment and store the burn counter
 */
function incrementBurnCounter(): u64 {
  const counter = getBurnCounter();
  const newCounter = counter + 1;
  Storage.set(BURN_COUNTER_KEY, u64ToBEBytes(newCounter));
  return counter; // return the old counter to use as ID
}

/**
 * Get the total amount burned
 */
export function getTotalBurned(): u64 {
  if (Storage.has(TOTAL_BURNED_KEY)) {
    return BEBytesToU64(Storage.get(TOTAL_BURNED_KEY));
  }
  return 0;
}

/**
 * Add to the total burned amount
 */
function addToTotalBurned(amount: u64): void {
  const current = getTotalBurned();
  Storage.set(TOTAL_BURNED_KEY, u64ToBEBytes(current + amount));
}

/**
 * Create a burn history key
 * Format: [BURN_HISTORY_TAG][U64_MAX - counter][address_len][address][amount_u64]
 * Using U64_MAX - counter ensures lexicographic ordering from newest to oldest
 */
export function createBurnHistoryKey(counter: u64, address: string, amount: u64): StaticArray<u8> {
  const invertedCounter = u64.MAX_VALUE - counter;
  const addressBytes = stringToBytes(address);
  const addressLenByte: StaticArray<u8> = [addressBytes.length as u8];
  
  return BURN_HISTORY_TAG
    .concat(u64ToBEBytes(invertedCounter))
    .concat(addressLenByte)
    .concat(addressBytes)
    .concat(u64ToBEBytes(amount));
}

/**
 * Create a key for storing address total burned
 * Format: [ADDR_TOTAL_TAG][address_len][address]
 */
export function createAddrTotalKey(address: string): StaticArray<u8> {
  const addressBytes = stringToBytes(address);
  const addressLenByte: StaticArray<u8> = [addressBytes.length as u8];
  return ADDR_TOTAL_TAG.concat(addressLenByte).concat(addressBytes);
}

/**
 * Create a leaderboard key
 * Format: [LEADERBOARD_TAG][U64_MAX - total][address_len][address]
 * Using U64_MAX - total ensures lexicographic ordering from highest to lowest
 */
export function createLeaderboardKey(total: u64, address: string): StaticArray<u8> {
  const invertedTotal = u64.MAX_VALUE - total;
  const addressBytes = stringToBytes(address);
  const addressLenByte: StaticArray<u8> = [addressBytes.length as u8];
  return LEADERBOARD_TAG
    .concat(u64ToBEBytes(invertedTotal))
    .concat(addressLenByte)
    .concat(addressBytes);
}

/**
 * Get the total burned amount for an address
 */
function getAddrTotalBurned(address: string): u64 {
  const key = createAddrTotalKey(address);
  if (Storage.has(key)) {
    return BEBytesToU64(Storage.get(key));
  }
  return 0;
}

/**
 * Update the address total and leaderboard index
 */
function updateAddrTotal(address: string, additionalAmount: u64): void {
  const oldTotal = getAddrTotalBurned(address);
  const newTotal = oldTotal + additionalAmount;
  
  // Delete old leaderboard entry if it exists
  if (oldTotal > 0) {
    const oldLeaderboardKey = createLeaderboardKey(oldTotal, address);
    if (Storage.has(oldLeaderboardKey)) {
      Storage.del(oldLeaderboardKey);
    }
  }
  
  // Update address total
  const addrTotalKey = createAddrTotalKey(address);
  Storage.set(addrTotalKey, u64ToBEBytes(newTotal));
  
  // Add new leaderboard entry
  const newLeaderboardKey = createLeaderboardKey(newTotal, address);
  Storage.set(newLeaderboardKey, new StaticArray<u8>(0));
}

/**
 * Constructor - called when the contract is deployed
 */
export function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Constructor can only be called during deployment");
  
  // Initialize counters
  Storage.set(BURN_COUNTER_KEY, u64ToBEBytes(0));
  Storage.set(TOTAL_BURNED_KEY, u64ToBEBytes(0));
  
  generateEvent("Burner contract deployed");
}

/**
 * Burn MAS coins
 * 
 * This function takes the attached coins and sends them to the null address.
 * It records the burn in the history and updates the total burned counter.
 * 
 * @param _ - unused arguments
 * @returns empty array
 */
export function burn(_: StaticArray<u8>): StaticArray<u8> {
  const amount = Context.transferredCoins();
  assert(amount > 0, "Must send some MAS to burn");
  
  const burnerAddress = Context.caller().toString();
  
  // Get a burn ID and increment counter
  const burnId = incrementBurnCounter();
  
  // Record the burn in history
  const historyKey = createBurnHistoryKey(burnId, burnerAddress, amount);
  Storage.set(historyKey, new StaticArray<u8>(0));
  
  // Update total burned
  addToTotalBurned(amount);
  
  // Update address total and leaderboard
  updateAddrTotal(burnerAddress, amount);
  
  // Transfer coins to null address (burn them)
  transferCoins(new Address(NULL_ADDRESS), amount);
  
  // Emit event
  generateEvent(`Burn: ${burnerAddress} burned ${amount.toString()} nanoMAS (ID: ${burnId.toString()})`);
  
  // Return the burn ID
  return new Args().add(burnId).serialize();
}

/**
 * Get the total amount of MAS burned (in nanoMAS)
 * 
 * @param _ - unused arguments
 * @returns serialized u64 total burned amount
 */
export function getTotalBurnedAmount(_: StaticArray<u8>): StaticArray<u8> {
  return new Args().add(getTotalBurned()).serialize();
}

/**
 * Get the total number of burn operations
 * 
 * @param _ - unused arguments
 * @returns serialized u64 burn count
 */
export function getBurnCount(_: StaticArray<u8>): StaticArray<u8> {
  return new Args().add(getBurnCounter()).serialize();
}

/**
 * Get the total burned amount for a specific address
 * 
 * @param args - serialized address string
 * @returns serialized u64 total burned by this address
 */
export function getAddressBurnedAmount(args: StaticArray<u8>): StaticArray<u8> {
  const argsDeser = new Args(args);
  const address = argsDeser.nextString().expect("Address is required");
  const total = getAddrTotalBurned(address);
  return new Args().add(total).serialize();
}
