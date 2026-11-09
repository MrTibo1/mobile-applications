import { StyleSheet, View } from 'react-native';
import { Text } from '../primitives/Text';

interface TaskDueBadgeProps {
  deadline: string | null;
  isCompleted: boolean;
}

export function daysUntilDeadline(deadline: string): number | null {
  const dueDate = new Date(deadline);
  if (Number.isNaN(dueDate.getTime())) return null;

  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  return Math.round((dueDay - today) / 86_400_000);
}

export function TaskDueBadge({ deadline, isCompleted }: TaskDueBadgeProps) {
  if (!deadline || isCompleted) return null;

  const daysLeft = daysUntilDeadline(deadline);
  if (daysLeft === null || daysLeft > 3) return null;

  const isOverdue = daysLeft < 0;
  const message = isOverdue
    ? `Overdue by ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'day' : 'days'}`
    : daysLeft === 0
      ? 'Due today'
      : daysLeft === 1
        ? 'Due tomorrow'
        : `Due in ${daysLeft} days`;

  return (
    <View style={[styles.badge, isOverdue ? styles.overdue : styles.upcoming]}>
      <Text size="sm" weight="bold" color={isOverdue ? '#B42318' : '#8A4B08'}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  upcoming: { backgroundColor: '#FFF2CC' },
  overdue: { backgroundColor: '#FEF3F2' },
});
