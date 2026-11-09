import { ScrollView, View, StyleSheet } from 'react-native';

interface ScreenProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  scrollable?: boolean;
}

export function Screen({ children, padding = 'md', scrollable = true }: ScreenProps) {
  if (!scrollable) {
    return (
      <View style={[styles.container, styles[padding]]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, styles[padding]]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F6F8F6' },
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  content: { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center' },
  none: {},
  sm: { padding: 8 },
  md: { padding: 16 },
  lg: { padding: 24 },
});
