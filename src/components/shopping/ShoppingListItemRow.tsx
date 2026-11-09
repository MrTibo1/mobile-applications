import { Pressable, StyleSheet, View } from 'react-native';
import type { ShoppingListItem } from '../../services/shoppingService';
import { Card } from '../primitives/Card';
import { EditableListText } from './EditableListText';
import { Text } from '../primitives/Text';

interface ShoppingListItemRowProps {
  item: ShoppingListItem;
  disabled?: boolean;
  onToggle: () => void;
  onEdit: (name: string) => Promise<boolean>;
}

export function ShoppingListItemRow({
  item,
  disabled = false,
  onToggle,
  onEdit,
}: ShoppingListItemRowProps) {
  return (
    <Card variant="listItem">
      <View style={styles.row}>
        <Pressable
          style={[styles.checkbox, item.isCompleted && styles.checkboxDone, disabled && styles.disabled]}
          onPress={onToggle}
          disabled={disabled}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.isCompleted }}
          accessibilityLabel={`Mark ${item.name} ${item.isCompleted ? 'not purchased' : 'purchased'}`}
        >
          {item.isCompleted ? <Text weight="bold" color="#FFFFFF">✓</Text> : null}
        </Pressable>
        <EditableListText
          value={item.name}
          accessibilityLabel={`Edit shopping item: ${item.name}`}
          onCommit={onEdit}
          disabled={disabled}
          completed={item.isCompleted}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#8A9691', alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#176B5B', borderColor: '#176B5B' },
  disabled: { opacity: 0.7 },
});
