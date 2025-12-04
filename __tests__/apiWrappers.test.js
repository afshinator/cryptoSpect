// __tests__/apiWrappers.test.js

import { callFeatureEndpoint } from '../utils/apiWrappers';
import { callEndpoint } from '../utils/api';
import { shouldBlockEndpoint } from '../stores/apiBlockingStore';
import { log, WARN } from '../utils/log';

// Mock dependencies
jest.mock('../utils/api');
jest.mock('../utils/log');
jest.mock('../stores/apiBlockingStore');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('apiWrappers.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('callFeatureEndpoint', () => {
    const mockEndpoint = {
      id: 'test-endpoint',
      url: 'https://api.example.com/data',
      name: 'Test Endpoint',
      enabled: true,
    };

    it('returns blocked result when endpoint is blocked', async () => {
      shouldBlockEndpoint.mockReturnValue(true);

      const result = await callFeatureEndpoint(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'default',
        {}
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(503);
      expect(result.blocked).toBe(true);
      expect(result.error).toContain('Service temporarily unavailable');
      expect(result.error).toContain('currentVolatility feature is blocked');
      expect(callEndpoint).not.toHaveBeenCalled();
      expect(shouldBlockEndpoint).toHaveBeenCalledWith(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'default'
      );
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('Service temporarily unavailable'),
        WARN
      );
    });

    it('calls callEndpoint when not blocked', async () => {
      shouldBlockEndpoint.mockReturnValue(false);
      const mockData = { id: 1 };
      callEndpoint.mockResolvedValue({
        success: true,
        data: mockData,
        error: null,
        status: 200,
      });

      const result = await callFeatureEndpoint(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'default',
        { queryParams: { type: 'current' } }
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.blocked).toBe(false);
      expect(callEndpoint).toHaveBeenCalledWith(
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        { queryParams: { type: 'current' } }
      );
    });

    it('passes through all options to callEndpoint', async () => {
      shouldBlockEndpoint.mockReturnValue(false);
      callEndpoint.mockResolvedValue({
        success: true,
        data: { id: 1 },
        error: null,
        status: 200,
      });

      await callFeatureEndpoint(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'default',
        {
          queryParams: { type: 'current', per_page: 100 },
          headers: { 'X-Custom': 'value' },
          timeout: 5000,
        }
      );

      expect(callEndpoint).toHaveBeenCalledWith(
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        {
          queryParams: { type: 'current', per_page: 100 },
          headers: { 'X-Custom': 'value' },
          timeout: 5000,
        }
      );
    });

    it('uses correct dataSource parameter for blocking check', async () => {
      shouldBlockEndpoint.mockReturnValue(false);
      callEndpoint.mockResolvedValue({
        success: true,
        data: { id: 1 },
        error: null,
        status: 200,
      });

      await callFeatureEndpoint(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'alternate',
        {}
      );

      expect(shouldBlockEndpoint).toHaveBeenCalledWith(
        'currentVolatility',
        'CRYPTO_PROXY_CURRENT_VOLATILITY',
        'alternate'
      );
    });
  });
});

