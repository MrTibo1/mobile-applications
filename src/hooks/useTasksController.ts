import { useCallback, useEffect, useRef, useState } from 'react';
import { router, type Href } from 'expo-router';
import { getHouseholdForUser, type Household } from '../services/householdService';
import {
  createTask,
  deleteCompletedTasks,
  getTasks,
  setTaskCompleted,
  taskDeadlineToTimestamp,
  updateTaskDeadline,
  updateTaskMessage,
  type HouseholdTask,
} from '../services/taskService';
import { useHouseholdShell } from '../state/HouseholdShellContext';
import type { User } from '../types/User';

function sortTasks(tasks: HouseholdTask[]): HouseholdTask[] {
  return [...tasks].sort((first, second) => {
    const completionOrder = Number(first.isCompleted) - Number(second.isCompleted);
    if (completionOrder !== 0) return completionOrder;
    if (first.deadline === null || second.deadline === null) {
      if (first.deadline !== second.deadline) return first.deadline === null ? 1 : -1;
    } else {
      const dueDateOrder = first.deadline.localeCompare(second.deadline);
      if (dueDateOrder !== 0) return dueDateOrder;
    }
    return second.updatedAt.localeCompare(first.updatedAt);
  });
}

export function useTasksController(user: User | null) {
  const { setHousehold: setShellHousehold } = useHouseholdShell();
  const [household, setHousehold] = useState<Household | null>(null);
  const [tasks, setTasks] = useState<HouseholdTask[]>([]);
  const [deadline, setDeadline] = useState('');
  const [isDraftActive, setIsDraftActive] = useState(false);
  const [draftKey, setDraftKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingCompleted, setIsDeletingCompleted] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<number>>(() => new Set());
  const [error, setError] = useState('');
  const draftMessage = useRef('');
  const draftDeadline = useRef('');
  const taskSaveInProgress = useRef(false);

  const loadTasks = useCallback(async (householdId: number) => {
    setTasks(await getTasks(householdId));
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const load = async () => {
      try {
        const currentHousehold = await getHouseholdForUser(user.id);
        if (!active) return;
        if (!currentHousehold) {
          setShellHousehold(null);
          router.replace('/(app)/household' as Href);
          return;
        }
        setHousehold(currentHousehold);
        setShellHousehold(currentHousehold);
        const result = await getTasks(currentHousehold.id);
        if (active) setTasks(result);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load tasks.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [setShellHousehold, user]);

  const persistTask = async (message: string, dueDate: string): Promise<boolean> => {
    if (!household || !user || !message.trim() || taskSaveInProgress.current) return false;
    taskSaveInProgress.current = true;
    setError('');
    setIsSaving(true);
    try {
      await createTask(household.id, user.id, message, dueDate);
      try {
        await loadTasks(household.id);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? `The task was added, but the list could not be refreshed: ${loadError.message}`
            : 'The task was added, but the list could not be refreshed.',
        );
      }
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to add task.');
      return false;
    } finally {
      taskSaveInProgress.current = false;
      setIsSaving(false);
    }
  };

  const handleCommitNewTask = async (message: string): Promise<boolean> => {
    if (!message.trim()) {
      draftMessage.current = '';
      draftDeadline.current = '';
      setDeadline('');
      setIsDraftActive(false);
      return true;
    }

    const saved = await persistTask(message, draftDeadline.current);
    if (saved) {
      draftMessage.current = '';
      draftDeadline.current = '';
      setDeadline('');
      setIsDraftActive(false);
    }
    return saved;
  };

  const handleAddNewTask = async () => {
    if (!isDraftActive) {
      draftMessage.current = '';
      draftDeadline.current = '';
      setDeadline('');
      setDraftKey((current) => current + 1);
      setIsDraftActive(true);
      return;
    }

    const message = draftMessage.current.trim();
    if (!message) {
      setDraftKey((current) => current + 1);
      setIsDraftActive(true);
      return;
    }

    const saved = await persistTask(message, draftDeadline.current);
    if (saved) {
      draftMessage.current = '';
      draftDeadline.current = '';
      setDeadline('');
      setDraftKey((current) => current + 1);
      setIsDraftActive(true);
    }
  };

  const handleEditTask = async (task: HouseholdTask, message: string): Promise<boolean> => {
    if (!household || !user || !message.trim()) return false;
    setError('');
    try {
      await updateTaskMessage(household.id, task.id, user.id, message);
      const updatedAt = new Date().toISOString();
      setTasks((current) => sortTasks(current.map((item) => item.id === task.id
        ? { ...item, message: message.trim(), updatedBy: user.id, updatedByName: user.name, updatedAt }
        : item)));
      try {
        await loadTasks(household.id);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? `The task was updated, but the list could not be refreshed: ${loadError.message}`
            : 'The task was updated, but the list could not be refreshed.',
        );
      }
      return true;
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update task.');
      return false;
    }
  };

  const handleToggleTask = async (task: HouseholdTask) => {
    if (!household || !user || pendingTaskIds.has(task.id)) return;

    const isCompleted = !task.isCompleted;
    const updatedAt = new Date().toISOString();
    setError('');
    setPendingTaskIds((current) => new Set(current).add(task.id));
    setTasks((current) => sortTasks(current.map((item) => item.id === task.id
      ? { ...item, isCompleted, updatedBy: user.id, updatedByName: user.name, updatedAt }
      : item)));

    try {
      await setTaskCompleted(household.id, task.id, user.id, isCompleted);
      await loadTasks(household.id);
    } catch (updateError) {
      setTasks((current) => sortTasks(current.map((item) => item.id === task.id ? task : item)));
      setError(updateError instanceof Error ? updateError.message : 'Unable to update task.');
    } finally {
      setPendingTaskIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  };

  const handleUpdateTaskDeadline = async (task: HouseholdTask, deadlineValue: string) => {
    if (!household || !user || pendingTaskIds.has(task.id)) return;

    let timestamp: string | null;
    try {
      timestamp = taskDeadlineToTimestamp(deadlineValue);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Enter a valid due date.');
      return;
    }

    const updatedAt = new Date().toISOString();
    setError('');
    setPendingTaskIds((current) => new Set(current).add(task.id));
    setTasks((current) => sortTasks(current.map((item) => item.id === task.id
      ? {
        ...item,
        deadline: timestamp,
        updatedBy: user.id,
        updatedByName: user.name,
        updatedAt,
      }
      : item)));

    try {
      await updateTaskDeadline(household.id, task.id, user.id, deadlineValue);
      try {
        await loadTasks(household.id);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? `The due date was updated, but the list could not be refreshed: ${loadError.message}`
            : 'The due date was updated, but the list could not be refreshed.',
        );
      }
    } catch (updateError) {
      setTasks((current) => sortTasks(current.map((item) => item.id === task.id ? task : item)));
      setError(updateError instanceof Error ? updateError.message : 'Unable to update due date.');
    } finally {
      setPendingTaskIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  };

  const handleDeleteCompletedTasks = async () => {
    if (!household || isDeletingCompleted) return;
    setError('');
    setIsDeletingCompleted(true);
    try {
      await deleteCompletedTasks(household.id);
      setTasks((current) => current.filter((task) => !task.isCompleted));
      try {
        await loadTasks(household.id);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? `Completed tasks were deleted, but the list could not be refreshed: ${loadError.message}`
            : 'Completed tasks were deleted, but the list could not be refreshed.',
        );
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete completed tasks.');
    } finally {
      setIsDeletingCompleted(false);
    }
  };

  const updateDraftMessage = (message: string) => {
    draftMessage.current = message;
    setError('');
  };

  const updateDraftDeadline = (value: string) => {
    draftDeadline.current = value;
    setDeadline(value);
  };

  return {
    household,
    tasks,
    deadline,
    isDraftActive,
    draftKey,
    isLoading,
    isSaving,
    isDeletingCompleted,
    pendingTaskIds,
    error,
    handleCommitNewTask,
    handleAddNewTask,
    handleEditTask,
    handleToggleTask,
    handleUpdateTaskDeadline,
    handleDeleteCompletedTasks,
    updateDraftMessage,
    updateDraftDeadline,
  };
}
