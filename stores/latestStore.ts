// stores/latestStore.ts

/**
 * NOTE: SSR-Safe Storage
 * 
 * This store uses createSSRSafeStorage() instead of AsyncStorage directly to handle
 * server-side rendering (SSR) introduced in Expo Router 6.0.17+. During SSR, window
 * is not available, so we use a wrapper that safely handles this case.
 * 
 * See: utils/storage.ts for implementation details.
 */

import { DEFAULT_LATEST, LATEST_STORAGE_KEY } from '@/constants/stores';
import { CurrentVolatilityResponse } from '@/features/currentVolatility/api';
import { CurrentDominanceResponse } from '@/features/dominance/current/api';
import { CoinMaps, MarketsResponse } from '@/features/marketsData/api';
import { VwatrResponse } from '@/features/vwatr/api';
import { createSSRSafeStorage } from '@/utils/storage';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { withDevtools } from './storeHelpers';

export interface LatestState {
  // NOTE: This state is persisted to AsyncStorage.
  // Data survives app restarts and can be used to check if refresh is needed via fetchedAt timestamps.
  
  currentVolatilityData: CurrentVolatilityResponse | null;
  currentDominanceData: CurrentDominanceResponse | null;
  vwatrData: VwatrResponse | null;
  marketsData: MarketsResponse | null;
  coinMaps: CoinMaps | null;
  _hasHydrated: boolean;

  // Actions
  setCurrentVolatilityData: (data: CurrentVolatilityResponse | null) => void;
  setCurrentDominanceData: (data: CurrentDominanceResponse | null) => void;
  setVwatrData: (data: VwatrResponse | null) => void;
  setMarketsData: (data: MarketsResponse | null) => void;
  setCoinMaps: (maps: CoinMaps | null) => void;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Retrieves all fetchedAt timestamps from LatestState
 * @param state The LatestState object
 * @returns Object containing fetchedAt timestamps for each data field, or null if data doesn't exist
 */
export function getFetchedAtTimestampsOfLatest(state: LatestState): {
  currentVolatilityData: number | null;
  currentDominanceData: number | null;
  vwatrData: number | null;
  marketsData: number | null;
  coinMaps: number | null;
} {
  return {
    currentVolatilityData: state.currentVolatilityData?.fetchedAt ?? null,
    currentDominanceData: state.currentDominanceData?.fetchedAt ?? null,
    vwatrData: state.vwatrData?.fetchedAt ?? null,
    marketsData: state.marketsData?.fetchedAt ?? null,
    coinMaps: state.coinMaps?.fetchedAt ?? null,
  };
}

const latestStateCreator: StateCreator<LatestState> = (set) => ({
  // Initial state
  currentVolatilityData: DEFAULT_LATEST.currentVolatilityData,
  currentDominanceData: DEFAULT_LATEST.currentDominanceData,
  vwatrData: DEFAULT_LATEST.vwatrData,
  marketsData: DEFAULT_LATEST.marketsData,
  coinMaps: DEFAULT_LATEST.coinMaps,
  _hasHydrated: false,

  // Actions
  setCurrentVolatilityData: (data) => set({ currentVolatilityData: data }),
  setCurrentDominanceData: (data) => set({ currentDominanceData: data }),
  setVwatrData: (data) => set({ vwatrData: data }),
  setMarketsData: (data) => set({ marketsData: data }),
  setCoinMaps: (maps) => set({ coinMaps: maps }),
  setHasHydrated: (state) => set({ _hasHydrated: state }),
});

export const useLatestStore = create<LatestState>()(
  persist(
    withDevtools(latestStateCreator, 'LatestStore') as StateCreator<LatestState>,
    {
      name: LATEST_STORAGE_KEY,
      // Use SSR-safe storage wrapper to prevent "window is not defined" errors during SSR
      // (Expo Router 6.0.17+ initializes stores during server-side rendering)
      storage: createJSONStorage(() => createSSRSafeStorage()),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('❌ LatestStore: Rehydration error:', error);
          }
          state?.setHasHydrated(true);
        };
      },
      partialize: (state) => {
        const { _hasHydrated, ...rest } = state;
        return rest;
      },
    }
  )
);

