// app/tests/bordered-section-demo.tsx

import { BorderedSection } from '@/components/bordered-section';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ScrollView, StyleSheet } from 'react-native';

export default function BorderedSectionDemo() {
  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          BorderedSection Component
        </ThemedText>
        <ThemedText type="default" colorVariant="textSubtle" style={styles.description}>
          Visual demonstration of the BorderedSection component with all its props and variations.
        </ThemedText>

        {/* Default Section */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Default Section
        </ThemedText>
        <BorderedSection>
          <ThemedText type="default">This is a default BorderedSection with no special props.</ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Default padding: 16, default marginBottom: 24, default border and background colors from theme.
          </ThemedText>
        </BorderedSection>

        {/* Custom Padding */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Custom Padding
        </ThemedText>
        <BorderedSection padding={24}>
          <ThemedText type="default">This section has custom padding of 24.</ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Notice the increased internal spacing.
          </ThemedText>
        </BorderedSection>

        {/* Custom Margin Bottom */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Custom Margin Bottom
        </ThemedText>
        <BorderedSection marginBottom={8}>
          <ThemedText type="default">This section has a smaller marginBottom of 8.</ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Less space below this section.
          </ThemedText>
        </BorderedSection>

        {/* Background Emoji - Center */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Background Emoji - Center (Default)
        </ThemedText>
        <BorderedSection backgroundEmoji="🎨" emojiPlacement="center">
          <ThemedText type="defaultSemiBold">Section with Center Emoji</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            This section has a background emoji centered behind the content.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Default opacity: 0.1, default size: 120px, default placement: center
          </ThemedText>
        </BorderedSection>

        {/* Background Emoji - Upper Right */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Background Emoji - Upper Right
        </ThemedText>
        <BorderedSection 
          backgroundEmoji="✨" 
          emojiPlacement="upperRight"
          emojiOpacity={0.15}
        >
          <ThemedText type="defaultSemiBold">Section with Upper Right Emoji</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            This section has a background emoji in the upper right corner.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Opacity: 0.15, placement: upperRight
          </ThemedText>
        </BorderedSection>

        {/* Custom Emoji Size */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Custom Emoji Size
        </ThemedText>
        <BorderedSection 
          backgroundEmoji="🔥" 
          emojiSize={60}
          emojiOpacity={0.2}
          emojiPlacement="upperRight"
        >
          <ThemedText type="defaultSemiBold">Small Emoji - Upper Right (60px)</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            Small emoji (60px) placed in the upper right corner.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Size: 60px, placement: upperRight, opacity: 0.2
          </ThemedText>
        </BorderedSection>

        <BorderedSection 
          backgroundEmoji="🔥" 
          emojiSize={80}
          emojiOpacity={0.2}
          emojiPlacement="center"
        >
          <ThemedText type="defaultSemiBold">Smaller Emoji - Center (80px)</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            This section has a smaller background emoji (80px instead of default 120px) centered.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Size: 80px, placement: center, opacity: 0.2
          </ThemedText>
        </BorderedSection>

        <BorderedSection 
          backgroundEmoji="💎" 
          emojiSize={100}
          emojiOpacity={0.15}
          emojiPlacement="upperRight"
        >
          <ThemedText type="defaultSemiBold">Medium Emoji - Upper Right (100px)</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            Medium-sized emoji (100px) in the upper right corner.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Size: 100px, placement: upperRight, opacity: 0.15
          </ThemedText>
        </BorderedSection>

        <BorderedSection 
          backgroundEmoji="💎" 
          emojiSize={160}
          emojiOpacity={0.12}
          emojiPlacement="center"
        >
          <ThemedText type="defaultSemiBold">Larger Emoji - Center (160px)</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            This section has a larger background emoji (160px instead of default 120px) centered.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Size: 160px, placement: center, opacity: 0.12
          </ThemedText>
        </BorderedSection>

        <BorderedSection 
          backgroundEmoji="🌟" 
          emojiSize={200}
          emojiOpacity={0.1}
          emojiPlacement="center"
        >
          <ThemedText type="defaultSemiBold">Extra Large Emoji - Center (200px)</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            Extra large emoji (200px) centered behind the content.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Size: 200px, placement: center, opacity: 0.1
          </ThemedText>
        </BorderedSection>

        {/* Different Opacity Levels */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Different Opacity Levels
        </ThemedText>
        <BorderedSection 
          backgroundEmoji="🌟" 
          emojiOpacity={0.05}
        >
          <ThemedText type="defaultSemiBold">Very Subtle (0.05)</ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Very subtle background emoji
          </ThemedText>
        </BorderedSection>

        <BorderedSection 
          backgroundEmoji="⭐" 
          emojiOpacity={0.25}
        >
          <ThemedText type="defaultSemiBold">More Visible (0.25)</ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            More visible background emoji
          </ThemedText>
        </BorderedSection>

        {/* Custom Background Colors */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Custom Background Colors
        </ThemedText>
        <BorderedSection 
          backgroundColor={{ light: '#F0F8FF', dark: '#1A1F2E' }}
          backgroundEmoji="🎨"
          emojiOpacity={0.15}
        >
          <ThemedText type="defaultSemiBold">Light Blue Background (Light) / Dark Blue (Dark)</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            This section has a custom background color that adapts to light and dark mode.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Light mode: #F0F8FF (Alice Blue), Dark mode: #1A1F2E (Dark Blue)
          </ThemedText>
        </BorderedSection>

        <BorderedSection 
          backgroundColor={{ light: '#FFF5E6', dark: '#2E2419' }}
          backgroundEmoji="🌅"
          emojiPlacement="upperRight"
          emojiOpacity={0.12}
        >
          <ThemedText type="defaultSemiBold">Warm Background (Light) / Dark Brown (Dark)</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            Another example with warm tones in light mode and dark brown in dark mode.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Light mode: #FFF5E6 (Warm White), Dark mode: #2E2419 (Dark Brown)
          </ThemedText>
        </BorderedSection>

        <BorderedSection 
          backgroundColor={{ light: '#F5F5DC', dark: '#2A2A1E' }}
          backgroundEmoji="🌿"
          emojiSize={90}
          emojiPlacement="upperRight"
          emojiOpacity={0.18}
        >
          <ThemedText type="defaultSemiBold">Beige Background (Light) / Dark Olive (Dark)</ThemedText>
          <ThemedText type="default" style={styles.marginTop}>
            Custom background with a smaller emoji in the upper right corner.
          </ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Light mode: #F5F5DC (Beige), Dark mode: #2A2A1E (Dark Olive), Size: 90px, upperRight
          </ThemedText>
        </BorderedSection>

        {/* Real-world Examples */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Real-world Examples
        </ThemedText>
        <BorderedSection 
          backgroundEmoji="⚡" 
          emojiPlacement="upperRight"
          emojiOpacity={0.15}
        >
          <ThemedText type="defaultSemiBold">Current Volatility</ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Fetches and displays current cryptocurrency market volatility data
          </ThemedText>
        </BorderedSection>

        <BorderedSection 
          backgroundEmoji="💪" 
          emojiPlacement="upperRight"
          emojiOpacity={0.15}
        >
          <ThemedText type="defaultSemiBold">Current Dominance</ThemedText>
          <ThemedText type="small" colorVariant="textSubtle" style={styles.marginTop}>
            Fetches and displays current cryptocurrency market dominance data (BTC, ETH, stablecoins, others)
          </ThemedText>
        </BorderedSection>

        {/* Multiple Emojis */}
        <ThemedText type="subtitle" style={styles.sectionHeader}>
          Different Emoji Examples
        </ThemedText>
        <BorderedSection backgroundEmoji="🚀" emojiPlacement="center" emojiOpacity={0.1} emojiSize={60}>
          <ThemedText type="default">Rocket emoji</ThemedText>
        </BorderedSection>
        <BorderedSection backgroundEmoji="🎯" emojiPlacement="upperRight" emojiOpacity={0.15} emojiSize={60}>
          <ThemedText type="default">Target emoji</ThemedText>
        </BorderedSection>
        <BorderedSection backgroundEmoji="💡" emojiPlacement="center" emojiOpacity={0.12} emojiSize={60}>
          <ThemedText type="default">Lightbulb emoji</ThemedText>
        </BorderedSection>

        <ThemedView style={styles.bottomSpacer} />
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  marginTop: {
    marginTop: Spacing.xs,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});

