// app/tests/current-volatility-widget-demo.tsx

import { CurrentVolatilityWidget } from '@/components/CurrentVolatilityWidget';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ScrollView, StyleSheet } from 'react-native';

type VolatilityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';

interface TestCase {
  name: string;
  description: string;
  data: {
    volatility1h: number;
    volatility24h: number;
    level1h: VolatilityLevel;
    level24h: VolatilityLevel;
    lastUpdated?: string;
  };
  mode?: 'compact' | 'normal';
}

const testCases: TestCase[] = [
  // Normal conditions
  {
    name: 'Low Volatility (Both Timeframes)',
    description: 'Both 1h and 24h are LOW - calm market conditions',
    data: {
      volatility1h: 0.8,
      volatility24h: 1.2,
      level1h: 'LOW',
      level24h: 'LOW',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Normal Volatility (Both Timeframes)',
    description: 'Both 1h and 24h are NORMAL - typical market conditions',
    data: {
      volatility1h: 2.5,
      volatility24h: 3.0,
      level1h: 'NORMAL',
      level24h: 'NORMAL',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Mixed: Low 1h, Normal 24h',
    description: '1h is LOW, 24h is NORMAL',
    data: {
      volatility1h: 1.0,
      volatility24h: 3.5,
      level1h: 'LOW',
      level24h: 'NORMAL',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Mixed: Normal 1h, Low 24h',
    description: '1h is NORMAL, 24h is LOW',
    data: {
      volatility1h: 3.0,
      volatility24h: 1.5,
      level1h: 'NORMAL',
      level24h: 'LOW',
      lastUpdated: new Date().toISOString(),
    },
  },
  // High volatility conditions
  {
    name: 'High Volatility (Both Timeframes)',
    description: 'Both 1h and 24h are HIGH - sustained elevated volatility (🔥)',
    data: {
      volatility1h: 5.5,
      volatility24h: 7.0,
      level1h: 'HIGH',
      level24h: 'HIGH',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Short-term Spike',
    description: '1h is HIGH, 24h is NORMAL - temporary spike (⚡)',
    data: {
      volatility1h: 6.0,
      volatility24h: 3.5,
      level1h: 'HIGH',
      level24h: 'NORMAL',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Short-term Spike (Extreme 1h)',
    description: '1h is EXTREME, 24h is NORMAL - major temporary spike (⚡)',
    data: {
      volatility1h: 12.0,
      volatility24h: 4.0,
      level1h: 'EXTREME',
      level24h: 'NORMAL',
      lastUpdated: new Date().toISOString(),
    },
  },
  // Extreme conditions
  {
    name: 'EXTREME Volatility (Both Timeframes)',
    description: 'Both 1h and 24h are EXTREME - severe market conditions (🔥)',
    data: {
      volatility1h: 15.0,
      volatility24h: 18.0,
      level1h: 'EXTREME',
      level24h: 'EXTREME',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Mixed Extreme: EXTREME 1h, HIGH 24h',
    description: '1h is EXTREME, 24h is HIGH - very elevated conditions (🔥)',
    data: {
      volatility1h: 20.0,
      volatility24h: 9.0,
      level1h: 'EXTREME',
      level24h: 'HIGH',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Mixed Extreme: HIGH 1h, EXTREME 24h',
    description: '1h is HIGH, 24h is EXTREME - sustained extreme conditions (🔥)',
    data: {
      volatility1h: 7.5,
      volatility24h: 15.0,
      level1h: 'HIGH',
      level24h: 'EXTREME',
      lastUpdated: new Date().toISOString(),
    },
  },
  // Edge cases
  {
    name: 'Very Low Volatility',
    description: 'Minimal volatility - very calm market',
    data: {
      volatility1h: 0.3,
      volatility24h: 0.5,
      level1h: 'LOW',
      level24h: 'LOW',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Borderline: Normal to High',
    description: '1h at HIGH threshold, 24h at NORMAL threshold',
    data: {
      volatility1h: 4.0,
      volatility24h: 5.0,
      level1h: 'HIGH',
      level24h: 'NORMAL',
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    name: 'Borderline: High to Extreme',
    description: '1h at EXTREME threshold, 24h at HIGH threshold',
    data: {
      volatility1h: 8.1,
      volatility24h: 10.1,
      level1h: 'EXTREME',
      level24h: 'EXTREME',
      lastUpdated: new Date().toISOString(),
    },
  },
];

export default function CurrentVolatilityWidgetDemo() {
  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          CurrentVolatilityWidget Component
        </ThemedText>
        <ThemedText type="default" colorVariant="textSubtle" style={styles.description}>
          Visual demonstration of the CurrentVolatilityWidget component showing all volatility level combinations,
          market conditions, and display modes. The widget shows contextual emojis (🔥 for sustained volatility,
          ⚡ for short-term spikes) when volatility is elevated.
        </ThemedText>

        {/* Normal Mode Section */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Normal Mode - All Variations
        </ThemedText>
        <ThemedText type="small" colorVariant="textSubtle" style={styles.sectionDescription}>
          Normal mode provides a spacious layout with detailed information including volatility scales.
        </ThemedText>

        {testCases.map((testCase, index) => (
          <ThemedView key={`normal-${index}`} style={styles.testCase}>
            <ThemedText type="defaultSemiBold" style={styles.testCaseName}>
              {testCase.name}
            </ThemedText>
            <ThemedText type="small" colorVariant="textSubtle" style={styles.testCaseDescription}>
              {testCase.description}
            </ThemedText>
            <ThemedView style={styles.widgetContainer}>
              <CurrentVolatilityWidget data={testCase.data} mode="normal" />
            </ThemedView>
          </ThemedView>
        ))}

        {/* Compact Mode Section */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Compact Mode - All Variations
        </ThemedText>
        <ThemedText type="small" colorVariant="textSubtle" style={styles.sectionDescription}>
          Compact mode provides a minimal layout for space-constrained views.
        </ThemedText>

        {testCases.map((testCase, index) => (
          <ThemedView key={`compact-${index}`} style={styles.testCase}>
            <ThemedText type="defaultSemiBold" style={styles.testCaseName}>
              {testCase.name} (Compact)
            </ThemedText>
            <ThemedText type="small" colorVariant="textSubtle" style={styles.testCaseDescription}>
              {testCase.description}
            </ThemedText>
            <ThemedView style={styles.widgetContainer}>
              <CurrentVolatilityWidget data={testCase.data} mode="compact" />
            </ThemedView>
          </ThemedView>
        ))}

        {/* Extreme Conditions Summary */}
        <ThemedView style={styles.summarySection}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>
            Volatility Level Guide
          </ThemedText>
          <ThemedView style={styles.guideItem}>
            <ThemedText type="defaultSemiBold">😴 LOW</ThemedText>
            <ThemedText type="small" colorVariant="textSubtle">
              1h: &lt; 1.5%, 24h: &lt; 2%
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.guideItem}>
            <ThemedText type="defaultSemiBold">✅ NORMAL</ThemedText>
            <ThemedText type="small" colorVariant="textSubtle">
              1h: 1.5-4%, 24h: 2-5%
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.guideItem}>
            <ThemedText type="defaultSemiBold">🚩 HIGH</ThemedText>
            <ThemedText type="small" colorVariant="textSubtle">
              1h: 4-8%, 24h: 5-10%
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.guideItem}>
            <ThemedText type="defaultSemiBold">🚨 EXTREME</ThemedText>
            <ThemedText type="small" colorVariant="textSubtle">
              1h: &gt; 8%, 24h: &gt; 10%
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.guideItem}>
            <ThemedText type="defaultSemiBold">🔥 Sustained Volatility</ThemedText>
            <ThemedText type="small" colorVariant="textSubtle">
              Both 1h and 24h are HIGH or EXTREME
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.guideItem}>
            <ThemedText type="defaultSemiBold">⚡ Short-term Spike</ThemedText>
            <ThemedText type="small" colorVariant="textSubtle">
              Only 1h is HIGH or EXTREME, 24h is normal
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    marginBottom: Spacing.md,
  },
  testCase: {
    marginBottom: Spacing.lg,
  },
  testCaseName: {
    marginBottom: Spacing.xs,
  },
  testCaseDescription: {
    marginBottom: Spacing.sm,
  },
  widgetContainer: {
    marginTop: Spacing.sm,
  },
  summarySection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: 8,
    gap: Spacing.md,
  },
  guideItem: {
    marginBottom: Spacing.sm,
  },
});

