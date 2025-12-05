// app/coin/[id].tsx
// Coin detail screen (stubbed)

import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Pressable, TextInput, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getMockMarketData } from '@/features/lists/mockData';
import { CoinGeckoMarketData } from '@/constants/coinGecko';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCoinListsStore } from '@/features/lists/store';
import { ModalDialog } from '@/components/ModalDialog';

export default function CoinDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAllLists, updateCoinNotes } = useCoinListsStore();
  const [coinData, setCoinData] = useState<CoinGeckoMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const cardColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSubtle = useThemeColor({}, 'textSubtle');
  const highlightedText = useThemeColor({}, 'highlightedText');
  
  // Find all lists that contain this coin
  const listsWithCoin = useMemo(() => {
    if (!id) return [];
    const allLists = getAllLists();
    return allLists
      .map(list => {
        const coin = list.coins.find(c => c.coinId === id);
        return coin ? { list, coin } : null;
      })
      .filter((item): item is { list: typeof allLists[0]; coin: typeof allLists[0]['coins'][0] } => item !== null);
  }, [id, getAllLists]);

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

  const handleStartEditNotes = (listId: string, currentNotes?: string) => {
    setEditingListId(listId);
    setEditingNotes(currentNotes || '');
  };

  const handleSaveNotes = async () => {
    if (editingListId && id) {
      await updateCoinNotes(editingListId, id, editingNotes);
      setEditingListId(null);
      setEditingNotes('');
    }
  };

  const handleDeleteNote = async () => {
    if (noteToDelete && id) {
      await updateCoinNotes(noteToDelete, id, '');
      setNoteToDelete(null);
    }
  };

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

        {/* Coin Notes Section */}
        {listsWithCoin.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Notes by List
            </ThemedText>
            {listsWithCoin.map(({ list, coin }) => {
              const isEditing = editingListId === list.id;
              
              return (
                <ThemedView
                  key={list.id}
                  style={[styles.noteCard, { backgroundColor: cardColor, borderColor }]}
                >
                  <ThemedText type="defaultSemiBold" style={styles.listName}>
                    {list.name}
                  </ThemedText>
                  
                  {!isEditing ? (
                    <Pressable onPress={() => handleStartEditNotes(list.id, coin.notes)}>
                      {coin.notes ? (
                        <ThemedText style={styles.noteText}>{coin.notes}</ThemedText>
                      ) : (
                        <ThemedText style={styles.notePlaceholder} colorVariant="textSubtle">
                          Tap to add notes...
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
                        placeholder="Coin notes for this list..."
                        placeholderTextColor={textSubtle}
                      />
                      <ThemedView style={styles.editButtons}>
                        <Pressable
                          onPress={() => {
                            setEditingListId(null);
                            setEditingNotes('');
                          }}
                          style={[styles.editButton, { borderColor }]}
                        >
                          <ThemedText type="small">Cancel</ThemedText>
                        </Pressable>
                        {coin.notes && (
                          <Pressable
                            onPress={() => setNoteToDelete(list.id)}
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
              );
            })}
          </ThemedView>
        )}

        <ThemedView style={[styles.note, { backgroundColor: warningColor + '1A' }]}>
          <ThemedText type="small" colorVariant="textSubtle">
            Note: This is a stubbed screen. Real API integration will be added later.
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ModalDialog
        visible={noteToDelete !== null}
        onDismiss={() => setNoteToDelete(null)}
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
  noteCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  listName: {
    marginBottom: Spacing.xs,
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
    minHeight: 80,
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

