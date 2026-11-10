import { router, useLocalSearchParams, type Href } from 'expo-router';
import { AddNewListEntryButton } from '../../../src/components/common/AddNewListEntryButton';
import { FeedbackMessage } from '../../../src/components/common/FeedbackMessage';
import { ListGroup } from '../../../src/components/shopping/ListGroup';
import { NewListEntryRow } from '../../../src/components/shopping/NewListEntryRow';
import { PageContainer } from '../../../src/components/common/PageContainer';
import { PageLoadingState } from '../../../src/components/common/PageLoadingState';
import { ShoppingListBackButton } from '../../../src/components/shopping/ShoppingListBackButton';
import { ShoppingListItemRow } from '../../../src/components/shopping/ShoppingListItemRow';
import { Text } from '../../../src/components/primitives/Text';
import { useShoppingListController } from '../../../src/hooks/useShoppingListController';
import { useNetworkStatus } from '../../../src/hooks/useNetworkStatus';
import { useAuthStore } from '../../../src/state/useAuthStore';

export default function ShoppingListDetailScreen() {
  const user = useAuthStore((state) => state.user);
  const isOnline = useNetworkStatus();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    household,
    list,
    items,
    isDraftActive,
    draftKey,
    isLoading,
    isSaving,
    pendingItemIds,
    error,
    handleCommitNewItem,
    handleAddNewItem,
    handleEditItem,
    handleToggleItem,
    updateDraftItemName,
  } = useShoppingListController(user, Number(id));

  if (isLoading) return <PageLoadingState />;
  if (!household || !list || !user) {
    return (
      <PageContainer safeArea={false}>
        <ShoppingListBackButton onPress={() => router.replace('/shopping' as Href)} />
        <FeedbackMessage message={error || 'Shopping list details are unavailable.'} />
      </PageContainer>
    );
  }

  return (
    <PageContainer safeArea={false}>
      <ShoppingListBackButton onPress={() => router.replace('/shopping' as Href)} />
      <Text size="xl" weight="bold">{list.title}</Text>
      <Text size="sm" color="#69756F">
        Updated by {list.updatedByName} · {new Date(list.updatedAt).toLocaleString()}
      </Text>
      <FeedbackMessage message={error} />
      <Text size="lg" weight="bold">Items ({items.length})</Text>
      <ListGroup>
        {items.length === 0 ? (
          <Text color="#69756F">No items yet. Add one to get started.</Text>
        ) : items.map((item) => (
          <ShoppingListItemRow
            key={item.id}
            item={item}
            disabled={!isOnline || pendingItemIds.has(item.id)}
            onToggle={() => { void handleToggleItem(item); }}
            onEdit={(name) => handleEditItem(item, name)}
          />
        ))}
        {isDraftActive ? (
          <NewListEntryRow
            key={draftKey}
            accessibilityLabel="New shopping item"
            placeholder="New item"
            maxLength={160}
            autoCapitalize="sentences"
            onDraftChange={updateDraftItemName}
            onCommit={handleCommitNewItem}
            disabled={!isOnline}
          />
        ) : null}
        <AddNewListEntryButton
          accessibilityLabel="Add new shopping item"
          disabled={!isOnline || isSaving}
          onPress={() => { void handleAddNewItem(); }}
        />
      </ListGroup>
    </PageContainer>
  );
}
