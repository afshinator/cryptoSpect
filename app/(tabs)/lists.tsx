// app/(tabs)/lists.tsx
// Main lists management screen

import { useRouter } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ModalDialog } from '@/components/ModalDialog';
import { useCoinListsStore } from '@/features/lists/store';
import { generateCsv, downloadCsvFile, exportCsvFileMobile, parseCsv } from '@/features/lists/utils';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ListsScreen() {
  const router = useRouter();
  const { lists, createList, deleteList, _hasHydrated, top20List } = useCoinListsStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [listToDelete, setListToDelete] = useState<string | null>(null);
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
  const textColor = useThemeColor({}, 'text');

  // Wait for hydration
  if (!_hasHydrated) {
    return (
      <ScreenContainer>
        <ThemedView style={styles.container}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      </ScreenContainer>
    );
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      return;
    }

    const result = await createList(newListName.trim());
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
      setNewListName('');
      setIsCreating(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    await deleteList(listId);
    setListToDelete(null);
  };

  const handleExport = async () => {
    try {
      const csv = generateCsv(lists);
      if (Platform.OS === 'web') {
        downloadCsvFile(csv);
      } else {
        await exportCsvFileMobile(csv);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to export';
      if (Platform.OS === 'web') {
        Alert.alert('Error', errorMsg);
      } else {
        setAlertModal({
          visible: true,
          title: 'Error',
          message: errorMsg,
        });
      }
    }
  };

  const handleImport = async () => {
    try {
      let fileContent: string;

      if (Platform.OS === 'web') {
        // Web: Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const text = await file.text();
          const importedLists = parseCsv(text);
          // TODO: Handle import preview and merge logic
          console.log('Imported lists:', importedLists);
        };
        input.click();
        return;
      } else {
        // Mobile: Stub for now - will implement when expo-document-picker is available
        if (Platform.OS === 'web') {
          return;
        }
        console.warn('Mobile CSV import not yet implemented. Please install expo-document-picker.');
        if (Platform.OS === 'web') {
          Alert.alert('Error', 'Mobile CSV import not yet implemented');
        } else {
          setAlertModal({
            visible: true,
            title: 'Error',
            message: 'Mobile CSV import not yet implemented',
          });
        }
        return;
      }

      const importedLists = parseCsv(fileContent);
      // TODO: Handle import preview and merge logic
      console.log('Imported lists:', importedLists);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to import';
      if (Platform.OS === 'web') {
        Alert.alert('Error', errorMsg);
      } else {
        setAlertModal({
          visible: true,
          title: 'Error',
          message: errorMsg,
        });
      }
    }
  };

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Coin Lists
          </ThemedText>
          <ThemedView style={styles.headerButtons}>
            <Pressable
              onPress={handleExport}
              style={[styles.headerButton, { borderColor }]}
            >
              <ThemedText type="small">Export</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleImport}
              style={[styles.headerButton, { borderColor }]}
            >
              <ThemedText type="small">Import</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        {!isCreating && (
          <Pressable
            onPress={() => setIsCreating(true)}
            style={[styles.createButton, { backgroundColor: tintColor }]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: highlightedText }}>
              + Create List
            </ThemedText>
          </Pressable>
        )}

        {isCreating && (
          <ThemedView style={[styles.createInputContainer, { borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="List name"
              placeholderTextColor={textSubtle}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
              onSubmitEditing={handleCreateList}
            />
            <ThemedView style={styles.createButtons}>
              <Pressable
                onPress={() => {
                  setIsCreating(false);
                  setNewListName('');
                }}
                style={[styles.cancelButton, { borderColor }]}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleCreateList}
                style={[styles.createConfirmButton, { backgroundColor: tintColor }]}
              >
                <ThemedText type="defaultSemiBold" style={{ color: highlightedText }}>
                  Create
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={styles.listsContainer}>
          {/* Always show "Current top 20" list first */}
          <Pressable
            onPress={() => {
              if (top20List) {
                router.push(`/lists/${top20List.id}`);
              }
            }}
            disabled={!top20List}
            style={[
              styles.listItem,
              { backgroundColor: cardColor, borderColor },
              !top20List && styles.listItemDisabled,
            ]}
          >
            <ThemedView style={styles.listItemContent}>
              <ThemedView style={styles.listItemHeader}>
                <ThemedView style={styles.listNameRow}>
                  <ThemedText type="subtitle" style={styles.listName}>
                    Current top 20
                  </ThemedText>
                  {!top20List && (
                    <ActivityIndicator
                      size="small"
                      color={tintColor}
                      style={styles.spinner}
                    />
                  )}
                </ThemedView>
                <ThemedText type="small" colorVariant="textSubtle">
                  {top20List ? (
                    `${top20List.coins.length} ${top20List.coins.length === 1 ? 'coin' : 'coins'}`
                  ) : (
                    'Loading...'
                  )}
                </ThemedText>
              </ThemedView>
              <ThemedText type="small" colorVariant="textSubtle" style={styles.listNotes}>
                Top 20 cryptocurrencies by market cap
              </ThemedText>
            </ThemedView>
          </Pressable>

          {/* User-created lists */}
          {lists.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                No custom lists yet
              </ThemedText>
              <ThemedText style={styles.emptyText} colorVariant="textSubtle">
                Create your first list to start organizing coins
              </ThemedText>
            </ThemedView>
          ) : (
            lists.map((list) => (
              <Pressable
                key={list.id}
                onPress={() => router.push(`/lists/${list.id}`)}
                onLongPress={() => setListToDelete(list.id)}
                style={[styles.listItem, { backgroundColor: cardColor, borderColor }]}
              >
                <ThemedView style={styles.listItemContent}>
                  <ThemedView style={styles.listItemHeader}>
                    <ThemedText type="subtitle" style={styles.listName}>
                      {list.name}
                    </ThemedText>
                    <ThemedText type="small" colorVariant="textSubtle">
                      {list.coins.length} {list.coins.length === 1 ? 'coin' : 'coins'}
                    </ThemedText>
                  </ThemedView>
                  {list.notes && (
                    <ThemedText type="small" colorVariant="textSubtle" style={styles.listNotes}>
                      {list.notes.length > 100 ? `${list.notes.substring(0, 100)}...` : list.notes}
                    </ThemedText>
                  )}
                  {/* TODO: Add coin icon preview */}
                </ThemedView>
              </Pressable>
            ))
          )}
        </ThemedView>

        <ModalDialog
          visible={listToDelete !== null}
          onDismiss={() => setListToDelete(null)}
          onConfirm={() => listToDelete && handleDeleteList(listToDelete)}
          title="Delete List"
          message="Are you sure you want to delete this list? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmStyle="danger"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  createButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  createInputContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  input: {
    fontSize: 16,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  createButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  createConfirmButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
  listsContainer: {
    gap: Spacing.md,
  },
  listItem: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listItemContent: {
    gap: Spacing.xs,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listName: {
    flex: 1,
  },
  listNameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spinner: {
    marginLeft: Spacing.xs,
  },
  listItemDisabled: {
    opacity: 0.6,
  },
  listNotes: {
    marginTop: Spacing.xs,
  },
});

