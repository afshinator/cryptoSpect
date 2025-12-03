// __tests__/currentVolatility.test.js

import {
  fetchCurrentVolatility,
  fetchAndLogCurrentVolatility,
} from '../features/currentVolatility/api';
import { callEndpoint } from '../utils/api';
import { log, ERR, LOG } from '../utils/log';

// Mock dependencies
jest.mock('../utils/api');
jest.mock('../utils/log');

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
      callEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toEqual(mockCurrentVolatilityData);
      expect(callEndpoint).toHaveBeenCalledWith(
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        {
          queryParams: {
            type: 'current',
          },
        }
      );
      expect(log).toHaveBeenCalledWith('⚡ Current volatility data fetched successfully', LOG);
    });

    it('successfully fetches current volatility data with per_page option', async () => {
      callEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
      });

      const result = await fetchCurrentVolatility({ per_page: 100 });

      expect(result).toEqual(mockCurrentVolatilityData);
      expect(callEndpoint).toHaveBeenCalledWith(
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        {
          queryParams: {
            type: 'current',
            per_page: 100,
          },
        }
      );
    });

    it('returns null when API call fails', async () => {
      callEndpoint.mockResolvedValue({
        success: false,
        data: null,
        error: 'Network error',
        status: null,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith(
        '⚡ Failed to fetch current volatility data: Network error',
        ERR
      );
    });

    it('returns null when API returns error status', async () => {
      callEndpoint.mockResolvedValue({
        success: false,
        data: null,
        error: 'API call failed: 500 Internal Server Error',
        status: 500,
      });

      const result = await fetchCurrentVolatility();

      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('⚡ Failed to fetch current volatility data'),
        ERR
      );
    });

    it('handles null data in successful response', async () => {
      callEndpoint.mockResolvedValue({
        success: true,
        data: null,
        error: null,
        status: 200,
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
      callEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
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
      callEndpoint.mockResolvedValue({
        success: false,
        data: null,
        error: 'Network error',
        status: null,
      });

      await fetchAndLogCurrentVolatility();

      expect(log).toHaveBeenCalledWith('⚡ Failed to fetch current volatility data', ERR);
    });

    it('passes options through to fetchCurrentVolatility', async () => {
      callEndpoint.mockResolvedValue({
        success: true,
        data: mockCurrentVolatilityData,
        error: null,
        status: 200,
      });

      await fetchAndLogCurrentVolatility({ per_page: 150 });

      expect(callEndpoint).toHaveBeenCalledWith(
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
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

