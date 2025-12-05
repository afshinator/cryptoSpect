// stores/storeHelpers.ts
// Helper utilities for Zustand stores

import { Platform } from 'react-native';
import { StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Wraps a state creator with devtools middleware if in development and on web
 * This allows all stores to automatically appear in Redux DevTools without repetitive code
 * 
 * @param stateCreator The Zustand state creator function
 * @param storeName The name to display in Redux DevTools
 * @returns The state creator wrapped with devtools (or unwrapped if not in dev/web)
 */
export function withDevtools<T>(
  stateCreator: StateCreator<T>,
  storeName: string
): StateCreator<T, [], [['zustand/devtools', never]]> | StateCreator<T> {
  if (__DEV__ && Platform.OS === 'web') {
    return devtools(stateCreator, { name: storeName });
  }
  return stateCreator;
}

