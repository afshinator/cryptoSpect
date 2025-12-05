// __tests__/coinListsStore.test.ts
// Tests for the coin lists Zustand store

import { CoinList, CoinListItem } from '@/features/lists/types';
import { useCoinListsStore } from '@/stores/coinListsStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock prefsStore
jest.mock('@/stores/prefsStore', () => ({
  usePrefsStore: {
    getState: () => ({ currency: 'usd' }),
  },
}));

describe('CoinListsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCoinListsStore.setState({
      lists: [],
      top20List: null,
      _hasHydrated: false,
    });
    jest.clearAllMocks();
  });

  describe('createList', () => {
    it('should create a new list with valid name', async () => {
      const result = await useCoinListsStore.getState().createList('My Test List');
      
      expect(result).not.toHaveProperty('error');
      expect((result as CoinList).name).toBe('My Test List');
      expect((result as CoinList).coins).toEqual([]);
      expect((result as CoinList).id).toBeDefined();
      expect((result as CoinList).createdAt).toBeDefined();
      expect((result as CoinList).updatedAt).toBeDefined();
      
      const lists = useCoinListsStore.getState().lists;
      expect(lists).toHaveLength(1);
      expect(lists[0].name).toBe('My Test List');
    });

    it('should reject empty list name', async () => {
      const result = await useCoinListsStore.getState().createList('');
      
      expect(result).toHaveProperty('error');
      expect((result as { error: string }).error).toBe('List name cannot be empty');
      
      const lists = useCoinListsStore.getState().lists;
      expect(lists).toHaveLength(0);
    });

    it('should reject duplicate list names (case-insensitive)', async () => {
      await useCoinListsStore.getState().createList('Test List');
      
      const result = await useCoinListsStore.getState().createList('test list');
      
      expect(result).toHaveProperty('error');
      expect((result as { error: string }).error).toBe('A list with this name already exists');
      
      const lists = useCoinListsStore.getState().lists;
      expect(lists).toHaveLength(1);
    });

    it('should trim whitespace from list name', async () => {
      const result = await useCoinListsStore.getState().createList('  Trimmed List  ');
      
      expect((result as CoinList).name).toBe('Trimmed List');
      const lists = useCoinListsStore.getState().lists;
      expect(lists[0].name).toBe('Trimmed List');
    });
  });

  describe('updateList', () => {
    let listId: string;

    beforeEach(async () => {
      const result = await useCoinListsStore.getState().createList('Original Name');
      listId = (result as CoinList).id;
    });

    it('should update list name', async () => {
      const result = await useCoinListsStore.getState().updateList(listId, { name: 'Updated Name' });
      
      expect(result).not.toHaveProperty('error');
      expect((result as CoinList).name).toBe('Updated Name');
      
      const list = useCoinListsStore.getState().lists.find(l => l.id === listId);
      expect(list?.name).toBe('Updated Name');
    });

    it('should update list notes', async () => {
      const result = await useCoinListsStore.getState().updateList(listId, { notes: 'Test notes' });
      
      expect(result).not.toHaveProperty('error');
      expect((result as CoinList).notes).toBe('Test notes');
      
      const list = useCoinListsStore.getState().lists.find(l => l.id === listId);
      expect(list?.notes).toBe('Test notes');
    });

    it('should reject duplicate name on update', async () => {
      await useCoinListsStore.getState().createList('Other List');
      
      const result = await useCoinListsStore.getState().updateList(listId, { name: 'Other List' });
      
      expect(result).toHaveProperty('error');
      expect((result as { error: string }).error).toBe('A list with this name already exists');
    });

    it('should allow updating to same name (for same list)', async () => {
      const result = await useCoinListsStore.getState().updateList(listId, { name: 'Original Name' });
      
      expect(result).not.toHaveProperty('error');
      expect((result as CoinList).name).toBe('Original Name');
    });

    it('should update updatedAt timestamp', async () => {
      const list = useCoinListsStore.getState().lists.find(l => l.id === listId);
      const originalUpdatedAt = list?.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await useCoinListsStore.getState().updateList(listId, { notes: 'New notes' });
      
      const updatedList = useCoinListsStore.getState().lists.find(l => l.id === listId);
      expect(updatedList?.updatedAt).toBeGreaterThan(originalUpdatedAt || 0);
    });
  });

  describe('deleteList', () => {
    it('should delete a list', async () => {
      const result = await useCoinListsStore.getState().createList('To Delete');
      const listId = (result as CoinList).id;
      
      await useCoinListsStore.getState().deleteList(listId);
      
      const lists = useCoinListsStore.getState().lists;
      expect(lists).toHaveLength(0);
      expect(lists.find(l => l.id === listId)).toBeUndefined();
    });
  });

  describe('addCoinToList', () => {
    let listId: string;

    beforeEach(async () => {
      const result = await useCoinListsStore.getState().createList('Test List');
      listId = (result as CoinList).id;
    });

    it('should add a coin to a list', async () => {
      const coin: Omit<CoinListItem, 'addedAt'> = {
        coinId: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        vsCurrency: 'usd',
      };
      
      const result = await useCoinListsStore.getState().addCoinToList(listId, coin);
      
      expect(result).not.toHaveProperty('error');
      const list = (result as CoinList);
      expect(list.coins).toHaveLength(1);
      expect(list.coins[0].coinId).toBe('bitcoin');
      expect(list.coins[0].symbol).toBe('BTC');
      expect(list.coins[0].addedAt).toBeDefined();
    });

    it('should reject duplicate coins', async () => {
      const coin: Omit<CoinListItem, 'addedAt'> = {
        coinId: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        vsCurrency: 'usd',
      };
      
      await useCoinListsStore.getState().addCoinToList(listId, coin);
      const result = await useCoinListsStore.getState().addCoinToList(listId, coin);
      
      expect(result).toHaveProperty('error');
      expect((result as { error: string }).error).toBe('Coin already exists in this list');
      
      const list = useCoinListsStore.getState().lists.find(l => l.id === listId);
      expect(list?.coins).toHaveLength(1);
    });

    it('should use user currency preference when vsCurrency not provided', async () => {
      const coin: Omit<CoinListItem, 'addedAt'> = {
        coinId: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        vsCurrency: 'usd', // Will be overridden by user preference if not provided
      };
      
      const result = await useCoinListsStore.getState().addCoinToList(listId, coin);
      const list = (result as CoinList);
      
      expect(list.coins[0].vsCurrency).toBe('usd');
    });
  });

  describe('removeCoinFromList', () => {
    let listId: string;

    beforeEach(async () => {
      const result = await useCoinListsStore.getState().createList('Test List');
      listId = (result as CoinList).id;
      
      await useCoinListsStore.getState().addCoinToList(listId, {
        coinId: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        vsCurrency: 'usd',
      });
    });

    it('should remove a coin from a list', async () => {
      await useCoinListsStore.getState().removeCoinFromList(listId, 'bitcoin');
      
      const list = useCoinListsStore.getState().lists.find(l => l.id === listId);
      expect(list?.coins).toHaveLength(0);
    });

    it('should handle case-insensitive coinId removal', async () => {
      await useCoinListsStore.getState().removeCoinFromList(listId, 'BITCOIN');
      
      const list = useCoinListsStore.getState().lists.find(l => l.id === listId);
      expect(list?.coins).toHaveLength(0);
    });
  });

  describe('updateCoinNotes', () => {
    let listId: string;

    beforeEach(async () => {
      const result = await useCoinListsStore.getState().createList('Test List');
      listId = (result as CoinList).id;
      
      await useCoinListsStore.getState().addCoinToList(listId, {
        coinId: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        vsCurrency: 'usd',
      });
    });

    it('should update coin notes', async () => {
      await useCoinListsStore.getState().updateCoinNotes(listId, 'bitcoin', 'My notes');
      
      const list = useCoinListsStore.getState().lists.find(l => l.id === listId);
      expect(list?.coins[0].notes).toBe('My notes');
    });

    it('should trim coin notes', async () => {
      await useCoinListsStore.getState().updateCoinNotes(listId, 'bitcoin', '  Trimmed notes  ');
      
      const list = useCoinListsStore.getState().lists.find(l => l.id === listId);
      expect(list?.coins[0].notes).toBe('Trimmed notes');
    });
  });

  describe('getList', () => {
    it('should return a list by id', async () => {
      const result = await useCoinListsStore.getState().createList('Test List');
      const listId = (result as CoinList).id;
      
      const list = useCoinListsStore.getState().getList(listId);
      
      expect(list).toBeDefined();
      expect(list?.id).toBe(listId);
      expect(list?.name).toBe('Test List');
    });

    it('should return undefined for non-existent list', () => {
      const list = useCoinListsStore.getState().getList('non-existent');
      expect(list).toBeUndefined();
    });
  });

  describe('getAllLists', () => {
    it('should return all lists', async () => {
      await useCoinListsStore.getState().createList('List 1');
      await useCoinListsStore.getState().createList('List 2');
      
      const lists = useCoinListsStore.getState().getAllLists();
      
      expect(lists).toHaveLength(2);
    });
  });

  describe('setTop20List', () => {
    it('should set the top 20 list', () => {
      const mockList: CoinList = {
        id: 'current-top-20',
        name: 'Current top 20',
        coins: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      useCoinListsStore.getState().setTop20List(mockList);
      
      expect(useCoinListsStore.getState().top20List).toEqual(mockList);
    });

    it('should clear the top 20 list when set to null', () => {
      const mockList: CoinList = {
        id: 'current-top-20',
        name: 'Current top 20',
        coins: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      useCoinListsStore.getState().setTop20List(mockList);
      useCoinListsStore.getState().setTop20List(null);
      
      expect(useCoinListsStore.getState().top20List).toBeNull();
    });
  });
});

