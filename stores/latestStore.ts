// stores/latestStore.ts

import { CurrentVolatilityResponse } from '@/features/currentVolatility/api';
import { CurrentDominanceResponse } from '@/features/dominance/current/api';
import { DEFAULT_LATEST } from '@/constants/stores';
import { create, StateCreator } from 'zustand';

export interface LatestState {
  currentVolatilityData: CurrentVolatilityResponse | null;
  currentDominanceData: CurrentDominanceResponse | null;

  // Actions
  setCurrentVolatilityData: (data: CurrentVolatilityResponse | null) => void;
  setCurrentDominanceData: (data: CurrentDominanceResponse | null) => void;
}

const latestStateCreator: StateCreator<LatestState> = (set) => ({
  // Initial state
  currentVolatilityData: DEFAULT_LATEST.currentVolatilityData,
  currentDominanceData: DEFAULT_LATEST.currentDominanceData,

  // Actions
  setCurrentVolatilityData: (data) => set({ currentVolatilityData: data }),
  setCurrentDominanceData: (data) => set({ currentDominanceData: data }),
});

export const useLatestStore = create<LatestState>()(latestStateCreator);

