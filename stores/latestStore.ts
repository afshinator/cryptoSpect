// stores/latestStore.ts

import { CurrentVolatilityResponse } from '@/features/currentVolatility/api';
import { DEFAULT_LATEST } from '@/constants/stores';
import { create, StateCreator } from 'zustand';

export interface LatestState {
  currentVolatilityData: CurrentVolatilityResponse | null;

  // Actions
  setCurrentVolatilityData: (data: CurrentVolatilityResponse | null) => void;
}

const latestStateCreator: StateCreator<LatestState> = (set) => ({
  // Initial state
  currentVolatilityData: DEFAULT_LATEST.currentVolatilityData,

  // Actions
  setCurrentVolatilityData: (data) => set({ currentVolatilityData: data }),
});

export const useLatestStore = create<LatestState>()(latestStateCreator);

