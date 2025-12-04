import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { CurrentVolatilityWidget } from '@/components/CurrentVolatilityWidget';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchCurrentVolatility } from '@/features/currentVolatility/api';
import { fetchCurrentDominance } from '@/features/dominance/current/api';
import { useLatestStore } from '@/stores/latestStore';
import { usePrefsStore } from '@/stores/prefsStore';
import { log, LOG, TMI } from '@/utils/log';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const { 
    currentVolatilityData, 
    setCurrentVolatilityData,
    currentDominanceData,
    setCurrentDominanceData,
  } = useLatestStore();
  const { compactMode } = usePrefsStore();

  // Use refs to track if fetches are in progress to prevent duplicate calls
  const volatilityFetchInProgress = useRef(false);
  const dominanceFetchInProgress = useRef(false);

  // Convert CurrentVolatilityResponse to VolatilityData format for widget
  const volatilityWidgetData = currentVolatilityData ? {
    volatility1h: currentVolatilityData.volatility1h,
    volatility24h: currentVolatilityData.volatility24h,
    level1h: currentVolatilityData.level1h as 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME',
    level24h: currentVolatilityData.level24h as 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME',
    lastUpdated: currentVolatilityData.fetchedAt 
      ? new Date(currentVolatilityData.fetchedAt).toISOString()
      : undefined,
  } : null;

  useEffect(() => {
    // Only fetch if data is null and not already fetching
    if (currentVolatilityData === null && !volatilityFetchInProgress.current) {
      volatilityFetchInProgress.current = true;
      fetchCurrentVolatility().then((data) => {
        volatilityFetchInProgress.current = false;
        if (data) {
          setCurrentVolatilityData(data);
          log(`⚡ Current volatility data stored: ${JSON.stringify(data)}`, LOG);
        }
      }).catch(() => {
        volatilityFetchInProgress.current = false;
      });
    }

    // Only fetch dominance data if it's null and not already fetching
    if (currentDominanceData === null && !dominanceFetchInProgress.current) {
      dominanceFetchInProgress.current = true;
      fetchCurrentDominance().then((data) => {
        dominanceFetchInProgress.current = false;
        if (data) {
          setCurrentDominanceData(data);
          log(`💪 Current dominance data: ${JSON.stringify(data)}`, TMI);
          log(`💪 BTC: ${data.btc.dominance}%, ETH: ${data.eth.dominance}%, Stablecoins: ${data.stablecoins.dominance}%, Others: ${data.others.dominance}%`, LOG);
        }
      }).catch(() => {
        dominanceFetchInProgress.current = false;
      });
    }
  }, [currentVolatilityData, currentDominanceData]); // Removed setters - they're stable references
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Current Volatility Widget */}
      {volatilityWidgetData && (
        <CurrentVolatilityWidget 
          data={volatilityWidgetData}
          mode={compactMode ? 'compact' : 'normal'}
        />
      )}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          {/* Link.Preview removed to fix aria-hidden accessibility warning on web */}
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/tests">
          <Link.Trigger>
            <ThemedText type="subtitle" colorVariant="warning">Component Tests</ThemedText>
          </Link.Trigger>
        </Link>
        <ThemedText>
          View visual test pages for components like{' '}
          <ThemedText type="defaultSemiBold">ThemedText</ThemedText> to see all prop combinations and styling options.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
