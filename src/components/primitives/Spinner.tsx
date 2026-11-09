import { ActivityIndicator, StyleSheet } from 'react-native';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export function Spinner({ size = 'small', color }: SpinnerProps) {
  return <ActivityIndicator size={size} color={color ?? '#176B5B'} style={styles.base} />;
}

const styles = StyleSheet.create({
  base: { alignSelf: 'center' },
});
