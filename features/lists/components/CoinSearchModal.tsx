// features/lists/components/CoinSearchModal.tsx
// Search modal for adding coins to a list

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCoinListsStore } from '../store';
import { MODAL_FOCUS_DELAY_IOS_MS, MODAL_FOCUS_DELAY_ANDROID_MS, MAX_SEARCH_RESULTS } from '../constants';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CoinGeckoMarketData } from '@/constants/coinGecko';
import { getMockMarketData, MOCK_MARKET_DATA } from '../mockData';

interface CoinSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCoin: (coin: { coinId: string; symbol: string; name: string }) => void;
  excludeCoinIds?: string[];
  listId: string;
}

interface SearchResult {
  coinId: string;
  symbol: string;
  name: string;
  marketData?: CoinGeckoMarketData;
  priority?: number;
}

export function CoinSearchModal({
  visible,
  onClose,
  onSelectCoin,
  excludeCoinIds = [],
  listId,
}: CoinSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { addCoinToList } = useCoinListsStore();

  const cardColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const textSubtle = useThemeColor({}, 'textSubtle');
  const overlayColor = useThemeColor({}, 'overlay');

  // Auto-focus input when modal opens
  useEffect(() => {
    if (visible) {
      const delay = Platform.OS === 'ios' ? MODAL_FOCUS_DELAY_IOS_MS : MODAL_FOCUS_DELAY_ANDROID_MS;
      setTimeout(() => {
        inputRef.current?.focus();
      }, delay);
    } else {
      // Dismiss keyboard when modal closes
      setTimeout(() => {
        Keyboard.dismiss();
        inputRef.current?.blur();
      }, 0);
    }
  }, [visible]);

  // Perform search
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Debounce search (simple timeout for now)
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchQuery, visible, excludeCoinIds]);

  const performSearch = (query: string) => {
    // Mock search - search through mock market data
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const [coinId, marketData] of Object.entries(MOCK_MARKET_DATA)) {
      // Skip excluded coins
      if (excludeCoinIds.includes(coinId)) {
        continue;
      }

      const symbol = marketData.symbol.toUpperCase();
      const name = marketData.name;

      // Priority matching
      let priority = 0;
      if (symbol.toLowerCase().startsWith(queryLower)) {
        priority = 1;
      } else if (name.toLowerCase().startsWith(queryLower)) {
        priority = 2;
      } else if (symbol.toLowerCase().includes(queryLower)) {
        priority = 3;
      } else if (name.toLowerCase().includes(queryLower)) {
        priority = 4;
      } else {
        continue; // No match
      }

      results.push({
        coinId,
        symbol,
        name,
        marketData,
        priority,
      });
    }

    // Sort by priority, then alphabetically
    results.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.name.localeCompare(b.name);
    });

    setSearchResults(results.slice(0, MAX_SEARCH_RESULTS));
    setIsSearching(false);
  };

  const handleSelectCoin = async (coin: SearchResult) => {
    // Check if coin already exists in list
    const list = useCoinListsStore.getState().getList(listId);
    if (list?.coins.some((c) => c.coinId === coin.coinId)) {
      // Coin already exists - prevent adding
      return;
    }

    const result = await addCoinToList(listId, {
      coinId: coin.coinId,
      symbol: coin.symbol,
      name: coin.name,
    });

    if (!('error' in result)) {
      onSelectCoin(coin);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        style={styles.container}
      >
        <Pressable style={[styles.backdrop, { backgroundColor: overlayColor }]} onPress={onClose}>
          <ThemedView />
        </Pressable>

        <ThemedView
          style={[
            styles.modalContent,
            {
              backgroundColor: cardColor,
              paddingTop: Platform.OS === 'ios' ? 60 : 40,
            },
          ]}
        >
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Add Coin</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText type="subtitle" colorVariant="tint">
                Close
              </ThemedText>
            </Pressable>
          </ThemedView>

          {/* Search Input */}
          <TextInput
            ref={inputRef}
            style={[
              styles.searchInput,
              {
                color: useThemeColor({}, 'text'),
                borderColor,
                backgroundColor: useThemeColor({}, 'inputBackground'),
              },
            ]}
            placeholder="Search by name or symbol..."
            placeholderTextColor={textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Search Results */}
          <ThemedView style={styles.resultsContainer}>
            {isSearching ? (
              <ThemedView style={styles.loadingContainer}>
                <ThemedText colorVariant="textSubtle">Searching...</ThemedText>
              </ThemedView>
            ) : searchResults.length === 0 && searchQuery.trim() ? (
              <ThemedView style={styles.loadingContainer}>
                <ThemedText colorVariant="textSubtle">No results found</ThemedText>
              </ThemedView>
            ) : searchResults.length === 0 ? (
              <ThemedView style={styles.loadingContainer}>
                <ThemedText colorVariant="textSubtle">Start typing to search...</ThemedText>
              </ThemedView>
            ) : (
              searchResults.map((coin) => {
                const alreadyInList = excludeCoinIds.includes(coin.coinId);
                return (
                  <Pressable
                    key={coin.coinId}
                    onPress={() => !alreadyInList && handleSelectCoin(coin)}
                    disabled={alreadyInList}
                    style={[
                      styles.resultItem,
                      { borderColor, backgroundColor: cardColor },
                      alreadyInList && styles.resultItemDisabled,
                    ]}
                  >
                    <ThemedView style={styles.resultItemContent}>
                      <ThemedView style={styles.resultItemInfo}>
                        <ThemedText type="defaultSemiBold">{coin.name}</ThemedText>
                        <ThemedText type="small" colorVariant="textSubtle">
                          {coin.symbol}
                        </ThemedText>
                      </ThemedView>
                      {alreadyInList && (
                        <ThemedText type="small" colorVariant="textSubtle">
                          Already in list
                        </ThemedText>
                      )}
                    </ThemedView>
                  </Pressable>
                );
              })
            )}
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor will be set dynamically
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  searchInput: {
    fontSize: 16,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  resultItem: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resultItemDisabled: {
    opacity: 0.5,
  },
  resultItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultItemInfo: {
    gap: Spacing.xs,
  },
});

