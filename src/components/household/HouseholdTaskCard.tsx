import { Pressable, StyleSheet, View } from 'react-native';
import type { HouseholdTask } from '../../services/taskService';
import { TaskDueBadge } from '../tasks/TaskDueBadge';
import { DatePickerField } from '../common/DatePickerField';
import { EditableListText } from '../shopping/EditableListText';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

interface HouseholdTaskCardProps {
  task: HouseholdTask;
  onToggle: () => void;
  onEdit: (message: string) => Promise<boolean>;
  onDeadlineChange: (deadline: string) => void;
  disabled?: boolean;
}

function deadlineToDateInput(deadline: string | null): string {
  if (!deadline) return '';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function HouseholdTaskCard({
  task,
  onToggle,
  onEdit,
  onDeadlineChange,
  disabled = false,
}: HouseholdTaskCardProps) {
  return (
    <Card variant="listItem">
      <View style={styles.row}>
        <Pressable
          style={[styles.checkbox, task.isCompleted && styles.checkboxDone, disabled && styles.disabled]}
          onPress={onToggle}
          disabled={disabled}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.isCompleted }}
          accessibilityLabel={`Mark ${task.message} ${task.isCompleted ? 'incomplete' : 'complete'}`}
        >
          {task.isCompleted ? <Text weight="bold" color="#FFFFFF">✓</Text> : null}
        </Pressable>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <EditableListText
              value={task.message}
              accessibilityLabel={`Edit task: ${task.message}`}
              onCommit={onEdit}
              disabled={disabled}
              completed={task.isCompleted}
            />
            <DatePickerField
              label={`Due date for ${task.message}`}
              value={deadlineToDateInput(task.deadline)}
              compact
              disabled={disabled}
              onChange={onDeadlineChange}
            />
          </View>
          <TaskDueBadge deadline={task.deadline} isCompleted={task.isCompleted} />
          <Text size="sm" color="#69756F">
            Updated by {task.updatedByName} · {new Date(task.updatedAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#8A9691', alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#176B5B', borderColor: '#176B5B' },
  disabled: { opacity: 0.7 },
  content: { flex: 1, gap: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
