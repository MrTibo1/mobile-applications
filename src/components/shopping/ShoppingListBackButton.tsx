import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../primitives/Text';

interface ShoppingListBackButtonProps {
  onPress: () => void;
}

export function ShoppingListBackButton({ onPress }: ShoppingListBackButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Back to shopping lists"
    >
      <Ionicons name="arrow-back" size={18} color="#176B5B" />
      <Text weight="medium" color="#176B5B">All shopping lists</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 40, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8 },
});
