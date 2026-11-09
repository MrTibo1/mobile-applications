import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

interface HouseholdOwnerCardProps {
  name: string;
}

export function HouseholdOwnerCard({ name }: HouseholdOwnerCardProps) {
  return (
    <Card>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Ionicons name="person" size={20} color="#176B5B" />
        </View>
        <View style={styles.details}>
          <Text size="sm" weight="medium" color="#69756F">HOUSEHOLD OWNER</Text>
          <Text size="lg" weight="bold">{name}</Text>
        </View>
        <View style={styles.badge}>
          <Text size="sm" weight="bold" color="#176B5B">Owner</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF5F1' },
  details: { flex: 1, gap: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#EAF5F1' },
});
