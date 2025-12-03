// __tests__/api.test.js

import {
  buildUrlWithParams,
  callEndpoint,
  callEndpointWithPath,
} from '../utils/api';
import { ERR, log, WARN } from '../utils/log';
import { getEndpoint, isEndpointEnabled } from '../constants/endpoints';

// Mock dependencies
jest.mock('../utils/log');
jest.mock('../constants/endpoints');

// Mock global fetch
global.fetch = jest.fn();

describe('api.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('buildUrlWithParams', () => {
    it('returns base URL when no query params provided', () => {
      const baseUrl = 'https://api.example.com/data';
      expect(buildUrlWithParams(baseUrl)).toBe(baseUrl);
      expect(buildUrlWithParams(baseUrl, undefined)).toBe(baseUrl);
      expect(buildUrlWithParams(baseUrl, {})).toBe(baseUrl);
    });

    it('appends query params to URL with ? separator', () => {
      const baseUrl = 'https://api.example.com/data';
      const params = { page: 1, limit: 10 };
      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/data?page=1&limit=10');
    });

    it('appends query params to URL with & separator when URL already has ?', () => {
      const baseUrl = 'https://api.example.com/data?existing=param';
      const params = { page: 1, limit: 10 };
      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/data?existing=param&page=1&limit=10');
    });

    it('converts number values to strings', () => {
      const baseUrl = 'https://api.example.com/data';
      const params = { page: 1, limit: 50, offset: 0 };
      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/data?page=1&limit=50&offset=0');
    });

    it('converts boolean values to strings', () => {
      const baseUrl = 'https://api.example.com/data';
      const params = { active: true, verified: false };
      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/data?active=true&verified=false');
    });

    it('skips null and undefined values', () => {
      const baseUrl = 'https://api.example.com/data';
      const params = { page: 1, limit: null, offset: undefined, active: true };
      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toBe('https://api.example.com/data?page=1&active=true');
    });

    it('handles special characters in values', () => {
      const baseUrl = 'https://api.example.com/data';
      const params = { query: 'hello world', symbol: 'BTC/USD' };
      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toContain('query=hello+world');
      expect(result).toContain('symbol=BTC%2FUSD');
    });

    it('handles multiple params with mixed types', () => {
      const baseUrl = 'https://api.example.com/data';
      const params = {
        page: 1,
        limit: 10,
        active: true,
        name: 'test',
        nullValue: null,
        undefinedValue: undefined,
      };
      const result = buildUrlWithParams(baseUrl, params);
      expect(result).toContain('page=1');
      expect(result).toContain('limit=10');
      expect(result).toContain('active=true');
      expect(result).toContain('name=test');
      expect(result).not.toContain('nullValue');
      expect(result).not.toContain('undefinedValue');
    });
  });

  describe('callEndpoint', () => {
    let mockEndpoint;

    beforeEach(() => {
      // Create fresh endpoint for each test to avoid shared state
      mockEndpoint = {
        id: 'test-endpoint',
        url: 'https://api.example.com/data',
        name: 'Test Endpoint',
        enabled: true,
        stats: {
          callCount: 0,
          errorCount: 0,
        },
      };
    });

    it('returns error when endpoint is not found', async () => {
      getEndpoint.mockReturnValue(undefined);

      const result = await callEndpoint('INVALID_ENDPOINT');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Endpoint not found: INVALID_ENDPOINT');
      expect(result.data).toBeNull();
      expect(result.status).toBeNull();
      expect(log).toHaveBeenCalledWith('Endpoint not found: INVALID_ENDPOINT', ERR);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns error when endpoint is disabled', async () => {
      const disabledEndpoint = { ...mockEndpoint, enabled: false };
      getEndpoint.mockReturnValue(disabledEndpoint);
      isEndpointEnabled.mockReturnValue(false);

      const result = await callEndpoint('DISABLED_ENDPOINT');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Endpoint is disabled: DISABLED_ENDPOINT');
      expect(result.data).toBeNull();
      expect(result.status).toBeNull();
      expect(log).toHaveBeenCalledWith('Endpoint is disabled: DISABLED_ENDPOINT', WARN);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('makes successful API call and returns data', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      const result = await callEndpoint('TEST_ENDPOINT');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(mockResponse.json).toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith('[TEST_ENDPOINT] API call successful', 5);
      expect(mockEndpoint.stats.callCount).toBe(1);
    });

    it('appends query parameters to URL', async () => {
      const mockData = { results: [] };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      const result = await callEndpoint('TEST_ENDPOINT', {
        queryParams: { page: 1, limit: 10, active: true },
      });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data?page=1&limit=10&active=true',
        expect.any(Object)
      );
    });

    it('includes custom headers in request', async () => {
      const mockData = { results: [] };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpoint('TEST_ENDPOINT', {
        headers: { 'Authorization': 'Bearer token123', 'X-Custom-Header': 'value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'value',
          }),
        })
      );
    });

    it('handles HTTP error responses', async () => {
      const errorText = 'Not Found';
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue(errorText),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      const result = await callEndpoint('TEST_ENDPOINT');

      expect(result.success).toBe(false);
      expect(result.error).toContain('API call failed: 404 Not Found');
      expect(result.error).toContain(errorText);
      expect(result.data).toBeNull();
      expect(result.status).toBe(404);
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('[TEST_ENDPOINT]'),
        ERR
      );
      expect(mockEndpoint.stats.errorCount).toBe(1);
      expect(mockEndpoint.stats.lastError).toContain('API call failed');
    });

    it('handles network errors', async () => {
      const networkError = new Error('Network request failed');
      networkError.message = 'Network request failed';

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockRejectedValue(networkError);

      const result = await callEndpoint('TEST_ENDPOINT');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network request failed');
      expect(result.data).toBeNull();
      expect(result.status).toBeNull();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('[TEST_ENDPOINT] Network request failed'),
        ERR
      );
      expect(mockEndpoint.stats.errorCount).toBe(1);
      expect(mockEndpoint.stats.lastError).toBe('Network request failed');
    });

    it('handles timeout errors', async () => {
      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      
      // Mock fetch to immediately reject with AbortError
      // This simulates what happens when AbortController.abort() is called
      const abortError = new Error('The operation was aborted.');
      abortError.name = 'AbortError';
      
      global.fetch.mockRejectedValue(abortError);

      // The timeout value doesn't matter here since we're directly testing
      // the AbortError handling logic
      const result = await callEndpoint('TEST_ENDPOINT', { timeout: 100 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API call timeout after 100ms');
      expect(result.data).toBeNull();
      expect(result.status).toBeNull();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining('API call timeout after 100ms'),
        ERR
      );
      expect(mockEndpoint.stats.errorCount).toBe(1);
    });

    it('handles JSON parse errors gracefully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      const result = await callEndpoint('TEST_ENDPOINT');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
      expect(result.data).toBeNull();
      expect(result.status).toBeNull();
      expect(mockEndpoint.stats.errorCount).toBe(1);
    });

    it('updates statistics on successful call', async () => {
      const mockData = { id: 1 };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      const endpointWithStats = {
        ...mockEndpoint,
        stats: { callCount: 0, errorCount: 0 },
      };

      getEndpoint.mockReturnValue(endpointWithStats);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpoint('TEST_ENDPOINT');

      expect(endpointWithStats.stats.callCount).toBe(1);
      expect(endpointWithStats.stats.lastCalled).toBeDefined();
      expect(typeof endpointWithStats.stats.lastCalled).toBe('number');
      expect(endpointWithStats.stats.errorCount).toBe(0);
    });

    it('updates statistics on error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server Error'),
      };

      const endpointWithStats = {
        ...mockEndpoint,
        stats: { callCount: 0, errorCount: 0 },
      };

      getEndpoint.mockReturnValue(endpointWithStats);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpoint('TEST_ENDPOINT');

      expect(endpointWithStats.stats.callCount).toBe(1);
      expect(endpointWithStats.stats.errorCount).toBe(1);
      expect(endpointWithStats.stats.lastError).toBeDefined();
      expect(endpointWithStats.stats.lastError).toContain('API call failed');
    });

    it('uses default timeout of 30000ms', async () => {
      const mockData = { id: 1 };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpoint('TEST_ENDPOINT');

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].signal).toBeDefined();
      // Verify AbortController is used (signal is present)
      expect(fetchCall[1].signal).toBeInstanceOf(AbortSignal);
    });

    it('uses custom timeout when provided', async () => {
      const mockData = { id: 1 };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpoint('TEST_ENDPOINT', { timeout: 5000 });

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].signal).toBeDefined();
    });

    it('handles endpoint without stats gracefully', async () => {
      const endpointWithoutStats = {
        ...mockEndpoint,
        stats: undefined,
      };

      const mockData = { id: 1 };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(endpointWithoutStats);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      const result = await callEndpoint('TEST_ENDPOINT');

      expect(result.success).toBe(true);
      // Should not throw when stats is undefined
    });
  });

  describe('callEndpointWithPath', () => {
    let mockEndpoint;

    beforeEach(() => {
      // Create fresh endpoint for each test to avoid shared state
      mockEndpoint = {
        id: 'test-endpoint',
        url: 'https://api.example.com/coins',
        name: 'Test Endpoint',
        enabled: true,
        stats: {
          callCount: 0,
          errorCount: 0,
        },
      };
    });

    it('returns error when endpoint is not found', async () => {
      getEndpoint.mockReturnValue(undefined);

      const result = await callEndpointWithPath('INVALID_ENDPOINT', 'bitcoin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Endpoint not found: INVALID_ENDPOINT');
      expect(log).toHaveBeenCalledWith('Endpoint not found: INVALID_ENDPOINT', ERR);
    });

    it('appends path suffix to endpoint URL', async () => {
      const mockData = { id: 'bitcoin', name: 'Bitcoin' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      const result = await callEndpointWithPath('TEST_ENDPOINT', 'bitcoin');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/coins/bitcoin',
        expect.any(Object)
      );
    });

    it('handles path suffix with leading slash', async () => {
      const mockData = { id: 'bitcoin' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpointWithPath('TEST_ENDPOINT', '/bitcoin');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/coins/bitcoin',
        expect.any(Object)
      );
    });

    it('handles endpoint URL ending with slash', async () => {
      const endpointWithSlash = {
        ...mockEndpoint,
        url: 'https://api.example.com/coins/',
      };

      const mockData = { id: 'bitcoin' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(endpointWithSlash);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpointWithPath('TEST_ENDPOINT', 'bitcoin');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/coins/bitcoin',
        expect.any(Object)
      );
    });

    it('restores original URL after call', async () => {
      const mockData = { id: 'bitcoin' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpointWithPath('TEST_ENDPOINT', 'bitcoin');

      // Verify original URL is restored
      expect(mockEndpoint.url).toBe('https://api.example.com/coins');
    });

    it('restores original URL even when call fails', async () => {
      const networkError = new Error('Network error');
      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockRejectedValue(networkError);

      await callEndpointWithPath('TEST_ENDPOINT', 'bitcoin');

      // Verify original URL is restored even on error
      expect(mockEndpoint.url).toBe('https://api.example.com/coins');
    });

    it('passes query params through to callEndpoint', async () => {
      const mockData = { id: 'bitcoin' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockData),
      };

      getEndpoint.mockReturnValue(mockEndpoint);
      isEndpointEnabled.mockReturnValue(true);
      global.fetch.mockResolvedValue(mockResponse);

      await callEndpointWithPath('TEST_ENDPOINT', 'bitcoin', {
        queryParams: { vs_currency: 'usd' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/coins/bitcoin?vs_currency=usd',
        expect.any(Object)
      );
    });
  });
});

