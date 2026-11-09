import { getSupabaseClient } from './supabaseClient';

interface ShoppingListRow {
  id: number;
  household_id: number;
  title: string;
  updated_at: string;
  updated_by: string;
}

interface ShoppingListItemRow {
  id: number;
  shopping_list_id: number;
  name: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface ShoppingListSummary {
  id: number;
  title: string;
  itemCount: number;
  preview: string[];
  hasMoreItems: boolean;
  updatedAt: string;
  updatedByName: string;
}

export interface ShoppingListItem {
  id: number;
  shoppingListId: number;
  name: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ShoppingListDetails extends ShoppingListSummary {
  householdId: number;
  updatedBy: string;
  items: ShoppingListItem[];
}

async function getProfileNames(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('id, username, full_name')
    .in('id', userIds);
  if (error) throw error;

  return new Map(data.map((profile) => [
    profile.id,
    profile.username || profile.full_name || 'Household member',
  ]));
}

function mapItem(row: ShoppingListItemRow): ShoppingListItem {
  return {
    id: row.id,
    shoppingListId: row.shopping_list_id,
    name: row.name,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function getShoppingLists(householdId: number): Promise<ShoppingListSummary[]> {
  const { data, error } = await getSupabaseClient()
    .from('shopping_lists')
    .select('id, household_id, title, updated_at, updated_by')
    .eq('household_id', householdId)
    .order('updated_at', { ascending: false });
  if (error) throw error;

  const lists: ShoppingListRow[] = data ?? [];
  if (lists.length === 0) return [];

  const { data: itemData, error: itemError } = await getSupabaseClient()
    .from('shopping_list_items')
    .select('id, shopping_list_id, name, is_completed, created_at, updated_at, updated_by')
    .in('shopping_list_id', lists.map((list) => list.id))
    .order('is_completed', { ascending: true })
    .order('created_at', { ascending: true });
  if (itemError) throw itemError;

  const itemsByList = new Map<number, ShoppingListItemRow[]>();
  for (const item of itemData ?? []) {
    const listItems = itemsByList.get(item.shopping_list_id) ?? [];
    listItems.push(item);
    itemsByList.set(item.shopping_list_id, listItems);
  }

  const updaterNames = await getProfileNames([...new Set(lists.map((list) => list.updated_by))]);
  return lists.map((list) => {
    const items = itemsByList.get(list.id) ?? [];
    return {
      id: list.id,
      title: list.title,
      itemCount: items.length,
      preview: items.slice(0, 2).map((item) => item.name),
      hasMoreItems: items.length > 2,
      updatedAt: list.updated_at,
      updatedByName: updaterNames.get(list.updated_by) ?? 'Household member',
    };
  });
}

export async function getShoppingListDetails(
  householdId: number,
  listId: number,
): Promise<ShoppingListDetails> {
  const client = getSupabaseClient();
  const { data: list, error: listError } = await client
    .from('shopping_lists')
    .select('id, household_id, title, updated_at, updated_by')
    .eq('id', listId)
    .eq('household_id', householdId)
    .maybeSingle();
  if (listError) throw listError;
  if (!list) throw new Error('Shopping list not found.');

  const { data: itemData, error: itemError } = await client
    .from('shopping_list_items')
    .select('id, shopping_list_id, name, is_completed, created_at, updated_at, updated_by')
    .eq('shopping_list_id', listId)
    .order('is_completed', { ascending: true })
    .order('created_at', { ascending: true });
  if (itemError) throw itemError;

  const items: ShoppingListItemRow[] = itemData ?? [];
  const updaterNames = await getProfileNames([list.updated_by]);
  return {
    id: list.id,
    householdId: list.household_id,
    title: list.title,
    itemCount: items.length,
    preview: items.slice(0, 2).map((item) => item.name),
    hasMoreItems: items.length > 2,
    updatedAt: list.updated_at,
    updatedBy: list.updated_by,
    updatedByName: updaterNames.get(list.updated_by) ?? 'Household member',
    items: items.map(mapItem),
  };
}

export async function createShoppingList(
  householdId: number,
  userId: string,
  title: string,
): Promise<void> {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error('Enter a list title.');

  const { error } = await getSupabaseClient().from('shopping_lists').insert({
    household_id: householdId,
    title: cleanTitle,
    updated_by: userId,
  });
  if (error) throw error;
}

export async function createShoppingListItem(
  listId: number,
  userId: string,
  name: string,
): Promise<void> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Enter an item.');

  const { error } = await getSupabaseClient().from('shopping_list_items').insert({
    shopping_list_id: listId,
    name: cleanName,
    updated_by: userId,
  });
  if (error) throw error;
}

export async function updateShoppingListItem(
  listId: number,
  itemId: number,
  userId: string,
  name: string,
): Promise<void> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Enter an item.');

  const { error } = await getSupabaseClient()
    .from('shopping_list_items')
    .update({
      name: cleanName,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('shopping_list_id', listId);
  if (error) throw error;
}

export async function setShoppingListItemCompleted(
  listId: number,
  itemId: number,
  userId: string,
  isCompleted: boolean,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('shopping_list_items')
    .update({
      is_completed: isCompleted,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('shopping_list_id', listId);
  if (error) throw error;
}
