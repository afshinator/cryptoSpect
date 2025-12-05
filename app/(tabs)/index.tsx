import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { CurrentDominanceWidget } from '@/components/current-dominance-widget';
import { CurrentVolatilityWidget } from '@/components/CurrentVolatilityWidget';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VolatilityRankingATRP } from '@/components/volatility-ranking-atrp-chart';
import { fetchCurrentVolatility } from '@/features/currentVolatility/api';
import { fetchCurrentDominance } from '@/features/dominance/current/api';
import { getTop20List } from '@/features/lists/top20List';
import { buildCoinMaps, fetchMarkets } from '@/features/marketsData/api';
import { fetchVwatr } from '@/features/vwatr/api';
import { useCoinListsStore } from '@/stores/coinListsStore';
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
    vwatrData,
    setVwatrData,
    marketsData,
    setMarketsData,
    setCoinMaps,
  } = useLatestStore();
  const { compactMode, currency } = usePrefsStore();
  const { setTop20List } = useCoinListsStore();

  // Use refs to track if fetches are in progress to prevent duplicate calls
  const volatilityFetchInProgress = useRef(false);
  const dominanceFetchInProgress = useRef(false);
  const vwatrFetchInProgress = useRef(false);
  const marketsFetchInProgress = useRef(false);

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

    // Only fetch markets data if it's null and not already fetching (with delay)
    if (marketsData === null && !marketsFetchInProgress.current) {
      marketsFetchInProgress.current = true;
      // Wait 3 seconds before making the markets call
      setTimeout(() => {
        fetchMarkets().then((data) => {
          marketsFetchInProgress.current = false;
          if (data) {
            setMarketsData(data);
            console.log('📈 Markets data:', data);
            console.log('📈 Markets data count:', data.data.length);
 
            log(`📈 Markets data stored: ${data.data.length} coins`, TMI);
            
            // Build and store coin maps (id to symbol, symbol to id)
            const maps = buildCoinMaps(data.data);
            setCoinMaps(maps);
            log(`📈 Coin maps built: ${Object.keys(maps.idToSymbol).length} entries`, TMI);
          }
        }).catch(() => {
          marketsFetchInProgress.current = false;
        });
      }, 3000);
    }

    // Only fetch VWATR data if it's null and not already fetching
    if (vwatrData === null && !vwatrFetchInProgress.current) {
      vwatrFetchInProgress.current = true;
      fetchVwatr().then((data) => {
        vwatrFetchInProgress.current = false;
        if (data) {
          setVwatrData(data);
          log(`📊 VWATR data stored: bag=${data.bag}, periods=[${data.periods.join(',')}], coins=${data.data.length}`, LOG);
        }
      }).catch(() => {
        vwatrFetchInProgress.current = false;
      });
    }
  }, [currentVolatilityData, currentDominanceData, vwatrData, marketsData, currency]); // Removed setters - they're stable references

  // Rebuild top20 list when marketsData or currency changes
  useEffect(() => {
    if (marketsData) {
      const top20List = getTop20List(marketsData, currency);
      if (top20List) {
        setTop20List(top20List);
        log(`📜 Top 20 list updated: ${top20List.coins.length} coins`, TMI);
      }
    } else {
      // Clear the list if marketsData is cleared
      setTop20List(null);
    }
  }, [marketsData, currency, setTop20List]);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#2789aa', dark: '#151d2c' }}
      headerImage={
        <Image
          source={require('@/assets/images/logo2.jpg')}
          style={[
            styles.headerImage,
            Platform.OS === 'web' && styles.headerImageDesktop,
          ]}
          contentFit={Platform.OS === 'web' ? 'contain' : 'cover'}
        />
      }>
      {/* <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">CryptoSpect</ThemedText>
      </ThemedView> */}

      {volatilityWidgetData && (
        <CurrentVolatilityWidget 
          data={volatilityWidgetData}
          mode={compactMode ? 'compact' : 'normal'}
          percentagePrecision={1}
        />
      )}

      {currentDominanceData && (
        <CurrentDominanceWidget 
          data={currentDominanceData}
          mode={compactMode ? 'compact' : 'normal'}
          percentagePrecision={1}
        />
      )}

      {vwatrData && (
        <VolatilityRankingATRP 
          data={{
            type: vwatrData.type,
            bag: vwatrData.bag,
            periods: vwatrData.periods,
            maxPeriod: vwatrData.maxPeriod,
            timestamp: vwatrData.timestamp,
            data: vwatrData.data,
          }}
          mode={compactMode ? 'compact' : 'normal'}
          description="VWATR 30 day chart"
        />
      )}

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

const HEADER_HEIGHT = Platform.OS === 'web' ? 200 : 175;

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
  headerImage: {
    width: '100%',
    height: HEADER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerImageDesktop: {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
});
