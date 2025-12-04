// __tests__/apiBlockingStore.test.js

import {
  isFeatureDataSourceBlocked,
  isGlobalApiBlocked,
  shouldBlockEndpoint,
  useApiBlockingStore,
} from '../stores/apiBlockingStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('apiBlockingStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const store = useApiBlockingStore.getState();
    store.resetAllBlocking();
    store.setHasHydrated(true);
  });

  describe('Initial State', () => {
    it('has default feature blocking states', () => {
      const state = useApiBlockingStore.getState();
      expect(state.featureBlocking.currentVolatility).toEqual({
        blockPrimary: false,
        blockSecondary: false,
      });
    });

    it('has default global blocking states', () => {
      const state = useApiBlockingStore.getState();
      expect(state.globalBlocking).toEqual({
        blockBackend: false,
        blockCoinGecko: false,
      });
    });
  });

  describe('setFeatureBlocking', () => {
    it('sets blocking for primary source', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockPrimary: true });

      const state = useApiBlockingStore.getState();
      expect(state.featureBlocking.currentVolatility.blockPrimary).toBe(true);
      expect(state.featureBlocking.currentVolatility.blockSecondary).toBe(false);
    });

    it('sets blocking for secondary source', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockSecondary: true });

      const state = useApiBlockingStore.getState();
      expect(state.featureBlocking.currentVolatility.blockPrimary).toBe(false);
      expect(state.featureBlocking.currentVolatility.blockSecondary).toBe(true);
    });

    it('sets blocking for both sources', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', {
        blockPrimary: true,
        blockSecondary: true,
      });

      const state = useApiBlockingStore.getState();
      expect(state.featureBlocking.currentVolatility.blockPrimary).toBe(true);
      expect(state.featureBlocking.currentVolatility.blockSecondary).toBe(true);
    });
  });

  describe('setGlobalBlocking', () => {
    it('sets backend blocking', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockBackend: true });

      const state = useApiBlockingStore.getState();
      expect(state.globalBlocking.blockBackend).toBe(true);
      expect(state.globalBlocking.blockCoinGecko).toBe(false);
    });

    it('sets CoinGecko blocking', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockCoinGecko: true });

      const state = useApiBlockingStore.getState();
      expect(state.globalBlocking.blockBackend).toBe(false);
      expect(state.globalBlocking.blockCoinGecko).toBe(true);
    });
  });

  describe('isFeatureDataSourceBlocked', () => {
    it('returns false when primary source is not blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockPrimary: false });

      expect(isFeatureDataSourceBlocked('currentVolatility', 'primary')).toBe(false);
    });

    it('returns true when primary source is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockPrimary: true });

      expect(isFeatureDataSourceBlocked('currentVolatility', 'primary')).toBe(true);
    });

    it('returns false when secondary source is not blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockSecondary: false });

      expect(isFeatureDataSourceBlocked('currentVolatility', 'secondary')).toBe(false);
    });

    it('returns true when secondary source is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockSecondary: true });

      expect(isFeatureDataSourceBlocked('currentVolatility', 'secondary')).toBe(true);
    });
  });

  describe('isGlobalApiBlocked', () => {
    it('returns true when backend is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockBackend: true });

      expect(isGlobalApiBlocked('backend')).toBe(true);
    });

    it('returns true when CoinGecko is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockCoinGecko: true });

      expect(isGlobalApiBlocked('coingecko')).toBe(true);
    });
  });

  describe('shouldBlockEndpoint', () => {
    it('returns false when nothing is blocked', () => {
      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'primary')).toBe(false);
    });

    it('returns true when global backend is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockBackend: true });

      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'primary')).toBe(true);
    });

    it('returns true when global CoinGecko is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockCoinGecko: true });

      expect(shouldBlockEndpoint('currentVolatility', 'COINGECKO_GLOBAL', 'primary')).toBe(true);
    });

    it('returns true when feature primary source is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockPrimary: true });

      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'primary')).toBe(true);
    });

    it('returns true when feature secondary source is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockSecondary: true });

      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'secondary')).toBe(true);
    });

    it('checks global blocking before feature blocking', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockBackend: true });
      store.setFeatureBlocking('currentVolatility', { blockPrimary: false });

      // Should be blocked by global setting even though feature is not blocked
      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'primary')).toBe(true);
    });
  });
});

