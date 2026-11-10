import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../primitives/Text';

interface ShoppingSectionHeaderProps {
  title: string;
  addAccessibilityLabel: string;
  disabled?: boolean;
  onAdd: () => void;
}

export function ShoppingSectionHeader({
  title,
  addAccessibilityLabel,
  disabled = false,
  onAdd,
}: ShoppingSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text size="lg" weight="bold">{title}</Text>
      <Pressable
        style={[styles.addButton, disabled && styles.disabled]}
        onPress={onAdd}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={addAccessibilityLabel}
      >
        <Ionicons name="add" size={18} color="#176B5B" />
        <Text size="sm" weight="medium" color="#176B5B">New list</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#E9EFEB' },
  disabled: { opacity: 0.6 },
});
