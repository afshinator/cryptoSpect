# CryptoSpect 🔬

A React Native Expo app for tracking cryptocurrency market data including volatility and dominance metrics.

## Features

- **Current Volatility**: Real-time cryptocurrency market volatility data
- **Current Dominance**: Market dominance calculations for BTC, ETH, stablecoins, and others
- **API Configuration**: Flexible data source management with primary/secondary sources and automatic fallback
- **Settings**: Customizable theme, font scale, currency, and compact mode preferences

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## API Configuration

The app includes a comprehensive API configuration screen (`/config`) that allows you to:

- **Set Global Data Source Preferences**: Choose between Primary (Backend API) and Secondary (CoinGecko API) as the default data source for all features
- **Enable Automatic Fallback**: Automatically switch to the alternate data source if the preferred one fails
- **Configure Per-Feature Settings**: Override global preferences for individual features
- **Block API Sources**: Temporarily block specific API sources (primary or secondary) for testing or troubleshooting

The configuration uses a **Segmented Control** component (from `@react-native-segmented-control/segmented-control`) for selecting between data sources, providing a native iOS-style interface that works cross-platform.

### Data Source Management

- **Primary Source**: Backend API proxy (default)
- **Secondary Source**: CoinGecko API (fallback)
- **Automatic Fallback**: When enabled, the app will automatically try the alternate source if the preferred one fails or is blocked

All preferences are persisted using AsyncStorage and will survive app restarts.

## Components
   
 TBD. ✔️

## Testing

Run the test suite:

```bash
npm run test
```

Test files are located in the `__tests__` directory and include:
- Component tests (Settings, Config screens)
- Store tests (API blocking, preferences)
- API wrapper tests
- Integration tests

## Project Structure

```
app/
  (tabs)/
    index.tsx          # Home screen
    settings.tsx       # Settings screen
  config.tsx          # API Configuration screen
components/
  bordered-section.tsx # Reusable bordered section component
  themed-*.tsx        # Themed UI components
features/
  dominance/          # Market dominance feature
  currentVolatility/  # Volatility feature
stores/
  apiBlockingStore.ts # API blocking and preferences store
  latestStore.ts      # Latest fetched data cache
  prefsStore.ts       # User preferences store
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.