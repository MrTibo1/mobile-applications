import { getSupabaseClient } from './supabaseClient';

interface TaskRow {
  id: number;
  household_id: number;
  message: string;
  deadline: string | null;
  is_completed: boolean;
  updated_by: string;
  updated_at: string;
}

export interface HouseholdTask {
  id: number;
  message: string;
  deadline: string | null;
  isCompleted: boolean;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
}

async function getUpdaterNames(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('id, username')
    .in('id', userIds);
  if (error) throw error;

  return new Map(data.map((profile) => [profile.id, profile.username ?? 'Household member']));
}

function mapTask(row: TaskRow, updaterNames: Map<string, string>): HouseholdTask {
  return {
    id: row.id,
    message: row.message,
    deadline: row.deadline,
    isCompleted: row.is_completed,
    updatedBy: row.updated_by,
    updatedByName: updaterNames.get(row.updated_by) ?? 'Household member',
    updatedAt: row.updated_at,
  };
}

export async function getTasks(householdId: number): Promise<HouseholdTask[]> {
  const { data, error } = await getSupabaseClient()
    .from('tasks')
    .select('id, household_id, message, deadline, is_completed, updated_by, updated_at')
    .eq('household_id', householdId)
    .order('is_completed', { ascending: true })
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;

  const rows: TaskRow[] = data ?? [];
  const updaterNames = await getUpdaterNames([...new Set(rows.map((row) => row.updated_by))]);
  return rows.map((row) => mapTask(row, updaterNames));
}

export async function createTask(
  householdId: number,
  userId: string,
  message: string,
  deadline: string,
): Promise<void> {
  const cleanMessage = message.trim();
  if (!cleanMessage) throw new Error('Enter a task.');

  const deadlineValue = taskDeadlineToTimestamp(deadline);

  const { error } = await getSupabaseClient().from('tasks').insert({
    household_id: householdId,
    message: cleanMessage,
    deadline: deadlineValue,
    is_completed: false,
    updated_by: userId,
  });
  if (error) throw error;
}

export function taskDeadlineToTimestamp(deadline: string): string | null {
  if (!deadline) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    throw new Error('Use YYYY-MM-DD for the due date.');
  }
  const [year, month, day] = deadline.split('-').map(Number);
  const parsedDeadline = new Date(year, month - 1, day, 23, 59, 59);
  if (
    Number.isNaN(parsedDeadline.getTime()) ||
    parsedDeadline.getFullYear() !== year ||
    parsedDeadline.getMonth() !== month - 1 ||
    parsedDeadline.getDate() !== day
  ) {
    throw new Error('Enter a valid due date.');
  }
  return parsedDeadline.toISOString();
}

export async function setTaskCompleted(
  householdId: number,
  taskId: number,
  userId: string,
  isCompleted: boolean,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('tasks')
    .update({ is_completed: isCompleted, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('household_id', householdId);
  if (error) throw error;
}

export async function updateTaskDeadline(
  householdId: number,
  taskId: number,
  userId: string,
  deadline: string,
): Promise<void> {
  const deadlineValue = taskDeadlineToTimestamp(deadline);
  const { error } = await getSupabaseClient()
    .from('tasks')
    .update({ deadline: deadlineValue, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('household_id', householdId);
  if (error) throw error;
}

export async function updateTaskMessage(
  householdId: number,
  taskId: number,
  userId: string,
  message: string,
): Promise<void> {
  const cleanMessage = message.trim();
  if (!cleanMessage) throw new Error('Enter a task.');

  const { error } = await getSupabaseClient()
    .from('tasks')
    .update({ message: cleanMessage, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('household_id', householdId);
  if (error) throw error;
}

export async function deleteCompletedTasks(householdId: number): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('tasks')
    .delete()
    .eq('household_id', householdId)
    .eq('is_completed', true);
  if (error) throw error;
}
