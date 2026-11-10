import { StyleSheet, View } from 'react-native';
import { Text } from '../primitives/Text';

interface OfflineNoticeProps {
  isOnline: boolean;
}

export function OfflineNotice({ isOnline }: OfflineNoticeProps) {
  if (isOnline) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text size="sm" weight="medium" color="#7A4A00">
        Cannot reach the server. Changes requiring a connection are unavailable.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#FFF3D6',
  },
});
