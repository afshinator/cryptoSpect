// utils/apiWrappers.ts
// Wrapper functions for feature API calls that handle blocking checks
// Features should use these instead of calling callEndpoint directly

import { DataSource, FeatureId } from '@/constants/features';
import { shouldBlockEndpoint } from '@/stores/apiBlockingStore';
import { ApiCallOptions, ApiResult, callEndpoint } from './api';
import { log, TMI } from './log';

/**
 * Extended API result that includes blocking information
 */
export interface BlockedApiResult<T = any> extends ApiResult<T> {
  /** Whether this call was blocked (vs actually failed) */
  blocked: boolean;
}

/**
 * Options for feature API calls
 */
export interface FeatureApiCallOptions extends Omit<ApiCallOptions, 'featureId' | 'dataSource'> {
  // featureId and dataSource are required for feature calls
}

/**
 * Makes an API call for a feature with blocking checks
 * This wrapper ensures features never know about blocking - they just get a 503 if blocked
 * 
 * @param featureId The feature making the call
 * @param endpointKey The endpoint key to call
 * @param dataSource The data source type ('primary' or 'secondary')
 * @param options Optional API call options (queryParams, headers, timeout)
 * @returns Promise resolving to the API result with blocking information
 */
export async function callFeatureEndpoint<T = any>(
  featureId: FeatureId,
  endpointKey: string,
  dataSource: DataSource = 'primary',
  options: FeatureApiCallOptions = {}
): Promise<BlockedApiResult<T>> {
  // Check if endpoint is blocked for this feature
  if (shouldBlockEndpoint(featureId, endpointKey, dataSource)) {
    const dataSourceName = dataSource === 'primary' ? 'primary data source' : 'secondary data source';
    const blockingReason = `Service temporarily unavailable: ${dataSourceName} for ${featureId} is blocked`;
    log(`[${endpointKey}] ${blockingReason}`, TMI);
    
    return {
      data: null,
      error: blockingReason,
      status: 503, // Service Unavailable
      success: false,
      blocked: true, // Flag to distinguish blocked vs broken
    };
  }

  // Not blocked - make the actual API call
  const result = await callEndpoint<T>(endpointKey, options);
  
  // Add blocked flag (always false for actual API calls)
  return {
    ...result,
    blocked: false,
  };
}

