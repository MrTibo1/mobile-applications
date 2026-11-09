import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { HouseholdTask } from '../../services/taskService';
import { daysUntilDeadline } from './TaskDueBadge';
import { Text } from '../primitives/Text';

interface TaskDueSoonSummaryProps {
  tasks: HouseholdTask[];
}

export function TaskDueSoonSummary({ tasks }: TaskDueSoonSummaryProps) {
  const dueSoonCount = tasks.filter((task) => {
    if (task.isCompleted || !task.deadline) return false;
    const daysLeft = daysUntilDeadline(task.deadline);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  }).length;

  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={styles.icon}>
        <Ionicons name="calendar-outline" size={19} color="#176B5B" />
      </View>
      <View style={styles.copy}>
        <Text weight="bold">Due soon</Text>
        <Text color="#52606D">Today through the next 3 days</Text>
      </View>
      <Text weight="bold" color="#176B5B" style={styles.count}>{dueSoonCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 64, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DDE4E0', flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E6F0EB', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 2 },
  count: { fontSize: 24, lineHeight: 30, minWidth: 32, textAlign: 'right' },
});
