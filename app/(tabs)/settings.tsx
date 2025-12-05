import { BorderedSection } from '@/components/bordered-section';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CURRENCY_FLAG_URLS, SupportedCurrency } from '@/constants/currency';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePrefsStore } from '@/stores/prefsStore';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Platform, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const {
    lightDarkMode,
    fontScale,
    currency,
    compactMode,
    setLightDarkMode,
    setFontScale,
    setCurrency,
    setCompactMode,
  } = usePrefsStore();

  // Theme colors for switches
  const switchInactiveTrack = useThemeColor({}, 'icon');
  const switchTintTrack = useThemeColor({}, 'tint');
  const switchActiveThumb = useThemeColor({}, 'highlightedText');
  const switchInactiveThumb = useThemeColor({}, 'buttonSecondary');

  // All supported currencies with their full names from currency.ts comments
  const allCurrencies: SupportedCurrency[] = [
    'usd', 'eur', 'gbp', 'jpy', 'cny', 'inr', 'aud', 'cad', 'ngn', 'try',
    'brl', 'chf', 'hkd', 'krw', 'php', 'pkr', 'rub', 'zar',
  ];

  const currencyFullNames: Record<SupportedCurrency, string> = {
    usd: 'United States Dollar',
    eur: 'Euro (European Union)',
    gbp: 'British Pound (United Kingdom)',
    jpy: 'Japanese Yen',
    cny: 'Chinese Yuan',
    inr: 'Indian Rupee',
    aud: 'Australian Dollar',
    cad: 'Canadian Dollar',
    ngn: 'Nigerian Naira',
    try: 'Turkish Lira',
    brl: 'Brazilian Real',
    chf: 'Swiss Franc',
    hkd: 'Hong Kong Dollar',
    krw: 'South Korean Won',
    php: 'Philippine Peso',
    pkr: 'Pakistani Rupee',
    rub: 'Russian Ruble',
    zar: 'South African Rand',
  };

  // Theme colors for buttons
  const buttonBorder = useThemeColor({}, 'border');
  const buttonActiveBorder = useThemeColor({}, 'tint');
  
  // Helper to convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  const buttonActiveBackground = hexToRgba(buttonActiveBorder, 0.1);

  // Create styles with theme colors
  const dynamicStyles = StyleSheet.create({
    button: {
      ...styles.button,
      borderColor: buttonBorder,
    },
    buttonActive: {
      ...styles.buttonActive,
      backgroundColor: buttonActiveBackground,
      borderColor: buttonActiveBorder,
    },
  });

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Settings
        </ThemedText>

        {/* Compact Mode */}
        <BorderedSection>
          <View style={styles.switchRow}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Compact Mode
            </ThemedText>
            <Switch
              value={compactMode}
              onValueChange={setCompactMode}
              trackColor={{ false: switchInactiveTrack, true: switchTintTrack }}
              thumbColor={compactMode ? switchActiveThumb : switchInactiveThumb}
            />
          </View>
          <ThemedText type="small" colorVariant="textSubtle">
            Reduce spacing and padding for a more compact layout
          </ThemedText>
        </BorderedSection>

        {/* Light/Dark Mode */}
        <BorderedSection>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Theme Mode
          </ThemedText>
          <View style={styles.buttonRow}>
            {(['system', 'light', 'dark'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  dynamicStyles.button,
                  lightDarkMode === mode && dynamicStyles.buttonActive,
                ]}
                onPress={() => setLightDarkMode(mode)}
              >
                <ThemedText
                  type="defaultSemiBold"
                  colorVariant={lightDarkMode === mode ? 'text' : 'textSubtle'}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </BorderedSection>

        {/* Font Scale */}
        <BorderedSection>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Font Scale: {fontScale.toFixed(1)}x
          </ThemedText>
          <View style={styles.buttonRow}>
            {[0.75, 0.875, 1.0, 1.125, 1.25, 1.5].map((scale) => (
              <TouchableOpacity
                key={scale}
                style={[
                  dynamicStyles.button,
                  Math.abs(fontScale - scale) < 0.01 && dynamicStyles.buttonActive,
                ]}
                onPress={() => setFontScale(scale)}
              >
                <ThemedText
                  type="defaultSemiBold"
                  colorVariant={Math.abs(fontScale - scale) < 0.01 ? 'text' : 'textSubtle'}
                >
                  {scale}x
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </BorderedSection>

        {/* Currency */}
        <BorderedSection>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Currency
          </ThemedText>
          <View style={styles.buttonRow}>
            {allCurrencies.map((curr) => {
              const flagUrl = CURRENCY_FLAG_URLS[curr];
              return (
                <TouchableOpacity
                  key={curr}
                  style={[
                    dynamicStyles.button,
                    currency === curr && dynamicStyles.buttonActive,
                  ]}
                  onPress={() => setCurrency(curr)}
                >
                  {flagUrl && (
                    <View style={[
                      styles.flagBackground,
                      Platform.OS === 'web' ? styles.flagBackgroundDesktop : styles.flagBackgroundMobile
                    ]}>
                      <Image
                        source={{ uri: flagUrl }}
                        style={[
                          styles.flagImage,
                          Platform.OS === 'web' ? styles.flagImageDesktop : styles.flagImageMobile
                        ]}
                        contentFit="contain"
                      />
                    </View>
                  )}
                  <View style={styles.buttonContent}>
                    <ThemedText
                      type="defaultSemiBold"
                      colorVariant={currency === curr ? 'text' : 'textSubtle'}
                    >
                      {curr.toUpperCase()}
                    </ThemedText>
                    <ThemedText
                      type="xsmall"
                      colorVariant="textSubtle"
                      style={styles.currencyFullName}
                    >
                      {currencyFullNames[curr]}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BorderedSection>

        {/* API Configuration Link */}
        <BorderedSection>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            API Configuration
          </ThemedText>
          <Link href="/config" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <ThemedText type="link">Configure API Blocking</ThemedText>
            </TouchableOpacity>
          </Link>
          <ThemedText type="small" colorVariant="textSubtle">
            Block API calls on a per-feature basis
          </ThemedText>
        </BorderedSection>
      </ThemedView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: Platform.OS === 'web' ? 60 : 100,
    flex: 1,
    alignItems: 'center',
  },
  buttonActive: {
    // Colors will be set dynamically using theme colors
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  currencyFullName: {
    marginTop: 2,
    textAlign: 'center',
  },
  flagBackground: {
    position: 'absolute',
  },
  flagBackgroundDesktop: {
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  flagBackgroundMobile: {
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagImage: {
    // Base styles
  },
  flagImageDesktop: {
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  flagImageMobile: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  buttonContent: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
  },
});
