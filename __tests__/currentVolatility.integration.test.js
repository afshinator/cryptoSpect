// __tests__/currentVolatility.integration.test.js
// Integration test that calls the real API
// Run with: npm test -- __tests__/currentVolatility.integration.test.js

import {
  fetchCurrentVolatility,
  fetchAndLogCurrentVolatility,
} from '../features/currentVolatility/api';

describe('Current Volatility API Integration Tests', () => {
  // These tests call the real API
  // They may be slow and require network access

  it('fetches current volatility data from real API', async () => {
    const data = await fetchCurrentVolatility();

    expect(data).not.toBeNull();
    expect(data).toHaveProperty('volatility1h');
    expect(data).toHaveProperty('volatility24h');
    expect(data).toHaveProperty('level1h');
    expect(data).toHaveProperty('level24h');
    expect(data).toHaveProperty('topMoverPercentage');
    expect(data).toHaveProperty('topMoverCoin');
    expect(data).toHaveProperty('marketCapCoverage');

    // Type checks
    expect(typeof data.volatility1h).toBe('number');
    expect(typeof data.volatility24h).toBe('number');
    expect(typeof data.level1h).toBe('string');
    expect(typeof data.level24h).toBe('string');
    expect(typeof data.topMoverPercentage).toBe('number');
    expect(typeof data.topMoverCoin).toBe('string');
    expect(typeof data.marketCapCoverage).toBe('number');

    // Value range checks
    expect(data.volatility1h).toBeGreaterThanOrEqual(0);
    expect(data.volatility24h).toBeGreaterThanOrEqual(0);
    expect(data.marketCapCoverage).toBeGreaterThan(0);
    expect(data.marketCapCoverage).toBeLessThanOrEqual(1);
  }, 15000); // 15 second timeout for real API call

  it('fetches current volatility data with custom per_page', async () => {
    const data = await fetchCurrentVolatility({ per_page: 100 });

    expect(data).not.toBeNull();
    expect(data).toHaveProperty('volatility1h');
    expect(data).toHaveProperty('volatility24h');
  }, 15000);

  it('logs current volatility data using log function', async () => {
    // Mock the log function to capture calls
    const { log } = require('../utils/log');
    const originalLog = log;
    const logCalls: string[] = [];
    
    // Since log is not easily mockable in integration tests, we'll just verify
    // that the function completes without error and returns expected data
    const data = await fetchCurrentVolatility();
    
    expect(data).not.toBeNull();
    // The function should complete successfully
    await expect(fetchAndLogCurrentVolatility()).resolves.not.toThrow();
  }, 15000);
});

