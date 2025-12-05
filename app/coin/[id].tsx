// app/coin/[id].tsx
// Coin detail screen (stubbed)

import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Spacing } from '@/constants/theme';
import { getMockMarketData } from '@/features/lists/mockData';
import { CoinGeckoMarketData } from '@/constants/coinGecko';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function CoinDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [coinData, setCoinData] = useState<CoinGeckoMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const cardColor = useThemeColor({}, 'cardBackground');

  useEffect(() => {
    // Stub: Simulate API call
    const fetchCoinData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Use mock data for now
      const mockData = getMockMarketData(id || '');
      setCoinData(mockData || null);
      setLoading(false);
    };

    if (id) {
      fetchCoinData();
    }
  }, [id]);

  if (loading) {
    return (
      <ScreenContainer>
        <ThemedView style={styles.container}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading coin data...</ThemedText>
        </ThemedView>
      </ScreenContainer>
    );
  }

  if (!coinData) {
    return (
      <ScreenContainer>
        <ThemedView style={styles.container}>
          <ThemedText type="subtitle">Coin not found</ThemedText>
          <ThemedText colorVariant="textSubtle">
            Unable to load data for coin: {id}
          </ThemedText>
        </ThemedView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <ThemedText type="title">{coinData.name}</ThemedText>
        <ThemedText type="subtitle" colorVariant="textSubtle">
          {coinData.symbol.toUpperCase()}
        </ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Price Information
          </ThemedText>
          <ThemedView style={styles.infoRow}>
            <ThemedText>Current Price:</ThemedText>
            <ThemedText type="defaultSemiBold">
              ${coinData.current_price?.toLocaleString() || 'N/A'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText>24h Change:</ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={{
                color:
                  (coinData.price_change_percentage_24h || 0) >= 0 ? successColor : errorColor,
              }}
            >
              {coinData.price_change_percentage_24h
                ? `${coinData.price_change_percentage_24h >= 0 ? '+' : ''}${coinData.price_change_percentage_24h.toFixed(2)}%`
                : 'N/A'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Market Data
          </ThemedText>
          <ThemedView style={styles.infoRow}>
            <ThemedText>Market Cap:</ThemedText>
            <ThemedText type="defaultSemiBold">
              ${coinData.market_cap?.toLocaleString() || 'N/A'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText>Market Cap Rank:</ThemedText>
            <ThemedText type="defaultSemiBold">
              #{coinData.market_cap_rank || 'N/A'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText>24h Volume:</ThemedText>
            <ThemedText type="defaultSemiBold">
              ${coinData.total_volume?.toLocaleString() || 'N/A'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Price Range (24h)
          </ThemedText>
          <ThemedView style={styles.infoRow}>
            <ThemedText>High:</ThemedText>
            <ThemedText type="defaultSemiBold">
              ${coinData.high_24h?.toLocaleString() || 'N/A'}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText>Low:</ThemedText>
            <ThemedText type="defaultSemiBold">
              ${coinData.low_24h?.toLocaleString() || 'N/A'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.note, { backgroundColor: warningColor + '1A' }]}>
          <ThemedText type="small" colorVariant="textSubtle">
            Note: This is a stubbed screen. Real API integration will be added later.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  note: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 8,
    // backgroundColor will be set dynamically
  },
});

