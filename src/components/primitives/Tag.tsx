import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';

interface TagProps {
  label: string;
  onRemove?: () => void;
}

export function Tag({ label, onRemove }: TagProps) {
  return (
    <View style={styles.base}>
      <Text size="sm" weight="medium" color="#52645D">{label}</Text>
      {onRemove !== undefined && (
        <Pressable
          onPress={onRemove}
          style={styles.removeButton}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
        >
          <Text size="sm" color="#52645D">×</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 4, paddingVertical: 4, borderRadius: 999, backgroundColor: '#E9EFEB' },
  removeButton: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
});
