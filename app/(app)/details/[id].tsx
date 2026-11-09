import { useLocalSearchParams } from 'expo-router';
import { PageContainer } from '../../../src/components/common/PageContainer';
import { Text } from '../../../src/components/primitives/Text';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PageContainer safeArea={false}>
      <Text size="xl" weight="bold">Item details</Text>
      <Text size="sm" color="#69756F">Item {id}</Text>
      <Text color="#52606D">Details for this item are not available yet.</Text>
    </PageContainer>
  );
}

