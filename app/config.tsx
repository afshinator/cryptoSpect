// app/config.tsx
// API Blocking Configuration Screen

import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllFeatures, DataSource } from '@/constants/features';
import { useApiBlockingStore, getEffectivePreferences } from '@/stores/apiBlockingStore';
import { StyleSheet, Switch, View, TouchableOpacity } from 'react-native';

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

  const toggleDataSource = (current: DataSource): DataSource => {
    return current === 'primary' ? 'secondary' : 'primary';
  };

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          API Configuration
        </ThemedText>

        {/* Global Data Source Preferences */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Global Data Source Preferences
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.sectionDescription}>
            Default settings for all features (can be overridden per feature)
          </ThemedText>

          {/* Preferred Data Source */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <ThemedText type="default">Preferred Data Source</ThemedText>
              <ThemedText type="small" colorVariant="textSubtle">
                {globalPreferences.preferredDataSource === 'primary' 
                  ? 'Primary (Backend API)' 
                  : 'Secondary (CoinGecko API)'}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setGlobalPreferences({ 
                preferredDataSource: toggleDataSource(globalPreferences.preferredDataSource) 
              })}
            >
              <ThemedText type="defaultSemiBold">
                {globalPreferences.preferredDataSource === 'primary' ? 'Primary' : 'Secondary'}
              </ThemedText>
            </TouchableOpacity>
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
              trackColor={{ false: '#767577', true: '#4caf50' }}
              thumbColor={globalPreferences.enableFallback ? '#fff' : '#f4f3f4'}
            />
          </View>
        </ThemedView>

        {/* Global API Blocking */}
        <ThemedView style={styles.section}>
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

            return (
              <ThemedView key={feature.id} style={styles.featureSection}>
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
                    trackColor={{ false: '#767577', true: '#4caf50' }}
                    thumbColor={prefs.useGlobalPreferences ? '#fff' : '#f4f3f4'}
                  />
                </View>

                {/* Feature-Specific Preferences (shown when not using global) */}
                {!prefs.useGlobalPreferences && (
                  <>
                    {/* Preferred Data Source */}
                    <View style={styles.switchRow}>
                      <View style={styles.switchLabelContainer}>
                        <ThemedText type="default">Preferred Data Source</ThemedText>
                        <ThemedText type="small" colorVariant="textSubtle">
                          {prefs.preferredDataSource === 'primary' 
                            ? 'Primary (Backend API)' 
                            : 'Secondary (CoinGecko API)'}
                        </ThemedText>
                      </View>
                      <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setFeaturePreferences(feature.id, { 
                          preferredDataSource: toggleDataSource(prefs.preferredDataSource) 
                        })}
                      >
                        <ThemedText type="defaultSemiBold">
                          {prefs.preferredDataSource === 'primary' ? 'Primary' : 'Secondary'}
                        </ThemedText>
                      </TouchableOpacity>
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
                        trackColor={{ false: '#767577', true: '#4caf50' }}
                        thumbColor={prefs.enableFallback ? '#fff' : '#f4f3f4'}
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
                    trackColor={{ false: '#767577', true: '#d32f2f' }}
                    thumbColor={blocking.blockPrimary ? '#fff' : '#f4f3f4'}
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
                        ? 'Block secondary/CoinGecko API calls'
                        : 'Secondary source not yet supported'}
                    </ThemedText>
                  </View>
                  <Switch
                    value={blocking.blockSecondary}
                    onValueChange={(value) => setFeatureBlocking(feature.id, { blockSecondary: value })}
                    trackColor={{ false: '#767577', true: '#d32f2f' }}
                    thumbColor={blocking.blockSecondary ? '#fff' : '#f4f3f4'}
                    disabled={!feature.supportsSecondarySource}
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
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    minWidth: 100,
    alignItems: 'center',
  },
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
});
