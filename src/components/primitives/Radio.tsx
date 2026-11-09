import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from './Text';

interface RadioProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
}

export function Radio({ label, value, selected, onSelect }: RadioProps) {
  return (
    <Pressable onPress={() => onSelect(value)} style={styles.container}>
      <View style={[styles.circle, selected && styles.circleSelected]}>
        {selected && <View style={styles.dot} />}
      </View>
      <Text size="md">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
  circle: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#A4B1AA', borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  circleSelected: { borderColor: '#176B5B' },
  dot: { width: 10, height: 10, borderRadius: 999, backgroundColor: '#176B5B' },
});
