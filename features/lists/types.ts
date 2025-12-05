// features/lists/types.ts
// Type definitions for the CoinList feature

import { SupportedCurrency } from '@/constants/currency';

/**
 * Individual coin entry within a list
 */
export interface CoinListItem {
  /** Coin identifier from market data API (e.g., 'bitcoin') */
  coinId: string;
  /** Coin symbol (e.g., 'BTC') */
  symbol: string;
  /** Coin name (e.g., 'Bitcoin') */
  name: string;
  /** User-created notes specific to this coin in this list */
  notes?: string;
  /** Optional full market data object (can be refreshed) */
  apiData?: any;
  /** Timestamp when coin was added to list (milliseconds since epoch) */
  addedAt: number;
  /** Currency code for price display */
  vsCurrency: SupportedCurrency;
}

/**
 * A list container that holds multiple coins and metadata
 */
export interface CoinList {
  /** Unique identifier (auto-generated on creation) */
  id: string;
  /** User-defined list name (required, case-insensitive uniqueness enforced) */
  name: string;
  /** Array of coins in this list */
  coins: CoinListItem[];
  /** Timestamp when list was created (milliseconds since epoch) */
  createdAt: number;
  /** Timestamp when list was last modified (milliseconds since epoch) */
  updatedAt: number;
  /** User-created notes for the entire list */
  notes?: string;
  /** Optional image URL or path associated with the list */
  image?: string;
}

/**
 * State for the coin lists store
 */
export interface CoinListsState {
  /** All coin lists */
  lists: CoinList[];
  /** Whether the store has been hydrated from AsyncStorage */
  _hasHydrated: boolean;
  
  // Actions
  /** Create a new list */
  createList: (name: string) => Promise<CoinList | { error: string }>;
  /** Update an existing list */
  updateList: (id: string, updates: Partial<Pick<CoinList, 'name' | 'notes' | 'image'>>) => Promise<CoinList | { error: string }>;
  /** Delete a list */
  deleteList: (id: string) => Promise<void>;
  /** Add a coin to a list */
  addCoinToList: (listId: string, coin: Omit<CoinListItem, 'addedAt'>) => Promise<CoinList | { error: string }>;
  /** Remove a coin from a list */
  removeCoinFromList: (listId: string, coinId: string) => Promise<void>;
  /** Update coin notes */
  updateCoinNotes: (listId: string, coinId: string, notes: string) => Promise<void>;
  /** Get a list by ID */
  getList: (id: string) => CoinList | undefined;
  /** Get all lists */
  getAllLists: () => CoinList[];
  /** Set hydration state */
  setHasHydrated: (state: boolean) => void;
  /** Sync in-memory state to AsyncStorage */
  syncToStorage: () => Promise<void>;
}

