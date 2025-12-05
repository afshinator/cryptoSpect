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

### Persisted to AsyncStorage

4. **`latestStore`** (`stores/latestStore.ts`)
   - Storage key: `'latest'`
   - State: `currentVolatilityData`, `currentDominanceData`, `vwatrData`, `marketsData`, `coinMaps`
   - Excluded: `_hasHydrated`
   - Note: All data fields have `fetchedAt` timestamps for refresh tracking
   - Helper: `getFetchedAtTimestampsOfLatest()` retrieves all fetchedAt timestamps

