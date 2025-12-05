# CoinList Feature Documentation

## Overview

The CoinList feature allows users to create, manage, and organize custom lists of cryptocurrencies. Each list can contain multiple coins with user-defined notes, and lists themselves can have names, notes, and optional images. The feature integrates with market data APIs to display real-time pricing and supports filtering capabilities for analysis.

## Data Structure & Storage

### Storage Mechanism
- Data is persisted using Zustand's `persist` middleware with AsyncStorage
- Store location: `stores/coinListsStore.ts`
- Persistence is automatic - Zustand handles saving on every state change
- Storage key: `'coinlists'` (defined in `features/lists/constants.ts`)
- Only `lists` array is persisted (excludes `_hasHydrated` and `top20List`)

### Data Schema

#### CoinList
A list container that holds multiple coins and metadata:
- `id`: Unique identifier (string, auto-generated on creation)
- `name`: User-defined list name (string, required, case-insensitive uniqueness enforced)
- `coins`: Array of CoinListItem objects
- `createdAt`: Timestamp when list was created (number, milliseconds since epoch)
- `updatedAt`: Timestamp when list was last modified (number, milliseconds since epoch)
- `notes`: User-created notes for the entire list (string, optional)
- `image`: Optional image URL or path associated with the list (string, optional)

#### CoinListItem
Individual coin entry within a list:
- `coinId`: Coin identifier from market data API (string, e.g., 'bitcoin')
- `symbol`: Coin symbol (string, e.g., 'BTC')
- `name`: Coin name (string, e.g., 'Bitcoin')
- `image`: Coin image URL from market data API (string, optional)
- `notes`: User-created notes specific to this coin in this list (string, optional)
- `apiData`: Optional full market data object (can be refreshed, typically omitted on creation for efficiency)
- `addedAt`: Timestamp when coin was added to list (number, milliseconds since epoch)
- `vsCurrency`: Currency code for price display (SupportedCurrency type, defaults to user preference)

### Data Constraints
- List names must be unique (case-insensitive comparison)
- Duplicate coins cannot be added to the same list (checked by coinId)
- List names are trimmed of whitespace
- Coin notes are trimmed when saved

### Special Lists
- **"Current top 20"**: A virtual, read-only list automatically generated from `marketsData`
  - ID: `'current-top-20'` (defined in `features/lists/top20List.ts`)
  - Built on homepage when market data is fetched
  - Stored in Zustand state but NOT persisted to AsyncStorage
  - Always shows top 20 coins by market cap from latest market data
  - Cannot be edited, deleted, or have coins added/removed

## Core Functionality

### List Management

**Create List**
- User provides a name (required)
- List is created with empty coins array
- System generates unique ID and timestamps
- Name uniqueness is validated against existing lists

**Update List**
- List name can be changed (uniqueness validated)
- List notes can be edited
- List image can be set or removed
- `updatedAt` timestamp is automatically updated

**Delete List**
- Removes entire list and all contained coins
- Operation is permanent

**View Lists**
- Lists are displayed in a scrollable list view
- Each list shows: name, coin count, notes excerpt (if available), preview of coin icons
- Lists can be tapped to navigate to detail view
- "Current top 20" list is always shown first (if market data is available)
- Shows loading spinner next to "Current top 20" if market data not yet loaded

### Coin Management

**Add Coin to List**
- User searches for coins via autocomplete component
- Search supports name and symbol matching
- Coins already in the list are excluded from results
- Selected coin is added with minimal data (coinId, symbol, name, vsCurrency)
- `addedAt` timestamp is set automatically
- Duplicate prevention: coin cannot be added twice to same list

**Remove Coin from List**
- User confirms removal via modal dialog
- Coin is removed from list's coins array
- List's `updatedAt` timestamp is updated

**Edit Coin Notes**
- Notes are edited on the coin detail page (`app/lists/[id]/coin/[coinId].tsx`)
- Notes are saved per-coin, per-list (same coin in different lists can have different notes)
- Editing state is managed with save/cancel actions
- Notes can be deleted (clears the notes field)

**View Coin Details**
- Tapping a coin navigates to list-specific coin detail screen (`app/lists/[id]/coin/[coinId].tsx`)
- Coin detail shows full market information from `marketsData`
- Displays coin notes for that specific list
- Allows editing/deleting notes for that coin in that list

### List Detail View

**Navigation**
- Route: `app/lists/[id].tsx`
- Header title: "List Details"
- Back button label: "All Lists"

**List Metadata Editing**
- List name can be edited inline (with duplicate name checking)
- List notes can be edited inline (multiline text input)
- Changes save automatically via Zustand store
- "Current top 20" list is read-only (name and notes cannot be edited)

**Coin Display**
- Shows coin name, symbol, current price, 24h price change
- Displays coin image if available (using `expo-image`)
- Color-coded price change indicators
- Delete button (trash icon) on the far right of each coin item
- Tapping coin navigates to coin detail page
- "Current top 20" list coins cannot be removed

**Add Coin**
- "+ Add Coin" button opens search modal
- Hidden for "Current top 20" list

## Options & Features

### Search & Autocomplete
- **Local Search**: Searches through main market data cache first (fast, no API call)
- **API Search**: Falls back to API search if local results are empty
- **Search Priority**: Results prioritized by:
  1. Symbol starts with query
  2. Name starts with query
  3. Symbol contains query
  4. Name contains query
- **Debouncing**: API searches are debounced to reduce API calls
- **Exact Match Detection**: Warns user if searched coin already exists in list
- **Result Limit**: Maximum 50 results displayed

### Import/Export

**CSV Export**
- Exports all lists to CSV format
- Format: List Name, List Notes, Coin ID, Symbol, Name, Coin Notes, Currency, Added At
- Each row represents one coin in a list
- List notes appear only in first row of each list
- Empty lists are included with list metadata only
- Platform-specific: Web downloads file, mobile saves and opens share dialog

**CSV Import**
- Parses CSV file and creates lists
- Handles quoted fields and escaped characters
- Groups rows by list name
- Skips duplicate coins within same list
- Generates new IDs for imported lists
- Shows preview with duplicate name detection before import
- User can choose to merge or skip duplicates

### Market Data Integration

**Data Sources**
- Primary: Global market snapshot (top ~1250 coins, refreshed periodically)
- Secondary: TBD





**Price Display**
- Prices shown in user's selected currency (from preferences)
- Currency can vary per coin (stored in vsCurrency field)
- 24h price change shown as percentage with color coding
- Market cap and other metrics displayed when available

## Filter Integration

### Filter System
- Filters analyze coins across all lists using market data
- Filters are applied to coins in lists, not to lists themselves
- Each filter defines matching criteria based on market data properties

### Filter Types
- **Discounted**: Coins trading >70% below all-time high
- **Recent Runner**: Coins with 24h price change >20%
- Additional filters can be added via filter system

### Filter Logic

**OR Logic (Default)**
- When multiple filters active, results show coins matching ANY filter
- Results grouped by filter ID
- Each filter shows separate list of matching coins

**AND Logic (Optional)**
- User can enable AND logic for specific filters
- When AND enabled: coins must match ALL AND filters AND at least one other filter
- Results are unified (single array) instead of grouped by filter
- Shows which lists each coin appears in

### Filter Application
- Filters work on list detail screen (filters coins in that specific list)
- Filters also work on home screen (filters coins across all lists)
- Filter results show:
  - Matching coin information
  - Market data for the coin
  - All lists the coin appears in (for cross-list analysis)

### Filter Display
- Active filters shown as toggleable buttons
- AND logic can be toggled per filter
- Results displayed in collapsible sections
- Each result shows coin details and list membership

## Data Flow & Market Data

### Reading Data
- Lists are read from AsyncStorage on app load




### Market Data Lookup
- When displaying coins, system looks up market data by coinId
- Lookup order:
  1. Global market snapshot (in-memory cache)
  2. TBD


## UI/UX Behavior

### List Management Screen
- Shows all user lists in scrollable view
- Empty state when no lists exist
- Create button opens inline input field
- Each list item shows: name, coin count, coin icon preview
- Long-press or delete button shows confirmation modal
- Edit button allows renaming
- Export/Import buttons in header

### List Detail Screen
- Header shows list name (editable), notes (editable), coin count
- Add Coin button opens search modal
- Coin list scrollable with pull-to-refresh
- Each coin row: image, name/symbol, price, 24h change, notes, remove button
- Compact view toggle in header
- Filters section below coin list
- Filter results shown in collapsible sections

### Search Modal
- Full-screen modal overlay
- Search input auto-focuses on open (with platform-specific delay)
- Real-time search results as user types
- Shows loading state during API search
- Exact match warning if coin already in list
- Results show coin image, name, symbol
- Tapping result adds coin and closes modal
- Backdrop tap or close button dismisses modal

### Coin Notes Editing
- Tap notes field to enter edit mode
- Inline text input appears
- Save button commits changes
- Cancel button discards changes
- Loading state during save operation
- Notes persist per-coin, per-list

### Filter UI
- Filter buttons arranged horizontally
- Active filters highlighted
- AND toggle available per filter
- Results appear below filter controls
- Each result shows coin info and list membership
- Results grouped by filter (OR mode) or unified (AND mode)

### Navigation
- Lists screen: tab navigation
- List detail: stack navigation (back button returns to previous screen)
- Coin detail: stack navigation (accessed from list detail)
- Deep linking: list detail accessible via route with list ID parameter

### Responsive Behavior
- Compact view adapts layout for smaller screens
- Modal keyboard handling (KeyboardAvoidingView on mobile)
- Scrollable content prevents overflow
- Platform-specific styling (iOS vs Android differences handled)

### Loading States
- Loading indicator while lists are being fetched
- Skeleton states for coin data while market data loads
- Background fetching doesn't block UI (coins show with available data)

### Error Handling
- Storage errors logged to console
- Failed API fetches don't block coin display (shows available data)
- User-friendly error messages for validation failures (duplicate names, etc.)

## Implementation Notes

### Data Handling



**Coin ID Normalization**
- Coin IDs are stored as-is (preserving original case from API)
- When removing coins, IDs are normalized to lowercase for comparison: `coinId.toLowerCase()`
- When checking for duplicates on add, comparison uses original case: `c.coinId === coin.coinId`
- This ensures case-insensitive removal while preserving original data

**Storage Error Handling**
- Zustand persist middleware handles storage errors automatically
- Rehydration errors are logged to console but don't crash the app
- If rehydration fails, store starts with empty `lists` array
- Storage errors during saves are handled by Zustand (retries, etc.)

### State Management




### String Normalization

**List Name Handling**
- Names are trimmed on both create and update operations
- Duplicate checking is case-insensitive: `name.trim().toLowerCase() === otherName.trim().toLowerCase()`
- Original trimmed name is stored (not lowercased)
- When updating name, current list is excluded from duplicate check: `l.id !== id`

**Notes Trimming**
- List notes: Not trimmed (preserves user formatting)
- Coin notes: Trimmed when saved: `notes.trim()`
- This allows multi-line formatting in list notes but prevents trailing whitespace in coin notes

### Filter State Management

**Filter Toggle Logic**
- When removing a filter, it's also removed from AND logic array
- This prevents inconsistent state where a filter is in AND array but not active
- Pattern: `setAndFilterIds((andPrev) => andPrev.filter((id) => id !== filterId))`

### CSV Import/Export

**CSV Import Duplicate Handling**
- Duplicate list names are detected before import
- User is prompted to replace or cancel
- If replacing: existing list is updated (preserves original ID and timestamps)
- If creating: new list is created with new ID
- Duplicate coins within same list are automatically skipped (no user prompt)

**CSV List Notes**
- List notes appear only in the first row of each list in CSV
- Subsequent rows have empty list notes field
- On import, list notes are read only from first row per list
- This prevents duplicate notes in CSV while maintaining data integrity

### UI/UX Implementation Details

**Modal Auto-Focus**
- Search modal input auto-focuses when modal opens
- Platform-specific delays: iOS and Android have different timing requirements
- Uses constants: `MODAL_FOCUS_DELAY_IOS_MS` and `MODAL_FOCUS_DELAY_ANDROID_MS`
- Delay ensures modal is fully rendered before focusing (prevents focus failures)

**Keyboard Dismissal**
- After closing search modal, keyboard is dismissed with `setTimeout(..., 0)`
- This ensures modal close animation completes before keyboard dismissal
- Both `Keyboard.dismiss()` and `inputRef.current?.blur()` are called
- The timeout prevents race conditions with modal close animation

**Confirmation Modals**
- Uses unified `ModalDialog` component (`components/ModalDialog.tsx`)
- Works consistently across web and mobile platforms
- Supports both alert mode (single button) and confirmation mode (two buttons)
- Modal is rendered at top level of component tree (not nested)
- State managed separately: `coinToRemove` for coin removal, `listToDelete` for list deletion

### Duplicate Prevention

**Adding Coins**
- Duplicate check uses exact match: `list.coins.some((c) => c.coinId === coin.coinId)`
- If duplicate found, list is returned unchanged (no error thrown)
- This is a silent prevention (user doesn't see error, coin just isn't added)

**List Name Uniqueness**
- Checked on both create and update operations
- Case-insensitive comparison with trimmed names
- Error message: "A list with this name already exists"
- Validation happens in mutation function, not UI layer

### Data Consistency

**Timestamp Management**
- `createdAt`: Set once on creation, never updated
- `updatedAt`: Updated on every mutation (list update, add coin, remove coin, update notes)
- `addedAt`: Set when coin is added, never updated
- All timestamps are milliseconds since epoch

**ID Generation**
- List IDs: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
- Combines timestamp with random string for uniqueness
- Format ensures sortable by creation time while avoiding collisions

### Platform Differences (Mobile vs Web)

**Alert Dialogs**
- **Web**: Uses native `Alert.alert()` from React Native
- **Mobile**: Uses custom `AlertModal` component for consistent styling
- Pattern: `if (Platform.OS === "web") { Alert.alert(...) } else { setAlertModal(...) }`
- This ensures native web alerts on web, custom styled modals on mobile

**Confirmation Modals**
- **Web**: Uses `Alert.alert()` with button array for confirmations
- **Mobile**: Uses custom `ConfirmationModal` component
- Example: CSV import duplicate handling uses different components per platform
- Custom modals provide consistent theming and better UX on mobile

**CSV Export**
- **Web**: Uses `downloadCsvFile()` - creates blob, triggers browser download
- **Mobile**: Uses `exportCsvFileMobile()` - saves to device storage, opens share dialog
- Web allows directory selection and filename prompt
- Mobile saves to document/cache directory and uses native share sheet
- Mobile doesn't show success alert (share dialog opening is sufficient feedback)

**CSV Import**
- **Web**: Uses HTML file input element (`document.createElement("input")`)
- **Mobile**: Uses `expo-document-picker` API
- Both read file content and parse CSV identically
- Only the file selection mechanism differs

**Modal Auto-Focus**
- **iOS**: Uses `MODAL_FOCUS_DELAY_IOS_MS` constant (longer delay)
- **Android**: Uses `MODAL_FOCUS_DELAY_ANDROID_MS` constant (shorter delay)
- iOS requires longer delay for modal rendering to complete
- Pattern: `Platform.OS === "ios" ? MODAL_FOCUS_DELAY_IOS_MS : MODAL_FOCUS_DELAY_ANDROID_MS`

**KeyboardAvoidingView**
- **iOS**: Uses `behavior="padding"` with `keyboardVerticalOffset={0}`
- **Android**: Uses `behavior={undefined}` (no special handling needed)
- iOS requires explicit keyboard avoidance, Android handles it natively

**Modal Padding**
- **iOS**: Top padding of 60px
- **Android**: Top padding of 40px
- Accounts for different status bar heights
- Pattern: `paddingTop: Platform.OS === "ios" ? 60 : 40`

**Stablecoin Badge Display**
- **Web**: Badge shown inline in coin info column (not absolutely positioned)
- **Mobile**: Badge absolutely positioned over coin item (overlay style)
- Mobile uses opacity and rotation constants for badge styling
- Web integrates badge into layout flow
- Conditional: `Platform.OS !== 'web'` for mobile badge, `Platform.OS === 'web'` for web layout

**Percentage Change Styling**
- **Web**: Uses `styles.percentageChangeWeb` for additional styling
- **Mobile**: Uses default styling
- Web-specific styles applied conditionally: `Platform.OS === 'web' && styles.percentageChangeWeb`

**List Item Positioning**
- **Web**: No special positioning needed
- **Mobile**: Uses `position: "relative"` to enable absolute positioning for stablecoin badge
- Applied via `Platform.select()` in stylesheet

**Compact View Padding**
- **Web**: No padding adjustment in compact mode
- **Mobile**: Reduces horizontal padding in compact mode (`paddingHorizontal: Spacing.sm`)
- Applied via `Platform.select()` in stylesheet

## Testing

### Store Tests
- Test file: `__tests__/coinListsStore.test.ts`
- Tests cover all store actions: create, update, delete lists, add/remove coins, update notes
- Tests validate data constraints: uniqueness, trimming, duplicate prevention
- Tests verify state management: timestamps, ID generation, top20List handling
- Uses Jest with mocked AsyncStorage and prefsStore

### Test Coverage
- ✅ List creation with validation
- ✅ List updates (name, notes, image)
- ✅ List deletion
- ✅ Adding coins to lists
- ✅ Removing coins from lists
- ✅ Updating coin notes
- ✅ List retrieval (getList, getAllLists)
- ✅ Top 20 list management
- ✅ Duplicate prevention (list names, coins)
- ✅ Case-insensitive operations
- ✅ String trimming and normalization

