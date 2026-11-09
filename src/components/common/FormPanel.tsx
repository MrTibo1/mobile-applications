import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function FormPanel({ children }: PropsWithChildren) {
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: 24,
    gap: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#182722',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
});
