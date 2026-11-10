import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Household } from './householdService';

const CACHE_PREFIX = 'household-manager:offline:';

export async function getOfflineSnapshot<T>(key: string): Promise<T | null> {
  try {
    const snapshot = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    return snapshot === null ? null : JSON.parse(snapshot) as T;
  } catch (error) {
    console.error(`Unable to read offline data for "${key}".`, error);
    return null;
  }
}

export async function saveOfflineSnapshot<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save offline data for "${key}".`, error);
  }
}

export async function getCachedHousehold(userId: string): Promise<Household | null> {
  const cached = await getOfflineSnapshot<{ household: Household | null }>(`household:${userId}`);
  if (cached) return cached.household;

  const taskSnapshot = await getOfflineSnapshot<{ household: Household }>(`tasks:${userId}`);
  if (taskSnapshot?.household) {
    await saveCachedHousehold(userId, taskSnapshot.household);
    return taskSnapshot.household;
  }

  const listSnapshot = await getOfflineSnapshot<{ household: Household }>(`shopping-lists:${userId}`);
  if (listSnapshot?.household) {
    await saveCachedHousehold(userId, listSnapshot.household);
    return listSnapshot.household;
  }

  return null;
}

export async function saveCachedHousehold(userId: string, household: Household | null): Promise<void> {
  await saveOfflineSnapshot(`household:${userId}`, { household });
}
