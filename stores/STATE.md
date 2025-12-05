# App State Overview

## Zustand Stores

### Persisted to AsyncStorage

1. **`prefsStore`** (`stores/prefsStore.ts`)
   - Storage key: `'prefs'`
   - State: `theme`, `fontScale`, `lightDarkMode`, `currency`, `compactMode`
   - Excluded: `_hasHydrated`

2. **`apiBlockingStore`** (`stores/apiBlockingStore.ts`)
   - Storage key: `'apiBlocking'`
   - State: `featureBlocking`, `globalBlocking`, `featurePreferences`, `globalPreferences`
   - Excluded: `_hasHydrated`

3. **`coinListsStore`** (`stores/coinListsStore.ts`)
   - Storage key: `'coinlists'`
   - State: `lists` (user-created coin lists)
   - Excluded: `_hasHydrated`, `top20List`

### In-Memory Only (Not Persisted)

4. **`latestStore`** (`stores/latestStore.ts`)
   - State: `currentVolatilityData`, `currentDominanceData`, `vwatrData`, `marketsData`, `coinMaps`
   - Note: Resets on app restart, data fetched fresh from APIs

