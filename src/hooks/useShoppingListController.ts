import { useEffect, useRef, useState } from 'react';
import { router, type Href } from 'expo-router';
import {
  createShoppingListItem,
  getShoppingListDetails,
  setShoppingListItemCompleted,
  updateShoppingListItem,
  type ShoppingListDetails,
  type ShoppingListItem,
} from '../services/shoppingService';
import { getOfflineSnapshot, saveOfflineSnapshot } from '../services/offlineCache';
import { useHouseholdShell } from '../state/HouseholdShellContext';
import { reportNetworkFailure, useNetworkStatus } from './useNetworkStatus';
import type { User } from '../types/User';

function sortItems(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort((first, second) =>
    Number(first.isCompleted) - Number(second.isCompleted) ||
    first.createdAt.localeCompare(second.createdAt),
  );
}

export function useShoppingListController(user: User | null, listId: number) {
  const { household, isLoading: isHouseholdLoading } = useHouseholdShell();
  const isOnline = useNetworkStatus();
  const [list, setList] = useState<ShoppingListDetails | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isDraftActive, setIsDraftActive] = useState(false);
  const [draftKey, setDraftKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState<Set<number>>(() => new Set());
  const [error, setError] = useState('');
  const draftItemName = useRef('');
  const itemSaveInProgress = useRef(false);
  const cacheKey = user ? `shopping-list:${user.id}:${listId}` : '';

  useEffect(() => {
    if (!user || isHouseholdLoading) return;
    let active = true;

    const load = async () => {
      if (!household) {
        if (isOnline) {
          router.replace('/(app)/household' as Href);
        } else {
          setError('No saved household is available while offline.');
        }
        setIsLoading(false);
        return;
      }

      if (!isOnline) {
        const snapshot = await getOfflineSnapshot<{ list: ShoppingListDetails }>(cacheKey);
        if (active && snapshot) {
          setError('');
          setList(snapshot.list);
          setItems(snapshot.list.items);
        } else if (active) {
          setError('This shopping list has not been saved for offline viewing.');
        }
        if (active) setIsLoading(false);
        return;
      }

      setError('');
      try {
        if (!Number.isSafeInteger(listId) || listId < 1) {
          throw new Error('Invalid shopping list.');
        }
        const shoppingList = await getShoppingListDetails(household.id, listId);
        if (active) {
          setList(shoppingList);
          setItems(shoppingList.items);
        }
      } catch (loadError) {
        reportNetworkFailure(loadError);
        const snapshot = await getOfflineSnapshot<{ list: ShoppingListDetails }>(cacheKey);
        if (active && snapshot) {
          setList(snapshot.list);
          setItems(snapshot.list.items);
          setError('Unable to refresh this list. Showing the saved copy.');
        } else if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load shopping list.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [cacheKey, household, isHouseholdLoading, isOnline, listId, user]);

  useEffect(() => {
    if (!isLoading && household && list && user) {
      void saveOfflineSnapshot(cacheKey, { list: { ...list, items } });
    }
  }, [cacheKey, household, isLoading, items, list, user]);

  const refreshList = async (householdId: number, shoppingListId: number) => {
    const shoppingList = await getShoppingListDetails(householdId, shoppingListId);
    setList(shoppingList);
    setItems(shoppingList.items);
  };

  const persistItem = async (name: string): Promise<boolean> => {
    if (!isOnline) {
      setError('You are offline. Reconnect to save changes.');
      return false;
    }
    if (!list || !user || !name.trim() || itemSaveInProgress.current) return false;
    itemSaveInProgress.current = true;
    setError('');
    setIsSaving(true);
    try {
      await createShoppingListItem(list.id, user.id, name);
      try {
        await refreshList(list.householdId, list.id);
      } catch (loadError) {
        reportNetworkFailure(loadError);
        setError(
          loadError instanceof Error
            ? `The item was added, but the list could not be refreshed: ${loadError.message}`
            : 'The item was added, but the list could not be refreshed.',
        );
      }
      return true;
    } catch (createError) {
      reportNetworkFailure(createError);
      setError(createError instanceof Error ? createError.message : 'Unable to add item.');
      return false;
    } finally {
      itemSaveInProgress.current = false;
      setIsSaving(false);
    }
  };

  const handleCommitNewItem = async (name: string): Promise<boolean> => {
    if (!name.trim()) {
      draftItemName.current = '';
      setIsDraftActive(false);
      return true;
    }

    const saved = await persistItem(name);
    if (saved) {
      draftItemName.current = '';
      setIsDraftActive(false);
    }
    return saved;
  };

  const handleAddNewItem = async () => {
    if (!isDraftActive) {
      draftItemName.current = '';
      setDraftKey((current) => current + 1);
      setIsDraftActive(true);
      return;
    }

    const name = draftItemName.current.trim();
    if (!name) {
      setDraftKey((current) => current + 1);
      setIsDraftActive(true);
      return;
    }

    const saved = await persistItem(name);
    if (saved) {
      draftItemName.current = '';
      setDraftKey((current) => current + 1);
      setIsDraftActive(true);
    }
  };

  const handleEditItem = async (item: ShoppingListItem, name: string): Promise<boolean> => {
    if (!isOnline) {
      setError('You are offline. Reconnect to save changes.');
      return false;
    }
    if (!list || !user || !name.trim()) return false;
    setError('');
    try {
      await updateShoppingListItem(list.id, item.id, user.id, name);
      const updatedAt = new Date().toISOString();
      setItems((current) => sortItems(current.map((currentItem) => currentItem.id === item.id
        ? { ...currentItem, name: name.trim(), updatedAt, updatedBy: user.id }
        : currentItem)));
      setList((current) => current
        ? { ...current, updatedAt, updatedBy: user.id, updatedByName: user.name }
        : current);
      try {
        await refreshList(list.householdId, list.id);
      } catch (loadError) {
        reportNetworkFailure(loadError);
        setError(
          loadError instanceof Error
            ? `The item was updated, but the list could not be refreshed: ${loadError.message}`
            : 'The item was updated, but the list could not be refreshed.',
        );
      }
      return true;
    } catch (updateError) {
      reportNetworkFailure(updateError);
      setError(updateError instanceof Error ? updateError.message : 'Unable to update shopping item.');
      return false;
    }
  };

  const handleToggleItem = async (item: ShoppingListItem) => {
    if (!isOnline) {
      setError('You are offline. Reconnect to save changes.');
      return;
    }
    if (!list || !user || pendingItemIds.has(item.id)) return;

    const isCompleted = !item.isCompleted;
    const updatedAt = new Date().toISOString();
    const currentList = list;
    setError('');
    setPendingItemIds((current) => new Set(current).add(item.id));
    setItems((current) => sortItems(current.map((currentItem) => currentItem.id === item.id
      ? { ...currentItem, isCompleted, updatedAt, updatedBy: user.id }
      : currentItem)));
    setList((current) => current
      ? { ...current, updatedAt, updatedBy: user.id, updatedByName: user.name }
      : current);

    try {
      await setShoppingListItemCompleted(list.id, item.id, user.id, isCompleted);
    } catch (updateError) {
      reportNetworkFailure(updateError);
      setItems((current) => sortItems(current.map((currentItem) => currentItem.id === item.id ? item : currentItem)));
      setList(currentList);
      setError(updateError instanceof Error ? updateError.message : 'Unable to update shopping item.');
      setPendingItemIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
      return;
    }

    try {
      await refreshList(list.householdId, list.id);
    } catch (loadError) {
      reportNetworkFailure(loadError);
      setError(
        loadError instanceof Error
          ? `The item was updated, but the list could not be refreshed: ${loadError.message}`
          : 'The item was updated, but the list could not be refreshed.',
      );
    } finally {
      setPendingItemIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
    }
  };

  const updateDraftItemName = (name: string) => {
    draftItemName.current = name;
    setError('');
  };

  return {
    household,
    list,
    items,
    isDraftActive,
    draftKey,
    isLoading,
    isSaving,
    pendingItemIds,
    error,
    handleCommitNewItem,
    handleAddNewItem,
    handleEditItem,
    handleToggleItem,
    updateDraftItemName,
  };
}
