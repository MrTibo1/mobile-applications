import { View, StyleSheet } from 'react-native';
import { Text } from './Text';

interface ToastProps {
  message: string;
  variant?: 'default' | 'success' | 'error';
  visible: boolean;
}

export function Toast({ message, variant = 'default', visible }: ToastProps) {
  if (!visible) return null;

  return (
    <View style={[styles.base, styles[variant]]}>
      <Text size="sm" weight="medium" color="#FFFFFF">{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { position: 'absolute', bottom: 24, left: 16, right: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, elevation: 4, shadowColor: '#182722', shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  default: { backgroundColor: '#29443B' },
  success: { backgroundColor: '#176B5B' },
  error: { backgroundColor: '#B42318' },
});
