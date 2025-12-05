// app/config.tsx
// API Blocking Configuration Screen

import { BorderedSection } from '@/components/bordered-section';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllFeatures } from '@/constants/features';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEffectivePreferences, useApiBlockingStore } from '@/stores/apiBlockingStore';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { StyleSheet, Switch, View } from 'react-native';

export default function ConfigScreen() {
  const { 
    globalBlocking, 
    featureBlocking, 
    globalPreferences,
    featurePreferences,
    setGlobalBlocking, 
    setFeatureBlocking,
    setGlobalPreferences,
    setFeaturePreferences,
  } = useApiBlockingStore();
  const features = getAllFeatures();

  // Theme colors for switches
  const switchInactiveTrack = useThemeColor({}, 'icon');
  const switchSuccessTrack = useThemeColor({}, 'success');
  const switchErrorTrack = useThemeColor({}, 'error');
  const switchActiveThumb = useThemeColor({}, 'highlightedText');
  const switchInactiveThumb = useThemeColor({}, 'buttonSecondary');

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          API Configuration
        </ThemedText>

        {/* Global Data Source Preferences */}
        <BorderedSection marginBottom={32}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Global Data Source Preferences
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.sectionDescription}>
            Default settings for all features (can be overridden per feature)
          </ThemedText>

          {/* Preferred Data Source */}
          <View style={styles.segmentedControlContainer}>
            <ThemedText type="default" style={styles.segmentedControlLabel}>
              Preferred Data Source
            </ThemedText>
            <SegmentedControl
              values={['Primary', 'Secondary']}
              selectedIndex={globalPreferences.preferredDataSource === 'primary' ? 0 : 1}
              onChange={(event) => {
                setGlobalPreferences({ 
                  preferredDataSource: event.nativeEvent.selectedSegmentIndex === 0 ? 'primary' : 'secondary'
                });
              }}
            />
            <ThemedText type="small" colorVariant="textSubtle" style={styles.segmentedControlDescription}>
              {globalPreferences.preferredDataSource === 'primary' 
                ? 'Primary (Backend API)' 
                : 'Secondary (CoinGecko API)'}
            </ThemedText>
          </View>

          {/* Enable Fallback */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="default">Enable Automatic Fallback</ThemedText>
              <ThemedText type="small" colorVariant="textSubtle">
                Automatically try other source if preferred fails
              </ThemedText>
            </View>
            <Switch
              value={globalPreferences.enableFallback}
              onValueChange={(value) => setGlobalPreferences({ enableFallback: value })}
              trackColor={{ false: switchInactiveTrack, true: switchSuccessTrack }}
              thumbColor={globalPreferences.enableFallback ? switchActiveThumb : switchInactiveThumb}
            />
          </View>
        </BorderedSection>

        {/* Global API Blocking */}
        <BorderedSection marginBottom={32}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Global API Blocking
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
              trackColor={{ false: switchInactiveTrack, true: switchErrorTrack }}
              thumbColor={globalBlocking.blockBackend ? switchActiveThumb : switchInactiveThumb}
            />
          </View>

          {/* CoinGecko Blocking */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="default">Block 🦎CoinGecko API</ThemedText>
              <ThemedText type="small" colorVariant="textSubtle">
                Block all calls to CoinGecko API
              </ThemedText>
            </View>
            <Switch
              value={globalBlocking.blockCoinGecko}
              onValueChange={(value) => setGlobalBlocking({ blockCoinGecko: value })}
              trackColor={{ false: switchInactiveTrack, true: switchErrorTrack }}
              thumbColor={globalBlocking.blockCoinGecko ? switchActiveThumb : switchInactiveThumb}
            />
          </View>
        </BorderedSection>

        {/* Feature-Specific Settings */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Feature-Specific Settings
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.sectionDescription}>
            Override global settings for specific features
          </ThemedText>

          {features.map((feature) => {
            const blocking = featureBlocking[feature.id] || { blockPrimary: false, blockSecondary: false };
            const prefs = featurePreferences[feature.id] || { 
              preferredDataSource: 'primary', 
              enableFallback: true, 
              useGlobalPreferences: true 
            };
            const effectivePrefs = getEffectivePreferences(feature.id);

            // Map feature IDs to emojis
            const featureEmojis: Record<string, string> = {
              currentVolatility: '⚡',
              currentDominance: '💪',
              vwatr: '📊',
            };

            return (
              <BorderedSection 
                key={feature.id}
                backgroundEmoji={featureEmojis[feature.id]}
                emojiOpacity={0.15}
                emojiPlacement="upperRight"
              >
                <ThemedText type="defaultSemiBold" style={styles.featureName}>
                  {feature.name}
                </ThemedText>
                <ThemedText type="small" colorVariant="textSubtle" style={styles.featureDescription}>
                  {feature.description}
                </ThemedText>

                {/* Use Global Preferences Checkbox */}
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    <ThemedText type="default">Use Global Preferences</ThemedText>
                    <ThemedText type="small" colorVariant="textSubtle">
                      {prefs.useGlobalPreferences 
                        ? `Using global: ${effectivePrefs.preferredDataSource} (fallback: ${effectivePrefs.enableFallback ? 'enabled' : 'disabled'})`
                        : 'Using feature-specific settings'}
                    </ThemedText>
                  </View>
                  <Switch
                    value={prefs.useGlobalPreferences}
                    onValueChange={(value) => setFeaturePreferences(feature.id, { useGlobalPreferences: value })}
                    trackColor={{ false: switchInactiveTrack, true: switchSuccessTrack }}
                    thumbColor={prefs.useGlobalPreferences ? switchActiveThumb : switchInactiveThumb}
                  />
                </View>

                {/* Feature-Specific Preferences (shown when not using global) */}
                {!prefs.useGlobalPreferences && (
                  <>
                    {/* Preferred Data Source */}
                    <View style={styles.segmentedControlContainer}>
                      <ThemedText type="default" style={styles.segmentedControlLabel}>
                        Preferred Data Source
                      </ThemedText>
                      <SegmentedControl
                        values={['Primary', 'Secondary']}
                        selectedIndex={prefs.preferredDataSource === 'primary' ? 0 : 1}
                        onChange={(event) => {
                          setFeaturePreferences(feature.id, { 
                            preferredDataSource: event.nativeEvent.selectedSegmentIndex === 0 ? 'primary' : 'secondary'
                          });
                        }}
                      />
                      <ThemedText type="small" colorVariant="textSubtle" style={styles.segmentedControlDescription}>
                        {prefs.preferredDataSource === 'primary' 
                          ? 'Primary (Backend API)' 
                          : 'Secondary (🦎CoinGecko API)'}
                      </ThemedText>
                    </View>

                    {/* Enable Fallback */}
                    <View style={styles.switchRow}>
                      <View style={styles.switchLabelContainer}>
                        <ThemedText type="default">Enable Automatic Fallback</ThemedText>
                        <ThemedText type="small" colorVariant="textSubtle">
                          Automatically try other source if preferred fails
                        </ThemedText>
                      </View>
                      <Switch
                        value={prefs.enableFallback}
                        onValueChange={(value) => setFeaturePreferences(feature.id, { enableFallback: value })}
                        trackColor={{ false: switchInactiveTrack, true: switchSuccessTrack }}
                        thumbColor={prefs.enableFallback ? switchActiveThumb : switchInactiveThumb}
                      />
                    </View>
                  </>
                )}

                {/* Primary Source Blocking */}
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    <ThemedText type="default">Block Primary Source</ThemedText>
                    <ThemedText type="small" colorVariant="textSubtle">
                      Block primary/backend API calls
                    </ThemedText>
                  </View>
                  <Switch
                    value={blocking.blockPrimary}
                    onValueChange={(value) => setFeatureBlocking(feature.id, { blockPrimary: value })}
                    trackColor={{ false: switchInactiveTrack, true: switchErrorTrack }}
                    thumbColor={blocking.blockPrimary ? switchActiveThumb : switchInactiveThumb}
                  />
                </View>

                {/* Secondary Source Blocking (grayed out if not supported) */}
                <View style={[styles.switchRow, !feature.supportsSecondarySource && styles.disabledRow]}>
                  <View style={styles.switchLabelContainer}>
                    <ThemedText type="default" style={!feature.supportsSecondarySource && styles.disabledText}>
                      Block Secondary Source
                    </ThemedText>
                    <ThemedText type="small" colorVariant="textSubtle" style={!feature.supportsSecondarySource && styles.disabledText}>
                      {feature.supportsSecondarySource
                        ? 'Block secondary/🦎CoinGecko API calls'
                        : 'Secondary source not yet supported'}
                    </ThemedText>
                  </View>
                  <Switch
                    value={blocking.blockSecondary}
                    onValueChange={(value) => setFeatureBlocking(feature.id, { blockSecondary: value })}
                    trackColor={{ false: switchInactiveTrack, true: switchErrorTrack }}
                    thumbColor={blocking.blockSecondary ? switchActiveThumb : switchInactiveThumb}
                    disabled={!feature.supportsSecondarySource}
                  />
                </View>
              </BorderedSection>
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
  segmentedControlContainer: {
    marginBottom: 16,
  },
  segmentedControlLabel: {
    marginBottom: 8,
  },
  segmentedControlDescription: {
    marginTop: 8,
  },
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
});
