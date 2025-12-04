// __tests__/currentDominance.test.js

import {
  fetchCurrentDominance,
  fetchCurrentDominanceFromSource,
  fetchAndLogCurrentDominance,
} from '../features/dominance/current/api';
import { callFeatureEndpoint } from '../utils/apiWrappers';
import { log, ERR, LOG, TMI } from '../utils/log';
import { getEffectivePreferences, isGlobalApiBlocked, shouldBlockEndpoint } from '../stores/apiBlockingStore';
import { calculateDominance, fetchAllMarketCapData } from '../features/dominance/current/index';

// Mock dependencies
jest.mock('../utils/apiWrappers');
jest.mock('../utils/log');
jest.mock('../stores/apiBlockingStore');
jest.mock('../features/dominance/current/index');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('currentDominance/api.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getEffectivePreferences.mockReturnValue({
      preferredDataSource: 'primary',
      enableFallback: true,
    });
    isGlobalApiBlocked.mockReturnValue(false);
    shouldBlockEndpoint.mockReturnValue(false);
  });

  describe('fetchCurrentDominanceFromSource - primary', () => {
    const mockDominanceData = {
      totalMarketCap: 2500000000000,
      btc: {
        marketCap: 1000000000000,
        dominance: 40.0,
      },
      eth: {
        marketCap: 500000000000,
        dominance: 20.0,
      },
      stablecoins: {
        marketCap: 200000000000,
        dominance: 8.0,
      },
      others: {
        marketCap: 800000000000,
        dominance: 32.0,
      },
      timestamp: 1234567890000,
    };

    it('successfully fetches current dominance data from primary source', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockDominanceData,
        error: null,
        status: 200,
        blocked: false,
      });

      const result = await fetchCurrentDominanceFromSource('primary');

      expect(result).toMatchObject({
        ...mockDominanceData,
        fetchedAt: expect.any(Number),
      });
      expect(result?.fetchedAt).toBeGreaterThan(0);
      expect(result?.timestamp).toBe(mockDominanceData.timestamp);
    });

    it('sets fetchedAt timestamp when data is fetched from primary source', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockDominanceData,
        error: null,
        status: 200,
        blocked: false,
      });

      const beforeFetch = Date.now();
      const result = await fetchCurrentDominanceFromSource('primary');
      const afterFetch = Date.now();

      expect(result).not.toBeNull();
      expect(result?.fetchedAt).toBeDefined();
      expect(typeof result?.fetchedAt).toBe('number');
      expect(result?.fetchedAt).toBeGreaterThanOrEqual(beforeFetch);
      expect(result?.fetchedAt).toBeLessThanOrEqual(afterFetch);
    });

    it('preserves original timestamp from API and adds fetchedAt', async () => {
      const apiTimestamp = 1234567890000;
      const dataWithTimestamp = {
        ...mockDominanceData,
        timestamp: apiTimestamp,
      };

      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: dataWithTimestamp,
        error: null,
        status: 200,
        blocked: false,
      });

      const result = await fetchCurrentDominanceFromSource('primary');

      expect(result?.timestamp).toBe(apiTimestamp);
      expect(result?.fetchedAt).toBeDefined();
      expect(result?.fetchedAt).not.toBe(apiTimestamp);
      expect(result?.fetchedAt).toBeGreaterThan(apiTimestamp);
    });
  });

  describe('fetchCurrentDominanceFromSource - secondary', () => {
    const mockMarketCapData = {
      total: 2500000000000,
      btc: 1000000000000,
      eth: 500000000000,
      stablecoins: 200000000000,
    };

    const mockCalculatedDominance = {
      totalMarketCap: 2500000000000,
      btc: {
        marketCap: 1000000000000,
        dominance: 40.0,
      },
      eth: {
        marketCap: 500000000000,
        dominance: 20.0,
      },
      stablecoins: {
        marketCap: 200000000000,
        dominance: 8.0,
      },
      others: {
        marketCap: 800000000000,
        dominance: 32.0,
      },
      timestamp: Date.now(),
    };

    it('successfully fetches and calculates dominance from secondary source', async () => {
      fetchAllMarketCapData.mockResolvedValue(mockMarketCapData);
      calculateDominance.mockReturnValue(mockCalculatedDominance);

      const result = await fetchCurrentDominanceFromSource('secondary');

      expect(result).toMatchObject({
        ...mockCalculatedDominance,
        fetchedAt: expect.any(Number),
      });
      expect(result?.fetchedAt).toBeGreaterThan(0);
      expect(result?.timestamp).toBe(mockCalculatedDominance.timestamp);
    });

    it('sets fetchedAt timestamp when data is calculated from secondary source', async () => {
      fetchAllMarketCapData.mockResolvedValue(mockMarketCapData);
      calculateDominance.mockReturnValue(mockCalculatedDominance);

      const beforeFetch = Date.now();
      const result = await fetchCurrentDominanceFromSource('secondary');
      const afterFetch = Date.now();

      expect(result).not.toBeNull();
      expect(result?.fetchedAt).toBeDefined();
      expect(typeof result?.fetchedAt).toBe('number');
      expect(result?.fetchedAt).toBeGreaterThanOrEqual(beforeFetch);
      expect(result?.fetchedAt).toBeLessThanOrEqual(afterFetch);
    });

    it('fetchedAt is set after calculation timestamp', async () => {
      const calcTimestamp = Date.now() - 1000; // 1 second ago
      const calculatedData = {
        ...mockCalculatedDominance,
        timestamp: calcTimestamp,
      };

      fetchAllMarketCapData.mockResolvedValue(mockMarketCapData);
      calculateDominance.mockReturnValue(calculatedData);

      const result = await fetchCurrentDominanceFromSource('secondary');

      expect(result?.timestamp).toBe(calcTimestamp);
      expect(result?.fetchedAt).toBeDefined();
      expect(result?.fetchedAt).toBeGreaterThan(calcTimestamp);
    });
  });

  describe('fetchedAt timestamp validation', () => {
    const mockDominanceData = {
      totalMarketCap: 2500000000000,
      btc: { marketCap: 1000000000000, dominance: 40.0 },
      eth: { marketCap: 500000000000, dominance: 20.0 },
      stablecoins: { marketCap: 200000000000, dominance: 8.0 },
      others: { marketCap: 800000000000, dominance: 32.0 },
      timestamp: 1234567890000,
    };

    it('fetchedAt is a valid date when converted', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockDominanceData,
        error: null,
        status: 200,
        blocked: false,
      });

      const result = await fetchCurrentDominanceFromSource('primary');

      expect(result?.fetchedAt).toBeDefined();
      const date = new Date(result?.fetchedAt);
      expect(date.getTime()).toBe(result?.fetchedAt);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('sets different fetchedAt timestamps for sequential fetches', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockDominanceData,
        error: null,
        status: 200,
        blocked: false,
      });

      const result1 = await fetchCurrentDominanceFromSource('primary');
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const result2 = await fetchCurrentDominanceFromSource('primary');

      expect(result1?.fetchedAt).toBeDefined();
      expect(result2?.fetchedAt).toBeDefined();
      expect(result2?.fetchedAt).toBeGreaterThan(result1?.fetchedAt);
    });

    it('both timestamp and fetchedAt are present and valid', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockDominanceData,
        error: null,
        status: 200,
        blocked: false,
      });

      const result = await fetchCurrentDominanceFromSource('primary');

      expect(result?.timestamp).toBeDefined();
      expect(result?.fetchedAt).toBeDefined();
      expect(typeof result?.timestamp).toBe('number');
      expect(typeof result?.fetchedAt).toBe('number');
      expect(result?.timestamp).toBeGreaterThan(0);
      expect(result?.fetchedAt).toBeGreaterThan(0);
      // fetchedAt should be >= timestamp (when data was calculated/created)
      expect(result?.fetchedAt).toBeGreaterThanOrEqual(result?.timestamp);
    });
  });

  describe('fetchAndLogCurrentDominance', () => {
    const mockDominanceData = {
      totalMarketCap: 2500000000000,
      btc: { marketCap: 1000000000000, dominance: 40.0 },
      eth: { marketCap: 500000000000, dominance: 20.0 },
      stablecoins: { marketCap: 200000000000, dominance: 8.0 },
      others: { marketCap: 800000000000, dominance: 32.0 },
      timestamp: 1234567890000,
    };

    it('logs fetchedAt timestamp when data is fetched', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockDominanceData,
        error: null,
        status: 200,
        blocked: false,
      });
      getEffectivePreferences.mockReturnValue({
        preferredDataSource: 'primary',
        enableFallback: true,
      });

      await fetchAndLogCurrentDominance();

      expect(log).toHaveBeenCalledWith(expect.stringContaining('💪 Fetched At:'), LOG);
    });
  });
});

