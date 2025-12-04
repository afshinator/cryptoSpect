// stores/apiBlockingStore.ts
// Store for managing API blocking per feature and global API switches

import { DataSource, FeatureId, getFeatureIds } from '@/constants/features';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Blocking state for a feature's data sources
 */
export interface FeatureBlockingState {
  /** Whether the default (primary) data source is blocked */
  blockDefault: boolean;
  /** Whether the alternate data source is blocked */
  blockAlternate: boolean;
}

/**
 * Global API blocking state
 */
export interface GlobalBlockingState {
  /** Whether the backend API (EXPO_PUBLIC_BACKEND_BASE_URL) is blocked globally */
  blockBackend: boolean;
  /** Whether CoinGecko API is blocked globally */
  blockCoinGecko: boolean;
}

/**
 * API blocking store state
 */
export interface ApiBlockingState {
  /** Per-feature blocking states */
  featureBlocking: Record<FeatureId, FeatureBlockingState>;
  /** Global API blocking states */
  globalBlocking: GlobalBlockingState;
  _hasHydrated: boolean;

  // Actions
  setFeatureBlocking: (featureId: FeatureId, blocking: Partial<FeatureBlockingState>) => void;
  setGlobalBlocking: (blocking: Partial<GlobalBlockingState>) => void;
  resetFeatureBlocking: (featureId: FeatureId) => void;
  resetAllBlocking: () => void;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Default blocking state for a feature
 */
const DEFAULT_FEATURE_BLOCKING: FeatureBlockingState = {
  blockDefault: false,
  blockAlternate: false,
};

/**
 * Default global blocking state
 */
const DEFAULT_GLOBAL_BLOCKING: GlobalBlockingState = {
  blockBackend: false,
  blockCoinGecko: false,
};

/**
 * Initialize default feature blocking states
 */
function getDefaultFeatureBlocking(): Record<FeatureId, FeatureBlockingState> {
  const featureBlocking: Record<FeatureId, FeatureBlockingState> = {} as Record<FeatureId, FeatureBlockingState>;
  const featureIds = getFeatureIds();
  featureIds.forEach((featureId) => {
    featureBlocking[featureId] = { ...DEFAULT_FEATURE_BLOCKING };
  });
  return featureBlocking;
}

const apiBlockingStateCreator: StateCreator<ApiBlockingState> = (set, get) => ({
  // Initial state
  featureBlocking: getDefaultFeatureBlocking(),
  globalBlocking: DEFAULT_GLOBAL_BLOCKING,
  _hasHydrated: false,

  // Actions
  setFeatureBlocking: (featureId, blocking) => {
    set((state) => ({
      featureBlocking: {
        ...state.featureBlocking,
        [featureId]: {
          ...state.featureBlocking[featureId] || { ...DEFAULT_FEATURE_BLOCKING },
          ...blocking,
        },
      },
    }));
  },

  setGlobalBlocking: (blocking) => {
    set((state) => ({
      globalBlocking: {
        ...state.globalBlocking,
        ...blocking,
      },
    }));
  },

  resetFeatureBlocking: (featureId) => {
    set((state) => ({
      featureBlocking: {
        ...state.featureBlocking,
        [featureId]: { ...DEFAULT_FEATURE_BLOCKING },
      },
    }));
  },

  resetAllBlocking: () => {
    set({
      featureBlocking: getDefaultFeatureBlocking(),
      globalBlocking: DEFAULT_GLOBAL_BLOCKING,
    });
  },

  setHasHydrated: (state) => set({ _hasHydrated: state }),
});

export const API_BLOCKING_STORAGE_KEY = 'apiBlocking';

export const useApiBlockingStore = create<ApiBlockingState>()(
  persist(
    apiBlockingStateCreator,
    {
      name: API_BLOCKING_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => {
        const { _hasHydrated, ...rest } = state;
        return rest;
      },
    }
  )
);

/**
 * Check if a feature's data source is blocked
 * @param featureId The feature ID
 * @param dataSource The data source to check ('default' or 'alternate')
 * @returns true if the data source is blocked for this feature
 */
export function isFeatureDataSourceBlocked(
  featureId: FeatureId,
  dataSource: DataSource
): boolean {
  const state = useApiBlockingStore.getState();
  const featureBlocking = state.featureBlocking[featureId];
  
  if (!featureBlocking) {
    return false;
  }

  if (dataSource === 'default') {
    return featureBlocking.blockDefault;
  } else {
    return featureBlocking.blockAlternate;
  }
}

/**
 * Check if a global API is blocked
 * @param apiType 'backend' or 'coingecko'
 * @returns true if the API is blocked globally
 */
export function isGlobalApiBlocked(apiType: 'backend' | 'coingecko'): boolean {
  const state = useApiBlockingStore.getState();
  
  if (apiType === 'backend') {
    return state.globalBlocking.blockBackend;
  } else {
    return state.globalBlocking.blockCoinGecko;
  }
}

/**
 * Check if an endpoint should be blocked for a feature
 * @param featureId The feature making the call
 * @param endpointKey The endpoint key being called
 * @param dataSource The data source type ('default' or 'alternate')
 * @returns true if the endpoint should be blocked
 */
export function shouldBlockEndpoint(
  featureId: FeatureId,
  endpointKey: string,
  dataSource: DataSource = 'default'
): boolean {
  // Check global blocking first
  if (endpointKey.includes('CRYPTO_PROXY') || endpointKey.includes('BACKEND')) {
    if (isGlobalApiBlocked('backend')) {
      return true;
    }
  }
  
  if (endpointKey.includes('COINGECKO')) {
    if (isGlobalApiBlocked('coingecko')) {
      return true;
    }
  }

  // Check feature-specific blocking
  return isFeatureDataSourceBlocked(featureId, dataSource);
}

