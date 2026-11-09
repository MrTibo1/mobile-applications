import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingStateProps {
  inline?: boolean;
}

export function LoadingState({ inline = false }: LoadingStateProps) {
  return (
    <View style={[styles.container, inline && styles.inline]}>
      <ActivityIndicator size="large" color="#176B5B" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8F6' },
  inline: { flex: 1, minHeight: 220, backgroundColor: 'transparent' },
});
