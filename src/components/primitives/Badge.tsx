import { View, StyleSheet } from 'react-native';
import { Text } from './Text';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const textColor = {
    default: '#52645D',
    success: '#176B5B',
    warning: '#8A4B08',
    error: '#B42318',
  }[variant];

  return (
    <View style={[styles.base, styles[variant]]}>
      <Text size="sm" weight="medium" color={textColor}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  default: {
    backgroundColor: '#E9EFEB',
  },
  success: {
    backgroundColor: '#E6F0EB',
  },
  warning: {
    backgroundColor: '#FFF2CC',
  },
  error: {
    backgroundColor: '#FEF3F2',
  },
});
