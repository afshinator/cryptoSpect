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

      expect(result).toEqual(mockCurrentVolatilityData);
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

      expect(result).toEqual(mockCurrentVolatilityData);
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
});

