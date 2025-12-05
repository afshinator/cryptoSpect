// stores/latestStore.ts

import { CurrentVolatilityResponse } from '@/features/currentVolatility/api';
import { CurrentDominanceResponse } from '@/features/dominance/current/api';
import { VwatrResponse } from '@/features/vwatr/api';
import { MarketsResponse } from '@/utils/markets';
import { DEFAULT_LATEST } from '@/constants/stores';
import { create, StateCreator } from 'zustand';

export interface LatestState {
  currentVolatilityData: CurrentVolatilityResponse | null;
  currentDominanceData: CurrentDominanceResponse | null;
  vwatrData: VwatrResponse | null;
  marketsData: MarketsResponse | null;

  // Actions
  setCurrentVolatilityData: (data: CurrentVolatilityResponse | null) => void;
  setCurrentDominanceData: (data: CurrentDominanceResponse | null) => void;
  setVwatrData: (data: VwatrResponse | null) => void;
  setMarketsData: (data: MarketsResponse | null) => void;
}

const latestStateCreator: StateCreator<LatestState> = (set) => ({
  // Initial state
  currentVolatilityData: DEFAULT_LATEST.currentVolatilityData,
  currentDominanceData: DEFAULT_LATEST.currentDominanceData,
  vwatrData: DEFAULT_LATEST.vwatrData,
  marketsData: DEFAULT_LATEST.marketsData,

  // Actions
  setCurrentVolatilityData: (data) => set({ currentVolatilityData: data }),
  setCurrentDominanceData: (data) => set({ currentDominanceData: data }),
  setVwatrData: (data) => set({ vwatrData: data }),
  setMarketsData: (data) => set({ marketsData: data }),
});

export const useLatestStore = create<LatestState>()(latestStateCreator);

