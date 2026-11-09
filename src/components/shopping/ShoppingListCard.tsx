import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { ShoppingListSummary } from '../../services/shoppingService';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

interface ShoppingListCardProps {
  list: ShoppingListSummary;
  onPress: () => void;
}

export function ShoppingListCard({ list, onPress }: ShoppingListCardProps) {
  return (
    <Card onPress={onPress} variant="listItem">
      <View style={styles.titleRow}>
        <Text size="lg" weight="bold" style={styles.title}>{list.title}</Text>
        <Text size="sm" weight="medium" color="#176B5B">{list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}</Text>
        <Ionicons name="chevron-forward" size={18} color="#87948E" />
      </View>
      {list.preview.length === 0 ? (
        <Text color="#52606D">No entries yet.</Text>
      ) : (
        <View style={styles.previewList}>
          {list.preview.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.previewRow}>
              <View style={styles.bullet} />
              <Text color="#52606D" numberOfLines={1} style={styles.previewItem}>{item}</Text>
            </View>
          ))}
          {list.hasMoreItems ? <Text size="sm" color="#69756F">…</Text> : null}
        </View>
      )}
      <Text size="sm" color="#69756F" style={styles.metadata}>
        Updated by {list.updatedByName} · {new Date(list.updatedAt).toLocaleString()}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1 },
  metadata: { marginTop: 3 },
  previewList: { gap: 2 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#52606D' },
  previewItem: { flex: 1 },
});
