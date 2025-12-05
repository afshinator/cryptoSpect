// stores/coinListsStore.ts
// Zustand store for managing coin lists with AsyncStorage persistence

import { usePrefsStore } from '@/stores/prefsStore';
import { withDevtools } from '@/stores/storeHelpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { COINLISTS_STORAGE_KEY } from '@/features/lists/constants';
import { CoinList, CoinListItem, CoinListsState } from '@/features/lists/types';

/**
 * Generate a unique list ID
 */
function generateListId(): string {
  return `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate list name uniqueness (case-insensitive)
 */
function isListNameUnique(
  lists: CoinList[],
  name: string,
  excludeId?: string
): boolean {
  const trimmedName = name.trim().toLowerCase();
  return !lists.some(
    (list) =>
      list.id !== excludeId &&
      list.name.trim().toLowerCase() === trimmedName
  );
}

const coinListsStateCreator: StateCreator<CoinListsState> = (set, get) => ({
  // Initial state
  lists: [],
  top20List: null,
  _hasHydrated: false,

  // Actions
  createList: async (name: string) => {
    const state = get();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { error: 'List name cannot be empty' };
    }

    // Check uniqueness
    if (!isListNameUnique(state.lists, trimmedName)) {
      return { error: 'A list with this name already exists' };
    }

    const newList: CoinList = {
      id: generateListId(),
      name: trimmedName,
      coins: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      lists: [...state.lists, newList],
    }));

    // Zustand persist middleware handles storage automatically
    return newList;
  },

  updateList: async (id: string, updates: Partial<Pick<CoinList, 'name' | 'notes' | 'image'>>) => {
    const state = get();
    const listIndex = state.lists.findIndex((l) => l.id === id);

    if (listIndex === -1) {
      return { error: 'List not found' };
    }

    const list = state.lists[listIndex];
    const updatedList = { ...list };

    // Handle name update with uniqueness check
    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (!trimmedName) {
        return { error: 'List name cannot be empty' };
      }
      if (!isListNameUnique(state.lists, trimmedName, id)) {
        return { error: 'A list with this name already exists' };
      }
      updatedList.name = trimmedName;
    }

    // Handle other updates
    if (updates.notes !== undefined) {
      updatedList.notes = updates.notes;
    }
    if (updates.image !== undefined) {
      updatedList.image = updates.image;
    }

    updatedList.updatedAt = Date.now();

    const newLists = [...state.lists];
    newLists[listIndex] = updatedList;

    set({ lists: newLists });

    // Zustand persist middleware handles storage automatically
    return updatedList;
  },

  deleteList: async (id: string) => {
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== id),
    }));

    // Zustand persist middleware handles storage automatically
  },

  addCoinToList: async (listId: string, coin: Omit<CoinListItem, 'addedAt'>) => {
    const state = get();
    const listIndex = state.lists.findIndex((l) => l.id === listId);

    if (listIndex === -1) {
      return { error: 'List not found' };
    }

    const list = state.lists[listIndex];

    // Check for duplicate (exact match by coinId)
    if (list.coins.some((c) => c.coinId === coin.coinId)) {
      return { error: 'Coin already exists in this list' };
    }

    // Get user's currency preference
    const userCurrency = usePrefsStore.getState().currency;

    const newCoin: CoinListItem = {
      ...coin,
      addedAt: Date.now(),
      vsCurrency: coin.vsCurrency || userCurrency,
    };

    const updatedList: CoinList = {
      ...list,
      coins: [...list.coins, newCoin],
      updatedAt: Date.now(),
    };

    const newLists = [...state.lists];
    newLists[listIndex] = updatedList;

    set({ lists: newLists });

    // Zustand persist middleware handles storage automatically
    return updatedList;
  },

  removeCoinFromList: async (listId: string, coinId: string) => {
    const state = get();
    const listIndex = state.lists.findIndex((l) => l.id === listId);

    if (listIndex === -1) {
      return;
    }

    const list = state.lists[listIndex];

    // Normalize coinId to lowercase for comparison (as per docs)
    const normalizedCoinId = coinId.toLowerCase();
    const updatedCoins = list.coins.filter(
      (c) => c.coinId.toLowerCase() !== normalizedCoinId
    );

    const updatedList: CoinList = {
      ...list,
      coins: updatedCoins,
      updatedAt: Date.now(),
    };

    const newLists = [...state.lists];
    newLists[listIndex] = updatedList;

    set({ lists: newLists });

    // Zustand persist middleware handles storage automatically
  },

  updateCoinNotes: async (listId: string, coinId: string, notes: string) => {
    const state = get();
    const listIndex = state.lists.findIndex((l) => l.id === listId);

    if (listIndex === -1) {
      return;
    }

    const list = state.lists[listIndex];
    const coinIndex = list.coins.findIndex((c) => c.coinId === coinId);

    if (coinIndex === -1) {
      return;
    }

    const updatedCoins = [...list.coins];
    updatedCoins[coinIndex] = {
      ...updatedCoins[coinIndex],
      notes: notes.trim(),
    };

    const updatedList: CoinList = {
      ...list,
      coins: updatedCoins,
      updatedAt: Date.now(),
    };

    const newLists = [...state.lists];
    newLists[listIndex] = updatedList;

    set({ lists: newLists });

    // Zustand persist middleware handles storage automatically
  },

  getList: (id: string) => {
    return get().lists.find((l) => l.id === id);
  },

  getAllLists: () => {
    return get().lists;
  },

  setTop20List: (list: CoinList | null) => {
    set({ top20List: list });
  },

  setHasHydrated: (state: boolean) => {
    set({ _hasHydrated: state });
  },
});

export const useCoinListsStore = create<CoinListsState>()(
  persist(
    withDevtools(coinListsStateCreator, 'CoinListsStore'),
    {
      name: COINLISTS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log('🔄 CoinListsStore: Starting rehydration...');
        return (state, error) => {
          if (error) {
            console.error('❌ CoinListsStore: Rehydration error:', error);
          } else {
            console.log('✅ CoinListsStore: Rehydrated from storage');
            console.log('📦 Full state object:', JSON.stringify(state, null, 2));
            console.log('📋 Lists array:', state?.lists);
            console.log('📊 Lists count:', state?.lists?.length || 0);
            console.log('🔝 Top20List exists:', state?.top20List !== null);
            console.log('💧 Has hydrated flag:', state?._hasHydrated);
          }
          state?.setHasHydrated(true);
        };
      },
      partialize: (state) => {
        const { _hasHydrated, top20List, ...rest } = state;
        console.log('💾 CoinListsStore: Partializing state for storage');
        console.log('📦 What will be saved:', JSON.stringify(rest, null, 2));
        console.log('📋 Lists to save:', rest.lists);
        console.log('📊 Lists count to save:', rest.lists?.length || 0);
        return rest;
      },
    }
  )
);

// Log all state changes
if (__DEV__) {
  useCoinListsStore.subscribe((state, prevState) => {
    console.log('🔄 CoinListsStore: State changed');
    console.log('📦 Current state:', {
      listsCount: state.lists.length,
      lists: state.lists.map(l => ({ id: l.id, name: l.name, coinsCount: l.coins.length })),
      top20ListExists: state.top20List !== null,
      hasHydrated: state._hasHydrated,
    });
    console.log('📦 Previous state:', {
      listsCount: prevState.lists.length,
      lists: prevState.lists.map(l => ({ id: l.id, name: l.name, coinsCount: l.coins.length })),
      top20ListExists: prevState.top20List !== null,
      hasHydrated: prevState._hasHydrated,
    });
  });
}

