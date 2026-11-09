import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Text } from '../primitives/Text';

interface StyledButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function StyledButton({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  testID,
}: StyledButtonProps) {
  const isDisabled = disabled || isLoading;
  const textColor = variant === 'primary' ? '#FFFFFF' : '#29443B';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      testID={testID}
      accessibilityRole="button"
    >
      {isLoading ? <ActivityIndicator color={textColor} /> : <Text weight="bold" color={textColor}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 9 },
  primary: { backgroundColor: '#176B5B' },
  secondary: { backgroundColor: '#EDF2EF' },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.84 },
});
