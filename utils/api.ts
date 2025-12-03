// utils/api.ts
// Utility functions for making API calls

import { getEndpoint, isEndpointEnabled } from "../constants/endpoints";
import { ERR, log, WARN } from "./log";

/**
 * Options for API calls
 */
export interface ApiCallOptions {
  /** Query parameters as an object (will be URL-encoded) */
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Result type for API calls
 */
export interface ApiResult<T = any> {
  /** The response data (parsed JSON) */
  data: T | null;
  /** Error message if the call failed */
  error: string | null;
  /** HTTP status code */
  status: number | null;
  /** Whether the call was successful */
  success: boolean;
}

/**
 * Builds a URL with query parameters
 * Compatible with React Native (doesn't rely on URL constructor)
 * Exported for testing purposes
 * @param baseUrl The base URL
 * @param queryParams Query parameters as an object
 * @returns The complete URL with query string
 */
export function buildUrlWithParams(
  baseUrl: string,
  queryParams?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return baseUrl;
  }

  // Use URLSearchParams for query string building (widely supported and testable)
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    // Skip null/undefined values
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

/**
 * Makes a GET API call using fetch
 * Always returns an ApiResult object (never throws)
 * @param endpointKey The key from the ENDPOINTS registry
 * @param options Optional configuration for the API call
 * @returns Promise resolving to the API result
 */
export async function callEndpoint<T = any>(
  endpointKey: string,
  options: ApiCallOptions = {}
): Promise<ApiResult<T>> {
  const {
    queryParams,
    headers = {},
    timeout = 30000,
  } = options;

  // Get endpoint configuration
  const endpoint = getEndpoint(endpointKey);
  if (!endpoint) {
    const error = `Endpoint not found: ${endpointKey}`;
    log(error, ERR);
    return {
      data: null,
      error,
      status: null,
      success: false,
    };
  }

  // Check if endpoint is enabled
  if (!isEndpointEnabled(endpointKey)) {
    const error = `Endpoint is disabled: ${endpointKey}`;
    log(error, WARN);
    return {
      data: null,
      error,
      status: null,
      success: false,
    };
  }

  // Build the full URL with query parameters
  let url = endpoint.url;
  if (queryParams) {
    url = buildUrlWithParams(endpoint.url, queryParams);
  }

  // Update statistics (for future use)
  if (endpoint.stats) {
    endpoint.stats.callCount++;
    endpoint.stats.lastCalled = Date.now();
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), timeout);

    // Make the API call (GET only)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      const error = `API call failed: ${response.status} ${response.statusText} - ${errorText}`;
      
      // Update error statistics
      if (endpoint.stats) {
        endpoint.stats.errorCount++;
        endpoint.stats.lastError = error;
      }
      
      log(`[${endpointKey}] ${error}`, ERR);
      
      return {
        data: null,
        error,
        status: response.status,
        success: false,
      };
    }

    // Parse JSON response
    const data = await response.json();

    log(`[${endpointKey}] API call successful`, 5);

    return {
      data,
      error: null,
      status: response.status,
      success: true,
    };
  } catch (error: any) {
    // Handle timeout
    if (error.name === 'AbortError') {
      const errorMsg = `API call timeout after ${timeout}ms: ${endpointKey}`;
      log(errorMsg, ERR);
      
      if (endpoint.stats) {
        endpoint.stats.errorCount++;
        endpoint.stats.lastError = errorMsg;
      }
      
      return {
        data: null,
        error: errorMsg,
        status: null,
        success: false,
      };
    }

    // Handle other errors
    const errorMsg = error?.message || `Unknown error calling endpoint: ${endpointKey}`;
    log(`[${endpointKey}] ${errorMsg}`, ERR);
    
    if (endpoint.stats) {
      endpoint.stats.errorCount++;
      endpoint.stats.lastError = errorMsg;
    }
    
    return {
      data: null,
      error: errorMsg,
      status: null,
      success: false,
    };
  } finally {
    // Always clear the timeout to prevent open handles
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Convenience function to call an endpoint with a dynamic URL path
 * Useful for endpoints that require path parameters (e.g., /coins/{id})
 * @param endpointKey The key from the ENDPOINTS registry
 * @param pathSuffix Additional path to append to the base URL
 * @param options Optional configuration for the API call
 * @returns Promise resolving to the API result
 */
export async function callEndpointWithPath<T = any>(
  endpointKey: string,
  pathSuffix: string,
  options: ApiCallOptions = {}
): Promise<ApiResult<T>> {
  const endpoint = getEndpoint(endpointKey);
  if (!endpoint) {
    const error = `Endpoint not found: ${endpointKey}`;
    log(error, ERR);
    return {
      data: null,
      error,
      status: null,
      success: false,
    };
  }

  // Temporarily modify the endpoint URL to include the path suffix
  const originalUrl = endpoint.url;
  endpoint.url = originalUrl.endsWith('/') 
    ? `${originalUrl}${pathSuffix.replace(/^\//, '')}`
    : `${originalUrl}/${pathSuffix.replace(/^\//, '')}`;

  try {
    return await callEndpoint<T>(endpointKey, options);
  } finally {
    // Restore original URL
    endpoint.url = originalUrl;
  }
}

