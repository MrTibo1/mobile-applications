import { View, Pressable, StyleSheet } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'section' | 'listItem' | 'callout';
}

export function Card({ children, onPress, variant = 'section' }: CardProps) {
  const cardStyle = [styles.base, styles[variant]];
  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { gap: 10 },
  section: {},
  listItem: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DDE4E0' },
  callout: { padding: 14, borderRadius: 10, backgroundColor: '#FEF3F2' },
  pressed: { opacity: 0.72 },
});
