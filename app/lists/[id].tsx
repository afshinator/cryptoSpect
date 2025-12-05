// app/lists/[id].tsx
// List detail screen

import { AlertModal } from '@/components/AlertModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Spacing } from '@/constants/theme';
import { CoinSearchModal } from '@/features/lists/components/CoinSearchModal';
import { getMockMarketData } from '@/features/lists/mockData';
import { useCoinListsStore } from '@/features/lists/store';
import { CoinListItem } from '@/features/lists/types';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput
} from 'react-native';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getList, updateList, removeCoinFromList, updateCoinNotes } = useCoinListsStore();
  const list = id ? getList(id) : undefined;

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editingCoinId, setEditingCoinId] = useState<string | null>(null);
  const [editingCoinNotes, setEditingCoinNotes] = useState('');
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
          <ThemedText>List not found</ThemedText>
        </ThemedView>
      </ScreenContainer>
    );
  }

  const handleUpdateName = async () => {
    const result = await updateList(id, { name: editedName });
    if ('error' in result) {
      if (Platform.OS === 'web') {
        Alert.alert('Error', result.error);
      } else {
        setAlertModal({
          visible: true,
          title: 'Error',
          message: result.error,
        });
      }
    } else {
      setIsEditingName(false);
      setEditedName('');
    }
  };

  const handleUpdateNotes = async () => {
    await updateList(id, { notes: editedNotes });
    setIsEditingNotes(false);
    setEditedNotes('');
  };

  const handleStartEditName = () => {
    setEditedName(list.name);
    setIsEditingName(true);
  };

  const handleStartEditNotes = () => {
    setEditedNotes(list.notes || '');
    setIsEditingNotes(true);
  };

  const handleStartEditCoinNotes = (coin: CoinListItem) => {
    setEditingCoinId(coin.coinId);
    setEditingCoinNotes(coin.notes || '');
  };

  const handleSaveCoinNotes = async () => {
    if (editingCoinId) {
      await updateCoinNotes(id, editingCoinId, editingCoinNotes);
      setEditingCoinId(null);
      setEditingCoinNotes('');
    }
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
            {!isEditingName ? (
              <Pressable onPress={handleStartEditName}>
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

            {!isEditingNotes ? (
              <Pressable onPress={handleStartEditNotes}>
                {list.notes ? (
                  <ThemedText style={styles.listNotes}>{list.notes}</ThemedText>
                ) : (
                  <ThemedText style={styles.listNotesPlaceholder} colorVariant="textSubtle">
                    Tap to add notes...
                  </ThemedText>
                )}
              </Pressable>
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

          {/* Add Coin Button */}
          <Pressable
            onPress={() => setIsSearchModalVisible(true)}
            style={[styles.addButton, { backgroundColor: tintColor }]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: highlightedText }}>
              + Add Coin
            </ThemedText>
          </Pressable>

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
                const isEditing = editingCoinId === coin.coinId;

                return (
                  <ThemedView
                    key={coin.coinId}
                    style={[styles.coinItem, { backgroundColor: cardColor, borderColor }]}
                  >
                    <Pressable
                      onPress={() => router.push(`/coin/${coin.coinId}`)}
                      style={styles.coinContent}
                    >
                      {/* Coin Image */}
                      {marketData?.image && (
                        <ThemedView style={styles.coinImageContainer}>
                          {/* TODO: Use Image component */}
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

                        {/* Coin Notes */}
                        {!isEditing ? (
                          <Pressable onPress={() => handleStartEditCoinNotes(coin)}>
                            {coin.notes ? (
                              <ThemedText type="small" colorVariant="textSubtle" style={styles.coinNotes}>
                                {coin.notes}
                              </ThemedText>
                            ) : (
                              <ThemedText
                                type="small"
                                colorVariant="textSubtle"
                                style={styles.coinNotesPlaceholder}
                              >
                                Tap to add notes...
                              </ThemedText>
                            )}
                          </Pressable>
                        ) : (
                          <ThemedView style={styles.editCoinNotesContainer}>
                            <TextInput
                              style={[
                                styles.editInput,
                                { color: textColor, borderColor },
                              ]}
                              value={editingCoinNotes}
                              onChangeText={setEditingCoinNotes}
                              autoFocus
                              placeholder="Coin notes..."
                              placeholderTextColor={textSubtle}
                            />
                            <ThemedView style={styles.editButtons}>
                              <Pressable
                                onPress={() => {
                                  setEditingCoinId(null);
                                  setEditingCoinNotes('');
                                }}
                                style={[styles.editButton, { borderColor }]}
                              >
                                <ThemedText type="small">Cancel</ThemedText>
                              </Pressable>
                              <Pressable
                                onPress={handleSaveCoinNotes}
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

                      {/* Remove Button */}
                      <Pressable
                        onPress={() => setCoinToRemove(coin.coinId)}
                        style={[styles.removeButton, { borderColor }]}
                      >
                        <ThemedText type="small" colorVariant="error">
                          Remove
                        </ThemedText>
                      </Pressable>
                    </Pressable>
                  </ThemedView>
                );
              })}
            </ThemedView>
          )}
        </ScrollView>

        {/* Modals */}
        <ConfirmationModal
          visible={coinToRemove !== null}
          onConfirm={handleRemoveCoin}
          onCancel={() => setCoinToRemove(null)}
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

        <AlertModal
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
  coinsContainer: {
    gap: Spacing.md,
  },
  coinItem: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  coinContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  coinImageContainer: {
    width: 48,
    height: 48,
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
  coinNotes: {
    marginTop: Spacing.xs,
  },
  coinNotesPlaceholder: {
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  editCoinNotesContainer: {
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  removeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});

