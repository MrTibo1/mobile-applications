import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function ListGroup({ children }: PropsWithChildren) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  group: { gap: 0 },
});
