import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from './Text';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <Pressable onPress={() => onChange(!checked)} style={styles.container}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text size="sm" weight="bold" color="#FFFFFF">✓</Text>}
      </View>
      <Text size="md">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
  box: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#A4B1AA', borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  boxChecked: { borderColor: '#176B5B', backgroundColor: '#176B5B' },
});
