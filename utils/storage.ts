// utils/storage.ts
// SSR-safe storage adapter for Zustand persist middleware
// Wraps AsyncStorage to handle server-side rendering where window is not available

/**
 * FIX: SSR Compatibility for Expo Router 6.0.17+
 * 
 * Issue: Starting with Expo Router 6.0.17, Zustand stores are initialized during
 * server-side rendering (SSR) for web builds. AsyncStorage (which uses localStorage
 * on web) tries to access `window.localStorage` during SSR, causing:
 *   ReferenceError: window is not defined
 * 
 * Solution: This wrapper checks if we're in a browser environment before accessing
 * storage. During SSR, it returns a no-op adapter that returns null, allowing Zustand
 * to skip hydration gracefully. Once client-side code runs, it uses AsyncStorage
 * normally (which already adapts to localStorage on web).
 * 
 * Note: AsyncStorage already handles web/localStorage adaptation - this wrapper
 * only adds SSR safety by checking for window availability.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

/**
 * Creates an SSR-safe storage adapter for Zustand persist middleware.
 * 
 * On web, AsyncStorage uses localStorage which requires window to be available.
 * During SSR, window is not available, so we return a no-op storage adapter.
 * 
 * Behavior:
 * - SSR (server-side): Returns no-op adapter (getItem returns null, setItem/removeItem are no-ops)
 * - Client-side: Uses AsyncStorage normally (which adapts to localStorage on web)
 * 
 * @returns A storage adapter that safely handles SSR
 */
export function createSSRSafeStorage(): StateStorage {
  // Check if we're in a browser environment (client-side)
  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    // Return a no-op storage adapter for SSR
    return {
      getItem: async (name: string): Promise<string | null> => {
        return null;
      },
      setItem: async (name: string, value: string): Promise<void> => {
        // No-op during SSR
      },
      removeItem: async (name: string): Promise<void> => {
        // No-op during SSR
      },
    };
  }

  // On client-side, use AsyncStorage normally
  // AsyncStorage already adapts to localStorage on web
  return {
    getItem: async (name: string): Promise<string | null> => {
      return AsyncStorage.getItem(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
      return AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
      return AsyncStorage.removeItem(name);
    },
  };
}

