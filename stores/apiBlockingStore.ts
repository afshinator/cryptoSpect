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
  /** Whether the primary (backend) data source is blocked */
  blockPrimary: boolean;
  /** Whether the secondary (CoinGecko) data source is blocked */
  blockSecondary: boolean;
}

/**
 * Data source preferences for a feature
 */
export interface FeatureDataSourcePreferences {
  /** Preferred data source ('primary' or 'secondary') */
  preferredDataSource: DataSource;
  /** Whether to automatically fallback to other source if preferred fails */
  enableFallback: boolean;
  /** Whether to use global preferences (true) or feature-specific preferences (false) */
  useGlobalPreferences: boolean;
}

/**
 * Global data source preferences
 */
export interface GlobalDataSourcePreferences {
  /** Preferred data source ('primary' or 'secondary') */
  preferredDataSource: DataSource;
  /** Whether to automatically fallback to other source if preferred fails */
  enableFallback: boolean;
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
  /** Per-feature data source preferences */
  featurePreferences: Record<FeatureId, FeatureDataSourcePreferences>;
  /** Global data source preferences */
  globalPreferences: GlobalDataSourcePreferences;
  _hasHydrated: boolean;

  // Actions
  setFeatureBlocking: (featureId: FeatureId, blocking: Partial<FeatureBlockingState>) => void;
  setGlobalBlocking: (blocking: Partial<GlobalBlockingState>) => void;
  setFeaturePreferences: (featureId: FeatureId, preferences: Partial<FeatureDataSourcePreferences>) => void;
  setGlobalPreferences: (preferences: Partial<GlobalDataSourcePreferences>) => void;
  resetFeatureBlocking: (featureId: FeatureId) => void;
  resetAllBlocking: () => void;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Default blocking state for a feature
 */
const DEFAULT_FEATURE_BLOCKING: FeatureBlockingState = {
  blockPrimary: false,
  blockSecondary: false,
};

/**
 * Default data source preferences for a feature
 */
const DEFAULT_FEATURE_PREFERENCES: FeatureDataSourcePreferences = {
  preferredDataSource: 'primary',
  enableFallback: true,
  useGlobalPreferences: true,
};

/**
 * Default global data source preferences
 */
const DEFAULT_GLOBAL_PREFERENCES: GlobalDataSourcePreferences = {
  preferredDataSource: 'primary',
  enableFallback: true,
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

/**
 * Initialize default feature preferences
 */
function getDefaultFeaturePreferences(): Record<FeatureId, FeatureDataSourcePreferences> {
  const featurePreferences: Record<FeatureId, FeatureDataSourcePreferences> = {} as Record<FeatureId, FeatureDataSourcePreferences>;
  const featureIds = getFeatureIds();
  featureIds.forEach((featureId) => {
    featurePreferences[featureId] = { ...DEFAULT_FEATURE_PREFERENCES };
  });
  return featurePreferences;
}

const apiBlockingStateCreator: StateCreator<ApiBlockingState> = (set, get) => ({
  // Initial state
  featureBlocking: getDefaultFeatureBlocking(),
  globalBlocking: DEFAULT_GLOBAL_BLOCKING,
  featurePreferences: getDefaultFeaturePreferences(),
  globalPreferences: DEFAULT_GLOBAL_PREFERENCES,
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

  setFeaturePreferences: (featureId, preferences) => {
    set((state) => ({
      featurePreferences: {
        ...state.featurePreferences,
        [featureId]: {
          ...state.featurePreferences[featureId] || { ...DEFAULT_FEATURE_PREFERENCES },
          ...preferences,
        },
      },
    }));
  },

  setGlobalPreferences: (preferences) => {
    set((state) => ({
      globalPreferences: {
        ...state.globalPreferences,
        ...preferences,
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
      featurePreferences: getDefaultFeaturePreferences(),
      globalPreferences: DEFAULT_GLOBAL_PREFERENCES,
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
        if (state) {
          // Initialize preferences if they don't exist (migration from old versions)
          if (!state.featurePreferences) {
            state.featurePreferences = getDefaultFeaturePreferences();
          }
          if (!state.globalPreferences) {
            state.globalPreferences = { ...DEFAULT_GLOBAL_PREFERENCES };
          }
          
          // Migration: Convert old blockDefault/blockAlternate to blockPrimary/blockSecondary
          const featureIds = getFeatureIds();
          featureIds.forEach((featureId) => {
            if (state.featureBlocking && state.featureBlocking[featureId]) {
              const blocking = state.featureBlocking[featureId];
              // Migrate old property names if they exist
              if ('blockDefault' in blocking && !('blockPrimary' in blocking)) {
                (blocking as any).blockPrimary = (blocking as any).blockDefault;
                delete (blocking as any).blockDefault;
              }
              if ('blockAlternate' in blocking && !('blockSecondary' in blocking)) {
                (blocking as any).blockSecondary = (blocking as any).blockAlternate;
                delete (blocking as any).blockAlternate;
              }
            }
            
            // Ensure feature preferences exist
            if (!state.featurePreferences[featureId]) {
              state.featurePreferences[featureId] = { ...DEFAULT_FEATURE_PREFERENCES };
            }
          });
        }
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
 * @param dataSource The data source to check ('primary' or 'secondary')
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

  if (dataSource === 'primary') {
    return featureBlocking.blockPrimary;
  } else {
    return featureBlocking.blockSecondary;
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
 * @param dataSource The data source type ('primary' or 'secondary')
 * @returns true if the endpoint should be blocked
 */
export function shouldBlockEndpoint(
  featureId: FeatureId,
  endpointKey: string,
  dataSource: DataSource = 'primary'
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

/**
 * Get effective preferences for a feature (global or feature-specific)
 * @param featureId The feature ID
 * @returns Effective preferences (global if useGlobalPreferences is true, otherwise feature-specific)
 */
export function getEffectivePreferences(featureId: FeatureId): {
  preferredDataSource: DataSource;
  enableFallback: boolean;
} {
  const state = useApiBlockingStore.getState();
  const featurePrefs = state.featurePreferences[featureId];
  
  if (!featurePrefs || featurePrefs.useGlobalPreferences) {
    return {
      preferredDataSource: state.globalPreferences.preferredDataSource,
      enableFallback: state.globalPreferences.enableFallback,
    };
  }
  
  return {
    preferredDataSource: featurePrefs.preferredDataSource,
    enableFallback: featurePrefs.enableFallback,
  };
}

