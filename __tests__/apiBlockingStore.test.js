// __tests__/apiBlockingStore.test.js

import {
  useApiBlockingStore,
  isFeatureDataSourceBlocked,
  isGlobalApiBlocked,
  shouldBlockEndpoint,
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
        blockDefault: false,
        blockAlternate: false,
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
    it('sets blocking for default source', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockDefault: true });

      const state = useApiBlockingStore.getState();
      expect(state.featureBlocking.currentVolatility.blockDefault).toBe(true);
      expect(state.featureBlocking.currentVolatility.blockAlternate).toBe(false);
    });

    it('sets blocking for alternate source', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockAlternate: true });

      const state = useApiBlockingStore.getState();
      expect(state.featureBlocking.currentVolatility.blockDefault).toBe(false);
      expect(state.featureBlocking.currentVolatility.blockAlternate).toBe(true);
    });

    it('sets blocking for both sources', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', {
        blockDefault: true,
        blockAlternate: true,
      });

      const state = useApiBlockingStore.getState();
      expect(state.featureBlocking.currentVolatility.blockDefault).toBe(true);
      expect(state.featureBlocking.currentVolatility.blockAlternate).toBe(true);
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
    it('returns false when default source is not blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockDefault: false });

      expect(isFeatureDataSourceBlocked('currentVolatility', 'default')).toBe(false);
    });

    it('returns true when default source is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockDefault: true });

      expect(isFeatureDataSourceBlocked('currentVolatility', 'default')).toBe(true);
    });

    it('returns false when alternate source is not blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockAlternate: false });

      expect(isFeatureDataSourceBlocked('currentVolatility', 'alternate')).toBe(false);
    });

    it('returns true when alternate source is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockAlternate: true });

      expect(isFeatureDataSourceBlocked('currentVolatility', 'alternate')).toBe(true);
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
      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'default')).toBe(false);
    });

    it('returns true when global backend is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockBackend: true });

      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'default')).toBe(true);
    });

    it('returns true when global CoinGecko is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockCoinGecko: true });

      expect(shouldBlockEndpoint('currentVolatility', 'COINGECKO_GLOBAL', 'default')).toBe(true);
    });

    it('returns true when feature default source is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockDefault: true });

      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'default')).toBe(true);
    });

    it('returns true when feature alternate source is blocked', () => {
      const store = useApiBlockingStore.getState();
      store.setFeatureBlocking('currentVolatility', { blockAlternate: true });

      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'alternate')).toBe(true);
    });

    it('checks global blocking before feature blocking', () => {
      const store = useApiBlockingStore.getState();
      store.setGlobalBlocking({ blockBackend: true });
      store.setFeatureBlocking('currentVolatility', { blockDefault: false });

      // Should be blocked by global setting even though feature is not blocked
      expect(shouldBlockEndpoint('currentVolatility', 'CRYPTO_PROXY_CURRENT_VOLATILITY', 'default')).toBe(true);
    });
  });
});

