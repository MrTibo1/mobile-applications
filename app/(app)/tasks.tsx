import { AddNewListEntryButton } from '../../src/components/common/AddNewListEntryButton';
import { DatePickerField } from '../../src/components/common/DatePickerField';
import { FeedbackMessage } from '../../src/components/common/FeedbackMessage';
import { HouseholdTaskCard } from '../../src/components/household/HouseholdTaskCard';
import { ListGroup } from '../../src/components/shopping/ListGroup';
import { NewListEntryRow } from '../../src/components/shopping/NewListEntryRow';
import { PageContainer } from '../../src/components/common/PageContainer';
import { PageLoadingState } from '../../src/components/common/PageLoadingState';
import { TaskDueSoonSummary } from '../../src/components/tasks/TaskDueSoonSummary';
import { TaskListHeader } from '../../src/components/tasks/TaskListHeader';
import { Text } from '../../src/components/primitives/Text';
import { useTasksController } from '../../src/hooks/useTasksController';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { useAuthStore } from '../../src/state/useAuthStore';

export default function TasksScreen() {
  const user = useAuthStore((state) => state.user);
  const isOnline = useNetworkStatus();
  const {
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
  } = useTasksController(user);

  if (isLoading) return <PageLoadingState />;
  if (!household || !user) {
    return (
      <PageContainer safeArea={false}>
        <FeedbackMessage message={error || 'Household details are unavailable.'} />
      </PageContainer>
    );
  }

  return (
    <PageContainer safeArea={false}>
      <TaskDueSoonSummary tasks={tasks} />
      <Text size="xl" weight="bold">Tasks</Text>
      <Text color="#52606D">Shared to-do list for your household.</Text>
      <FeedbackMessage message={error} />
      <TaskListHeader
        completedTaskCount={tasks.filter((task) => task.isCompleted).length}
        isDeletingCompleted={isDeletingCompleted}
        disabled={!isOnline}
        onDeleteCompleted={() => { void handleDeleteCompletedTasks(); }}
      />
      <ListGroup>
        {tasks.length === 0 ? (
          <Text color="#69756F">No tasks yet. Add one to get started.</Text>
        ) : tasks.map((task) => (
          <HouseholdTaskCard
            key={task.id}
            task={task}
            disabled={!isOnline || isDeletingCompleted || pendingTaskIds.has(task.id)}
            onToggle={() => { void handleToggleTask(task); }}
            onEdit={(message) => handleEditTask(task, message)}
            onDeadlineChange={(value) => { void handleUpdateTaskDeadline(task, value); }}
          />
        ))}
        {isDraftActive ? (
          <NewListEntryRow
            key={draftKey}
            accessibilityLabel="New task"
            placeholder="New task"
            onDraftChange={updateDraftMessage}
            onCommit={handleCommitNewTask}
            disabled={!isOnline}
            trailingAccessory={(focusInput) => (
              <DatePickerField
                label="Optional due date"
                value={deadline}
                compact
                onChange={updateDraftDeadline}
                onClose={focusInput}
              />
            )}
          />
        ) : null}
        <AddNewListEntryButton
          accessibilityLabel="Add new task"
          disabled={!isOnline || isSaving || isDeletingCompleted}
          onPress={() => { void handleAddNewTask(); }}
        />
      </ListGroup>
    </PageContainer>
  );
}
