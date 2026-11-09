import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';

interface NavItemProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: string;
}

export function NavItem({ label, onPress, active = false }: NavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, active && styles.active, pressed && styles.pressed]}
    >
      <Text size="md" weight={active ? 'bold' : 'medium'} color={active ? '#176B5B' : '#52645D'}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  active: { borderBottomColor: '#176B5B' },
  pressed: { opacity: 0.72 },
});
