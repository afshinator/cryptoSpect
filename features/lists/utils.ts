// features/lists/utils.ts
// Utility functions for coin lists (CSV import/export, mock data, etc.)

import { Platform } from 'react-native';
import { CSV_HEADERS } from './constants';
import { CoinList, CoinListItem } from './types';

/**
 * Format date to human-readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Escape CSV field (handles quotes and commas)
 */
function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Export all lists to CSV format
 */
export function generateCsv(lists: CoinList[]): string {
  const rows: string[] = [CSV_HEADERS.join(',')];

  for (const list of lists) {
    const listName = escapeCsvField(list.name);
    const listNotes = escapeCsvField(list.notes || '');

    if (list.coins.length === 0) {
      // Empty list - include metadata only
      rows.push(
        [
          listName,
          listNotes,
          '', // Coin ID
          '', // Symbol
          '', // Name
          '', // Coin Notes
          '', // Currency
          '', // Added At
        ].join(',')
      );
    } else {
      // Add each coin as a row
      list.coins.forEach((coin, index) => {
        rows.push(
          [
            index === 0 ? listName : '', // List name only in first row
            index === 0 ? listNotes : '', // List notes only in first row
            escapeCsvField(coin.coinId),
            escapeCsvField(coin.symbol),
            escapeCsvField(coin.name),
            escapeCsvField(coin.notes || ''),
            escapeCsvField(coin.vsCurrency),
            escapeCsvField(formatDate(coin.addedAt)),
          ].join(',')
        );
      });
    }
  }

  return rows.join('\n');
}

/**
 * Download CSV file (Web)
 */
export function downloadCsvFile(csvContent: string, filename: string = 'coinlists.csv'): void {
  if (Platform.OS !== 'web') {
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export CSV file (Mobile)
 * TODO: Implement when expo-file-system and expo-sharing are available
 */
export async function exportCsvFileMobile(csvContent: string, filename: string = 'coinlists.csv'): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  // Stub: Mobile export will be implemented when packages are available
  console.warn('Mobile CSV export not yet implemented. Please install expo-file-system and expo-sharing.');
  throw new Error('Mobile CSV export not yet implemented');
}

/**
 * Parse CSV content and return lists
 */
export function parseCsv(csvContent: string): CoinList[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) {
    return []; // Need at least header + one data row
  }

  // Skip header
  const dataLines = lines.slice(1);
  const listsMap = new Map<string, CoinList>();

  for (const line of dataLines) {
    // Simple CSV parsing (handles quoted fields)
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField); // Add last field

    if (fields.length < CSV_HEADERS.length) {
      continue; // Skip malformed rows
    }

    const [
      listName,
      listNotes,
      coinId,
      symbol,
      name,
      coinNotes,
      currency,
      addedAtStr,
    ] = fields;

    // Skip rows without list name (subsequent rows of same list)
    if (!listName.trim()) {
      continue;
    }

    // Get or create list
    let list = listsMap.get(listName.trim());
    if (!list) {
      list = {
        id: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: listName.trim(),
        coins: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notes: listNotes.trim() || undefined,
      };
      listsMap.set(listName.trim(), list);
    }

    // Add coin if coin data exists
    if (coinId.trim() && symbol.trim() && name.trim()) {
      // Check for duplicate within this list
      const isDuplicate = list.coins.some((c) => c.coinId === coinId.trim());
      if (!isDuplicate) {
        const addedAt = addedAtStr.trim()
          ? new Date(addedAtStr.trim()).getTime()
          : Date.now();

        list.coins.push({
          coinId: coinId.trim(),
          symbol: symbol.trim(),
          name: name.trim(),
          notes: coinNotes.trim() || undefined,
          vsCurrency: (currency.trim() as any) || 'usd',
          addedAt: isNaN(addedAt) ? Date.now() : addedAt,
        });
      }
    }
  }

  return Array.from(listsMap.values());
}

/**
 * Generate mock coin data for development
 */
export function generateMockCoin(coinId: string, symbol: string, name: string): CoinListItem {
  return {
    coinId,
    symbol,
    name,
    addedAt: Date.now(),
    vsCurrency: 'usd',
  };
}

/**
 * Generate mock list for development
 */
export function generateMockList(name: string, coinCount: number = 3): CoinList {
  const mockCoins: CoinListItem[] = [
    generateMockCoin('bitcoin', 'BTC', 'Bitcoin'),
    generateMockCoin('ethereum', 'ETH', 'Ethereum'),
    generateMockCoin('cardano', 'ADA', 'Cardano'),
    generateMockCoin('solana', 'SOL', 'Solana'),
    generateMockCoin('polkadot', 'DOT', 'Polkadot'),
  ].slice(0, coinCount);

  return {
    id: `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    coins: mockCoins,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

