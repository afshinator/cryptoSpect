// stores/latestStore.ts

import { CurrentVolatilityResponse } from '@/features/currentVolatility/api';
import { CurrentDominanceResponse } from '@/features/dominance/current/api';
import { VwatrResponse } from '@/features/vwatr/api';
import { DEFAULT_LATEST } from '@/constants/stores';
import { create, StateCreator } from 'zustand';

export interface LatestState {
  currentVolatilityData: CurrentVolatilityResponse | null;
  currentDominanceData: CurrentDominanceResponse | null;
  vwatrData: VwatrResponse | null;

  // Actions
  setCurrentVolatilityData: (data: CurrentVolatilityResponse | null) => void;
  setCurrentDominanceData: (data: CurrentDominanceResponse | null) => void;
  setVwatrData: (data: VwatrResponse | null) => void;
}

const latestStateCreator: StateCreator<LatestState> = (set) => ({
  // Initial state
  currentVolatilityData: DEFAULT_LATEST.currentVolatilityData,
  currentDominanceData: DEFAULT_LATEST.currentDominanceData,
  vwatrData: DEFAULT_LATEST.vwatrData,

  // Actions
  setCurrentVolatilityData: (data) => set({ currentVolatilityData: data }),
  setCurrentDominanceData: (data) => set({ currentDominanceData: data }),
  setVwatrData: (data) => set({ vwatrData: data }),
});

export const useLatestStore = create<LatestState>()(latestStateCreator);

