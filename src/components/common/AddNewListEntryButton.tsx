import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../primitives/Text';

interface AddNewListEntryButtonProps {
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}

export function AddNewListEntryButton({
  accessibilityLabel,
  disabled = false,
  onPress,
}: AddNewListEntryButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.content}>
        <Ionicons name="add" size={22} color="#176B5B" />
        <Text weight="medium" color="#176B5B">Add new</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disabled: { opacity: 0.6 },
});
