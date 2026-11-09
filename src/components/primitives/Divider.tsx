import { View, StyleSheet } from 'react-native';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function Divider({ orientation = 'horizontal', spacing = 'none' }: DividerProps) {
  return (
    <View
      style={[
        styles.base,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        styles[`spacing_${spacing}` as keyof typeof styles],
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: '#DDE4E0' },
  horizontal: { height: StyleSheet.hairlineWidth, width: '100%' },
  vertical: { width: StyleSheet.hairlineWidth, height: '100%' },
  spacing_none: {},
  spacing_sm: { marginVertical: 4, marginHorizontal: 4 },
  spacing_md: { marginVertical: 8, marginHorizontal: 8 },
  spacing_lg: { marginVertical: 16, marginHorizontal: 16 },
});
