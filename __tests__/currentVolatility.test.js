// __tests__/currentVolatility.test.js

import {
  fetchCurrentVolatility,
  fetchAndLogCurrentVolatility,
} from '../features/currentVolatility/api';
import { callFeatureEndpoint } from '../utils/apiWrappers';
import { log, ERR, LOG } from '../utils/log';

// Mock dependencies
jest.mock('../utils/apiWrappers');
jest.mock('../utils/log');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('currentVolatility/api.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCurrentVolatility', () => {
    const mockCurrentVolatilityData = {
      volatility1h: 6.2,
      volatility24h: 4.1,
      level1h: 'HIGH',
      level24h: 'NORMAL',
      topMoverPercentage: 12.5,
      topMoverCoin: 'ADA',
      marketCapCoverage: 0.87,
    };

    it('successfully fetches current volatility data with default options', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
        blocked: false,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toMatchObject({
        ...mockCurrentVolatilityData,
        fetchedAt: expect.any(Number),
      });
      expect(result?.fetchedAt).toBeGreaterThan(0);
      
      // Verify fetchedAt is a valid recent timestamp
      const now = Date.now();
      const fetchedAt = result?.fetchedAt || 0;
      expect(fetchedAt).toBeGreaterThan(now - 1000); // Within last second
      expect(fetchedAt).toBeLessThanOrEqual(now);
      
      expect(callFeatureEndpoint).toHaveBeenCalledWith(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'primary',
        {
          queryParams: {
            type: 'current',
          },
        }
      );
      expect(log).toHaveBeenCalledWith('⚡ Current volatility data fetched successfully', LOG);
    });

    it('successfully fetches current volatility data with per_page option', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
        blocked: false,
      });

      const result = await fetchCurrentVolatility({ per_page: 100 });

      expect(result).toMatchObject({
        ...mockCurrentVolatilityData,
        fetchedAt: expect.any(Number),
      });
      expect(result?.fetchedAt).toBeGreaterThan(0);
      
      // Verify fetchedAt is a valid recent timestamp
      const now = Date.now();
      const fetchedAt = result?.fetchedAt || 0;
      expect(fetchedAt).toBeGreaterThan(now - 1000); // Within last second
      expect(fetchedAt).toBeLessThanOrEqual(now);
      
      expect(callFeatureEndpoint).toHaveBeenCalledWith(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'primary',
        {
          queryParams: {
            type: 'current',
            per_page: 100,
          },
        }
      );
    });

    it('returns null when API call fails', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: false,
        data: null,
        error: 'Network error',
        status: null,
        blocked: false,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith(
        '⚡ Failed to fetch current volatility data: Network error',
        ERR
      );
    });

    it('returns null when API returns error status', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: false,
        data: null,
        error: 'API call failed: 500 Internal Server Error',
        status: 500,
        blocked: false,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('⚡ Failed to fetch current volatility data'),
        ERR
      );
    });

    it('returns null when blocked', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: false,
        data: null,
        error: 'Service temporarily unavailable: currentVolatility feature is blocked',
        status: 503,
        blocked: true,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('⚡ Current volatility data blocked'),
        ERR
      );
    });

    it('handles null data in successful response', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: null,
        error: null,
        status: 200,
        blocked: false,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('⚡ Failed to fetch current volatility data'),
        ERR
      );
    });
  });

  describe('fetchAndLogCurrentVolatility', () => {
    const mockCurrentVolatilityData = {
      volatility1h: 6.2,
      volatility24h: 4.1,
      level1h: 'HIGH',
      level24h: 'NORMAL',
      topMoverPercentage: 12.5,
      topMoverCoin: 'ADA',
      marketCapCoverage: 0.87,
    };

    it('logs current volatility data when fetch succeeds', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
        blocked: false,
      });

      await fetchAndLogCurrentVolatility();

      expect(log).toHaveBeenCalledWith('⚡ === Current Volatility Data ===', LOG);
      expect(log).toHaveBeenCalledWith('⚡ 1h Volatility: 6.2% (HIGH)', LOG);
      expect(log).toHaveBeenCalledWith('⚡ 24h Volatility: 4.1% (NORMAL)', LOG);
      expect(log).toHaveBeenCalledWith('⚡ Top Mover: ADA (12.5%)', LOG);
      expect(log).toHaveBeenCalledWith('⚡ Market Cap Coverage: 87.0%', LOG);
      expect(log).toHaveBeenCalledWith(expect.stringContaining('⚡ Fetched At:'), LOG);
      expect(log).toHaveBeenCalledWith('⚡ ===============================', LOG);
    });

    it('logs error message when fetch fails', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: false,
        data: null,
        error: 'Network error',
        status: null,
        blocked: false,
      });

      await fetchAndLogCurrentVolatility();

      expect(log).toHaveBeenCalledWith('⚡ Failed to fetch current volatility data', ERR);
    });

    it('passes options through to fetchCurrentVolatility', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
        blocked: false,
      });

      await fetchAndLogCurrentVolatility({ per_page: 150 });

      expect(callFeatureEndpoint).toHaveBeenCalledWith(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'primary',
        {
          queryParams: {
            type: 'current',
            per_page: 150,
          },
        }
      );
    });
  });

  describe('fetchedAt timestamp', () => {
    const mockCurrentVolatilityData = {
      volatility1h: 6.2,
      volatility24h: 4.1,
      level1h: 'HIGH',
      level24h: 'NORMAL',
      topMoverPercentage: 12.5,
      topMoverCoin: 'ADA',
      marketCapCoverage: 0.87,
    };

    it('sets fetchedAt timestamp when data is successfully fetched', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
        blocked: false,
      });

      const beforeFetch = Date.now();
      const result = await fetchCurrentVolatility();
      const afterFetch = Date.now();

      expect(result).not.toBeNull();
      expect(result?.fetchedAt).toBeDefined();
      expect(typeof result?.fetchedAt).toBe('number');
      expect(result?.fetchedAt).toBeGreaterThanOrEqual(beforeFetch);
      expect(result?.fetchedAt).toBeLessThanOrEqual(afterFetch);
    });

    it('sets different fetchedAt timestamps for sequential fetches', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
        blocked: false,
      });

      const result1 = await fetchCurrentVolatility();
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const result2 = await fetchCurrentVolatility();

      expect(result1?.fetchedAt).toBeDefined();
      expect(result2?.fetchedAt).toBeDefined();
      expect(result2?.fetchedAt).toBeGreaterThan(result1?.fetchedAt);
    });

    it('does not set fetchedAt when fetch fails', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: false,
        data: null,
        error: 'Network error',
        status: null,
        blocked: false,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toBeNull();
    });

    it('fetchedAt is a valid date when converted', async () => {
      callFeatureEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
        blocked: false,
      });

      const result = await fetchCurrentVolatility();

      expect(result?.fetchedAt).toBeDefined();
      const date = new Date(result?.fetchedAt);
      expect(date.getTime()).toBe(result?.fetchedAt);
      expect(date.toString()).not.toBe('Invalid Date');
    });
  });
});

