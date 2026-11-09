import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PageContainerProps extends PropsWithChildren {
  centered?: boolean;
  safeArea?: boolean;
}

export function PageContainer({ children, centered = false, safeArea = true }: PageContainerProps) {
  const content = (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.content, centered && styles.centered]}>{children}</View>
    </ScrollView>
  );

  if (!safeArea) return <View style={styles.safeArea}>{content}</View>;
  return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F8F6' },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  content: { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, gap: 18 },
  centered: { justifyContent: 'center' },
});
