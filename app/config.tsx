// app/config.tsx
// API Blocking Configuration Screen

import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllFeatures } from '@/constants/features';
import { useApiBlockingStore } from '@/stores/apiBlockingStore';
import { StyleSheet, Switch, View } from 'react-native';

export default function ConfigScreen() {
  const { globalBlocking, featureBlocking, setGlobalBlocking, setFeatureBlocking } = useApiBlockingStore();
  const features = getAllFeatures();

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          API Configuration
        </ThemedText>

        {/* Global API Blocking */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Global API Controls
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.sectionDescription}>
            Block all API calls for a specific service globally
          </ThemedText>

          {/* Backend Blocking */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="default">Block Backend API</ThemedText>
              <ThemedText type="small" colorVariant="textSubtle">
                Block all calls to {process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'backend API'}
              </ThemedText>
            </View>
            <Switch
              value={globalBlocking.blockBackend}
              onValueChange={(value) => setGlobalBlocking({ blockBackend: value })}
              trackColor={{ false: '#767577', true: '#d32f2f' }}
              thumbColor={globalBlocking.blockBackend ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* CoinGecko Blocking */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="default">Block CoinGecko API</ThemedText>
              <ThemedText type="small" colorVariant="textSubtle">
                Block all calls to CoinGecko API
              </ThemedText>
            </View>
            <Switch
              value={globalBlocking.blockCoinGecko}
              onValueChange={(value) => setGlobalBlocking({ blockCoinGecko: value })}
              trackColor={{ false: '#767577', true: '#d32f2f' }}
              thumbColor={globalBlocking.blockCoinGecko ? '#fff' : '#f4f3f4'}
            />
          </View>
        </ThemedView>

        {/* Feature-Specific Blocking */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Feature Controls
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.sectionDescription}>
            Block API access for specific features
          </ThemedText>

          {features.map((feature) => {
            const blocking = featureBlocking[feature.id] || { blockDefault: false, blockAlternate: false };

            return (
              <ThemedView key={feature.id} style={styles.featureSection}>
                <ThemedText type="defaultSemiBold" style={styles.featureName}>
                  {feature.name}
                </ThemedText>
                <ThemedText type="small" colorVariant="textSubtle" style={styles.featureDescription}>
                  {feature.description}
                </ThemedText>

                {/* Default Source Blocking */}
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    <ThemedText type="default">Block Default Source</ThemedText>
                    <ThemedText type="small" colorVariant="textSubtle">
                      Block primary/backend API calls
                    </ThemedText>
                  </View>
                  <Switch
                    value={blocking.blockDefault}
                    onValueChange={(value) => setFeatureBlocking(feature.id, { blockDefault: value })}
                    trackColor={{ false: '#767577', true: '#d32f2f' }}
                    thumbColor={blocking.blockDefault ? '#fff' : '#f4f3f4'}
                  />
                </View>

                {/* Alternate Source Blocking (grayed out if not supported) */}
                <View style={[styles.switchRow, !feature.supportsAlternateSource && styles.disabledRow]}>
                  <View style={styles.switchLabelContainer}>
                    <ThemedText type="default" style={!feature.supportsAlternateSource && styles.disabledText}>
                      Block Alternate Source
                    </ThemedText>
                    <ThemedText type="small" colorVariant="textSubtle" style={!feature.supportsAlternateSource && styles.disabledText}>
                      {feature.supportsAlternateSource
                        ? 'Block fallback/alternate API calls'
                        : 'Alternate source not yet supported'}
                    </ThemedText>
                  </View>
                  <Switch
                    value={blocking.blockAlternate}
                    onValueChange={(value) => setFeatureBlocking(feature.id, { blockAlternate: value })}
                    trackColor={{ false: '#767577', true: '#d32f2f' }}
                    thumbColor={blocking.blockAlternate ? '#fff' : '#f4f3f4'}
                    disabled={!feature.supportsAlternateSource}
                  />
                </View>
              </ThemedView>
            );
          })}
        </ThemedView>
      </ThemedView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
  },
  featureSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  featureName: {
    marginBottom: 4,
  },
  featureDescription: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
});

