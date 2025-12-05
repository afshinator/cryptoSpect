// app/lists/[id].tsx
// List detail screen

import { ModalDialog } from '@/components/ModalDialog';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Spacing } from '@/constants/theme';
import { CoinSearchModal } from '@/features/lists/components/CoinSearchModal';
import { getMockMarketData } from '@/features/lists/mockData';
import { TOP20_LIST_ID } from '@/features/lists/top20List';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCoinListsStore } from '@/stores/coinListsStore';
import { useLatestStore } from '@/stores/latestStore';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { updateList, removeCoinFromList, top20List, lists } = useCoinListsStore();
  const { marketsData } = useLatestStore();
  
  // Handle special "current-top-20" virtual list
  const isTop20List = id === TOP20_LIST_ID;
  
  // Subscribe to store changes by reading from lists array
  const list = isTop20List ? top20List : (id ? lists.find(l => l.id === id) : undefined);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [coinToRemove, setCoinToRemove] = useState<string | null>(null);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const cardColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textSubtle = useThemeColor({}, 'textSubtle');
  const highlightedText = useThemeColor({}, 'highlightedText');
  const inputBackground = useThemeColor({}, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  if (!list) {
    return (
      <ScreenContainer>
        <ThemedView style={styles.container}>
          {isTop20List ? (
            <>
              <ThemedText type="subtitle">Loading market data...</ThemedText>
              <ThemedText colorVariant="textSubtle" style={styles.loadingText}>
                Market data is being fetched. Please wait.
              </ThemedText>
            </>
          ) : (
            <ThemedText>List not found</ThemedText>
          )}
        </ThemedView>
      </ScreenContainer>
    );
  }

  const handleUpdateName = async () => {
    if (!id) return;
    const result = await updateList(id, { name: editedName.trim() });
    if ('error' in result) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: result.error,
      });
    } else {
      setIsEditingName(false);
      setEditedName('');
    }
  };

  const handleStartEditName = () => {
    setEditedName(list.name);
    setIsEditingName(true);
  };

  const handleUpdateNotes = async () => {
    if (!id) return;
    await updateList(id, { notes: editedNotes });
    setIsEditingNotes(false);
    setEditedNotes('');
  };

  const handleStartEditNotes = () => {
    if (!list) return;
    setEditedNotes(list.notes || '');
    setIsEditingNotes(true);
  };

  const handleRemoveCoin = async () => {
    if (coinToRemove) {
      await removeCoinFromList(id, coinToRemove);
      setCoinToRemove(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh market data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddCoin = (coin: { coinId: string; symbol: string; name: string }) => {
    // This will be handled by the search modal
    setIsSearchModalVisible(false);
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
      <ThemedView style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            {/* List Name */}
            {!isEditingName ? (
              <Pressable onPress={isTop20List ? undefined : handleStartEditName} disabled={isTop20List}>
                <ThemedText type="title" style={styles.listName}>
                  {list.name}
                </ThemedText>
              </Pressable>
            ) : (
              <ThemedView style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: textColor, borderColor }]}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  onSubmitEditing={handleUpdateName}
                  placeholder="List name"
                  placeholderTextColor={textSubtle}
                />
                <ThemedView style={styles.editButtons}>
                  <Pressable
                    onPress={() => {
                      setIsEditingName(false);
                      setEditedName('');
                    }}
                    style={[styles.editButton, { borderColor }]}
                  >
                    <ThemedText type="small">Cancel</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleUpdateName}
                    style={[styles.editButton, { backgroundColor: tintColor }]}
                  >
                    <ThemedText type="small" style={{ color: highlightedText }}>
                      Save
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>
            )}

            <ThemedText type="small" colorVariant="textSubtle">
              {list.coins.length} {list.coins.length === 1 ? 'coin' : 'coins'}
            </ThemedText>

            {/* List Notes */}
            {!isEditingNotes ? (
              isTop20List ? (
                list.notes && (
                  <ThemedText style={styles.listNotes}>{list.notes}</ThemedText>
                )
              ) : (
                <Pressable 
                  onPress={handleStartEditNotes}
                  style={({ pressed }) => [
                    styles.notesPressable,
                    pressed && { opacity: 0.6 }
                  ]}
                >
                  {list.notes ? (
                    <ThemedText style={styles.listNotes}>{list.notes}</ThemedText>
                  ) : (
                    <ThemedText style={styles.listNotesPlaceholder} colorVariant="textSubtle">
                      Tap to add notes...
                    </ThemedText>
                  )}
                </Pressable>
              )
            ) : (
              <ThemedView style={styles.editContainer}>
                <TextInput
                  style={[
                    styles.editInput,
                    styles.editTextArea,
                    { color: textColor, borderColor },
                  ]}
                  value={editedNotes}
                  onChangeText={setEditedNotes}
                  multiline
                  autoFocus
                  placeholder="List notes..."
                  placeholderTextColor={textSubtle}
                />
                <ThemedView style={styles.editButtons}>
                  <Pressable
                    onPress={() => {
                      setIsEditingNotes(false);
                      setEditedNotes('');
                    }}
                    style={[styles.editButton, { borderColor }]}
                  >
                    <ThemedText type="small">Cancel</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleUpdateNotes}
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

          {/* Add Coin Button - hidden for top 20 list */}
          {!isTop20List && (
            <Pressable
              onPress={() => setIsSearchModalVisible(true)}
              style={[styles.addButton, { backgroundColor: tintColor }]}
            >
              <ThemedText type="defaultSemiBold" style={{ color: highlightedText }}>
                + Add Coin
              </ThemedText>
            </Pressable>
          )}

          {/* Coins List */}
          {list.coins.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="subtitle" colorVariant="textSubtle">
                No coins in this list
              </ThemedText>
              <ThemedText style={styles.emptyText} colorVariant="textSubtle">
                Tap "Add Coin" to get started
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.coinsContainer}>
              {list.coins.map((coin) => {
                const marketData = getMockMarketData(coin.coinId);
                
                // Get image from coin, or fallback to marketsData if available
                const coinImage = coin.image || marketsData?.data.find(m => m.id === coin.coinId)?.image;

                return (
                  <ThemedView
                    key={coin.coinId}
                    style={[styles.coinItem, { backgroundColor: cardColor, borderColor }]}
                  >
                    <Pressable
                      onPress={() => router.push(`/lists/${id}/coin/${coin.coinId}`)}
                      style={styles.coinContent}
                    >
                      {/* Coin Image */}
                      {coinImage ? (
                        <ThemedView style={styles.coinImageContainer}>
                          <Image
                            source={{ uri: coinImage }}
                            style={styles.coinImage}
                            contentFit="contain"
                            transition={200}
                          />
                        </ThemedView>
                      ) : (
                        <ThemedView style={styles.coinImageContainer}>
                          <ThemedView style={[styles.coinImagePlaceholder, { backgroundColor: inputBackground }]}>
                            <ThemedText type="small">{coin.symbol}</ThemedText>
                          </ThemedView>
                        </ThemedView>
                      )}

                      {/* Coin Info */}
                      <ThemedView style={styles.coinInfo}>
                        <ThemedView style={styles.coinHeader}>
                          <ThemedText type="subtitle">{coin.name}</ThemedText>
                          <ThemedText type="small" colorVariant="textSubtle">
                            {coin.symbol}
                          </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.coinPriceRow}>
                          <ThemedText type="defaultSemiBold">
                            {formatPrice(marketData?.current_price)}
                          </ThemedText>
                          <ThemedText
                            type="small"
                            style={[
                              styles.priceChange,
                              {
                                color:
                                  (marketData?.price_change_percentage_24h || 0) >= 0
                                    ? successColor
                                    : errorColor,
                              },
                            ]}
                          >
                            {formatPercentage(marketData?.price_change_percentage_24h)}
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>

                      {/* Remove Button - hidden for top 20 list */}
                      {!isTop20List && (
                        <Pressable
                          onPress={() => setCoinToRemove(coin.coinId)}
                          style={[styles.removeButton, { borderColor }]}
                        >
                          <ThemedText type="small" colorVariant="error">
                            Remove
                          </ThemedText>
                        </Pressable>
                      )}
                    </Pressable>
                  </ThemedView>
                );
              })}
            </ThemedView>
          )}
        </ScrollView>

        {/* Modals */}
        <ModalDialog
          visible={coinToRemove !== null}
          onDismiss={() => setCoinToRemove(null)}
          onConfirm={handleRemoveCoin}
          title="Remove Coin"
          message="Are you sure you want to remove this coin from the list?"
          confirmText="Remove"
          cancelText="Cancel"
          confirmStyle="danger"
        />

        <CoinSearchModal
          visible={isSearchModalVisible}
          onClose={() => setIsSearchModalVisible(false)}
          onSelectCoin={handleAddCoin}
          excludeCoinIds={list.coins.map((c) => c.coinId)}
          listId={id}
        />

        <ModalDialog
          visible={alertModal.visible}
          onDismiss={() => setAlertModal({ ...alertModal, visible: false })}
          title={alertModal.title}
          message={alertModal.message}
        />
      </ThemedView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  listName: {
    marginBottom: Spacing.xs,
  },
  notesPressable: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    minHeight: 44,
    borderRadius: BorderRadius.sm,
  },
  listNotes: {
    marginTop: Spacing.xs,
  },
  listNotesPlaceholder: {
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  editContainer: {
    gap: Spacing.sm,
  },
  editInput: {
    fontSize: 16,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  editTextArea: {
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
  addButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    marginTop: Spacing.sm,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  coinsContainer: {
    gap: Spacing.md,
  },
  coinItem: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    // marginBottom: Spacing.sm,
  },
  coinContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  coinImageContainer: {
    width: 48,
    height: 48,
  },
  coinImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  coinImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    // backgroundColor will be set dynamically
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  coinHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  coinPriceRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  priceChange: {
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});

