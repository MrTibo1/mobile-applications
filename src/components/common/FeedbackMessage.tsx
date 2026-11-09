import { StyleSheet, View } from 'react-native';
import { Text } from '../primitives/Text';

interface FeedbackMessageProps {
  message: string;
  tone?: 'error' | 'success';
}

export function FeedbackMessage({ message, tone = 'error' }: FeedbackMessageProps) {
  if (!message) return null;

  return (
    <View style={[styles.container, styles[tone]]} accessibilityRole="alert">
      <Text size="sm" color={tone === 'error' ? '#B42318' : '#176B5B'}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  error: { backgroundColor: '#FEF3F2' },
  success: { backgroundColor: '#EAF5F1' },
});
