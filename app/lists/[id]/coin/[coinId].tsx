// app/lists/[id]/coin/[coinId].tsx
// List-specific coin detail screen

import { ModalDialog } from '@/components/ModalDialog';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useCoinListsStore } from '@/features/lists/store';
import { TOP20_LIST_ID } from '@/features/lists/top20List';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLatestStore } from '@/stores/latestStore';
import { usePrefsStore } from '@/stores/prefsStore';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

export default function ListCoinDetailScreen() {
  const { id: listId, coinId } = useLocalSearchParams<{ id: string; coinId: string }>();
  const router = useRouter();
  const { updateCoinNotes, top20List, lists } = useCoinListsStore();
  const { marketsData } = useLatestStore();
  const { currency } = usePrefsStore();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(false);
  
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const cardColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSubtle = useThemeColor({}, 'textSubtle');
  const highlightedText = useThemeColor({}, 'highlightedText');
  const inputBackground = useThemeColor({}, 'inputBackground');
  
  // Get the list (handle top 20 list) - subscribe to store changes
  const isTop20List = listId === TOP20_LIST_ID;
  const list = isTop20List ? top20List : (listId ? lists.find(l => l.id === listId) : undefined);
  
  // Find the coin in this specific list
  const coin = useMemo(() => {
    if (!list || !coinId) return null;
    return list.coins.find(c => c.coinId === coinId) || null;
  }, [list, coinId]);
  
  // Get market data for this coin from marketsData
  const coinData = useMemo(() => {
    if (!coinId || !marketsData?.data) return null;
    return marketsData.data.find(c => c.id === coinId) || null;
  }, [coinId, marketsData]);
  
  const handleStartEditNotes = () => {
    setEditingNotes(coin?.notes || '');
    setIsEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (listId && coinId) {
      await updateCoinNotes(listId, coinId, editingNotes);
      setIsEditingNotes(false);
      setEditingNotes('');
    }
  };

  const handleDeleteNote = async () => {
    if (listId && coinId) {
      await updateCoinNotes(listId, coinId, '');
      setNoteToDelete(false);
    }
  };

  if (!list || !coin) {
    return (
      <ScreenContainer>
        <ThemedView style={styles.container}>
          <ThemedText type="subtitle">Coin not found in this list</ThemedText>
          <ThemedText colorVariant="textSubtle">
            Unable to find coin: {coinId} in list: {listId}
          </ThemedText>
        </ThemedView>
      </ScreenContainer>
    );
  }

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <ScreenContainer>
      <ScrollView>
        <ThemedView style={styles.container}>
          {/* Coin Header */}
          <ThemedView style={styles.header}>
            {coin.image ? (
              <Image
                source={{ uri: coin.image }}
                style={styles.coinImage}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <ThemedView style={[styles.coinImagePlaceholder, { backgroundColor: inputBackground }]}>
                <ThemedText type="subtitle">{coin.symbol}</ThemedText>
              </ThemedView>
            )}
            <ThemedText type="title">{coin.name}</ThemedText>
            <ThemedText type="subtitle" colorVariant="textSubtle">
              {coin.symbol}
            </ThemedText>
          </ThemedView>

          {/* Market Data Section */}
          {coinData ? (
            <>
              <ThemedView style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Price Information
                </ThemedText>
                <ThemedView style={styles.infoRow}>
                  <ThemedText>Current Price:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {formatPrice(coinData.current_price)}
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
                    {formatPercentage(coinData.price_change_percentage_24h)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Market Data
                </ThemedText>
                <ThemedView style={styles.infoRow}>
                  <ThemedText>Market Cap:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {coinData.market_cap ? formatPrice(coinData.market_cap) : 'N/A'}
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
                    {coinData.total_volume ? formatPrice(coinData.total_volume) : 'N/A'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Price Range (24h)
                </ThemedText>
                <ThemedView style={styles.infoRow}>
                  <ThemedText>High:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {formatPrice(coinData.high_24h)}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoRow}>
                  <ThemedText>Low:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {formatPrice(coinData.low_24h)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </>
          ) : (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <ThemedText style={styles.loadingText} colorVariant="textSubtle">
                Loading market data...
              </ThemedText>
            </ThemedView>
          )}

          {/* Coin Notes Section - List Specific */}
          <ThemedView style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Notes 
            </ThemedText>
            
            {!isEditingNotes ? (
              <Pressable onPress={handleStartEditNotes}>
                {coin.notes ? (
                  <ThemedText style={styles.noteText}>{coin.notes}</ThemedText>
                ) : (
                  <ThemedText style={styles.notePlaceholder} colorVariant="textSubtle">
                    Tap to add notes for this coin in {list.name}...
                  </ThemedText>
                )}
              </Pressable>
            ) : (
              <ThemedView style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: textColor, borderColor }]}
                  value={editingNotes}
                  onChangeText={setEditingNotes}
                  autoFocus
                  multiline
                  placeholder={`Notes for ${coin.name} in ${list.name}...`}
                  placeholderTextColor={textSubtle}
                />
                <ThemedView style={styles.editButtons}>
                  <Pressable
                    onPress={() => {
                      setIsEditingNotes(false);
                      setEditingNotes('');
                    }}
                    style={[styles.editButton, { borderColor }]}
                  >
                    <ThemedText type="small">Cancel</ThemedText>
                  </Pressable>
                  {coin.notes && (
                    <Pressable
                      onPress={() => setNoteToDelete(true)}
                      style={[styles.editButton, { borderColor: errorColor }]}
                    >
                      <ThemedText type="small" style={{ color: errorColor }}>
                        Delete
                      </ThemedText>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={handleSaveNotes}
                    style={[styles.editButton, { backgroundColor: tintColor }]}
                  >
                    <ThemedText type="small" style={{ color: highlightedText }}>
                      Save
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <ModalDialog
        visible={noteToDelete}
        onDismiss={() => setNoteToDelete(false)}
        onConfirm={handleDeleteNote}
        title="Delete Note"
        message="Are you sure you want to delete this note?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  coinImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  coinImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  loadingText: {
    marginTop: Spacing.sm,
  },
  section: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
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
  noteText: {
    marginTop: Spacing.xs,
  },
  notePlaceholder: {
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  editContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  editInput: {
    fontSize: 16,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});

