import { StyleSheet, View } from 'react-native';
import { DeleteCompletedTasksButton } from './DeleteCompletedTasksButton';
import { Text } from '../primitives/Text';

interface TaskListHeaderProps {
  completedTaskCount: number;
  isDeletingCompleted: boolean;
  disabled?: boolean;
  onDeleteCompleted: () => void;
}

export function TaskListHeader({
  completedTaskCount,
  isDeletingCompleted,
  disabled = false,
  onDeleteCompleted,
}: TaskListHeaderProps) {
  return (
    <View style={styles.container}>
      <Text size="lg" weight="bold">To-do list</Text>
      <View style={styles.actions}>
        <DeleteCompletedTasksButton
          completedTaskCount={completedTaskCount}
          isDeleting={isDeletingCompleted}
          disabled={disabled}
          onDelete={onDeleteCompleted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
