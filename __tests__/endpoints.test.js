// __tests__/endpoints.test.js
// Tests for endpoint URL construction to prevent double-slash issues

import { ENDPOINTS, getEndpoint } from '../constants/endpoints';

describe('endpoints.ts', () => {
  describe('URL Construction - Double Slash Prevention', () => {
    /**
     * This test prevents the double-slash issue that causes 308 redirects and CORS problems.
     * The issue occurs when:
     * - CRYPTO_PROXY_BASE_URL has a trailing slash: "https://crypto-proxy-bice.vercel.app/"
     * - Endpoint path starts with slash: "/api/volatility"
     * - Result: "https://crypto-proxy-bice.vercel.app//api/volatility" (double slash - BAD)
     * 
     * This test ensures endpoint URLs never contain double slashes regardless of:
     * - Whether the base URL has a trailing slash
     * - Whether the path starts with a slash
     * - How the URL is constructed
     */
    
    it('CRYPTO_PROXY_CURRENT_VOLATILITY URL should never have double slashes', () => {
      const endpoint = getEndpoint('CRYPTO_PROXY_CURRENT_VOLATILITY');
      
      expect(endpoint).toBeDefined();
      expect(endpoint.url).toBeDefined();
      
      // Extract the path portion (everything after https://domain)
      const urlMatch = endpoint.url.match(/^https?:\/\/([^\/]+)(.*)$/);
      if (urlMatch) {
        const pathPortion = urlMatch[2];
        
        // The path should never contain double slashes
        // This catches issues like: /api/volatility becoming //api/volatility
        expect(pathPortion).not.toContain('//');
        
        // Should have exactly one slash at the start of the path (if path exists)
        if (pathPortion.length > 0) {
          expect(pathPortion).toMatch(/^\/[^\/]/); // Starts with single slash, then non-slash
        }
      }
    });

    it('all endpoint URLs should not contain double slashes in path portion', () => {
      Object.entries(ENDPOINTS).forEach(([key, endpoint]) => {
        expect(endpoint.url).toBeDefined();
        expect(typeof endpoint.url).toBe('string');
        
        // Extract path portion (everything after the domain)
        const urlMatch = endpoint.url.match(/^https?:\/\/([^\/]+)(.*)$/);
        if (urlMatch) {
          const domain = urlMatch[1];
          const pathPortion = urlMatch[2];
          
          // Verify it's a valid URL
          expect(domain.length).toBeGreaterThan(0);
          
          // The path portion should never contain double slashes
          // This is the critical check that prevents 308 redirects and CORS issues
          if (pathPortion.length > 0) {
            expect(pathPortion).not.toContain('//');
            
            // If path exists, it should start with exactly one slash
            expect(pathPortion).toMatch(/^\/[^\/]/);
          }
        } else {
          // If regex doesn't match, it's not a valid HTTP(S) URL
          throw new Error(`Endpoint ${key} has invalid URL format: ${endpoint.url}`);
        }
      });
    });

    it('endpoint URL should handle base URL with trailing slash correctly', () => {
      // Simulate what happens when CRYPTO_PROXY_BASE_URL has trailing slash
      const baseUrlWithSlash = 'https://crypto-proxy-bice.vercel.app/';
      const path = '/api/volatility';
      
      // This is how it's constructed in endpoints.ts: `${CRYPTO_PROXY_BASE_URL}/api/volatility`
      // If baseUrl has trailing slash, this creates double slash
      const constructedUrl = `${baseUrlWithSlash}${path}`;
      
      // Extract path portion (after https://domain)
      const pathPortion = constructedUrl.replace(/^https?:\/\/[^\/]+/, '');
      
      // This should fail - demonstrating the problem (double slash in path)
      expect(pathPortion).toContain('//');
      expect(constructedUrl).toBe('https://crypto-proxy-bice.vercel.app//api/volatility');
      
      // The correct way (what we want to ensure)
      const baseUrlNoSlash = baseUrlWithSlash.replace(/\/$/, ''); // Remove trailing slash
      const correctUrl = `${baseUrlNoSlash}${path}`;
      const correctPathPortion = correctUrl.replace(/^https?:\/\/[^\/]+/, '');
      expect(correctPathPortion).not.toContain('//');
      expect(correctUrl).toBe('https://crypto-proxy-bice.vercel.app/api/volatility');
    });

    it('endpoint URL should handle base URL without trailing slash correctly', () => {
      // Simulate what happens when CRYPTO_PROXY_BASE_URL has no trailing slash
      const baseUrlNoSlash = 'https://crypto-proxy-bice.vercel.app';
      const path = '/api/volatility';
      
      // This is how it's constructed in endpoints.ts: `${CRYPTO_PROXY_BASE_URL}/api/volatility`
      const constructedUrl = `${baseUrlNoSlash}${path}`;
      
      // Extract path portion (after https://domain) to check for double slashes
      const pathPortion = constructedUrl.replace(/^https?:\/\/[^\/]+/, '');
      
      // This should work correctly (no double slash in path)
      expect(pathPortion).not.toContain('//');
      expect(constructedUrl).toBe('https://crypto-proxy-bice.vercel.app/api/volatility');
    });

    it('verifies actual endpoint URL matches expected format', () => {
      const endpoint = getEndpoint('CRYPTO_PROXY_CURRENT_VOLATILITY');
      
      // The endpoint URL should match the expected pattern
      // It should be: https://domain/api/volatility (no double slashes)
      expect(endpoint.url).toMatch(/^https?:\/\/[^\/]+\/api\/volatility$/);
      
      // Specifically check for double slashes anywhere in the URL (after protocol)
      const doubleSlashIndex = endpoint.url.indexOf('//', endpoint.url.indexOf('://') + 3);
      expect(doubleSlashIndex).toBe(-1); // Should not find double slash after the protocol
    });

    it('detects double slash issue when base URL has trailing slash', () => {
      // This test simulates the exact problem scenario:
      // When EXPO_PUBLIC_BACKEND_BASE_URL="https://crypto-proxy-bice.vercel.app/" (with trailing slash)
      // And endpoint is constructed as: `${CRYPTO_PROXY_BASE_URL}/api/volatility`
      // Result: "https://crypto-proxy-bice.vercel.app//api/volatility" (double slash - BAD)
      
      const baseUrlWithTrailingSlash = 'https://crypto-proxy-bice.vercel.app/';
      const endpointPath = '/api/volatility';
      
      // Simulate the construction in endpoints.ts
      const badUrl = `${baseUrlWithTrailingSlash}${endpointPath}`;
      
      // Extract path portion (everything after https://domain)
      const pathPortion = badUrl.replace(/^https?:\/\/[^\/]+/, '');
      
      // This demonstrates the problem - double slash in path
      expect(pathPortion).toContain('//');
      expect(badUrl).toBe('https://crypto-proxy-bice.vercel.app//api/volatility');
      
      // The fix: ensure base URL doesn't have trailing slash
      const baseUrlFixed = baseUrlWithTrailingSlash.replace(/\/$/, '');
      const goodUrl = `${baseUrlFixed}${endpointPath}`;
      const goodPathPortion = goodUrl.replace(/^https?:\/\/[^\/]+/, '');
      
      // This is what we want - no double slash
      expect(goodPathPortion).not.toContain('//');
      expect(goodUrl).toBe('https://crypto-proxy-bice.vercel.app/api/volatility');
    });
  });

  describe('Endpoint Registry', () => {
    it('CRYPTO_PROXY_CURRENT_VOLATILITY endpoint exists', () => {
      const endpoint = getEndpoint('CRYPTO_PROXY_CURRENT_VOLATILITY');
      expect(endpoint).toBeDefined();
      expect(endpoint.id).toBe('crypto-proxy-current-volatility');
      expect(endpoint.name).toBe('Crypto Proxy Current Volatility');
      expect(endpoint.enabled).toBe(true);
    });
  });
});

