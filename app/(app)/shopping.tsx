import { useCallback, useState } from 'react';
import { router, useFocusEffect, type Href } from 'expo-router';
import { FeedbackMessage } from '../../src/components/common/FeedbackMessage';
import { ListGroup } from '../../src/components/shopping/ListGroup';
import { PageContainer } from '../../src/components/common/PageContainer';
import { PageLoadingState } from '../../src/components/common/PageLoadingState';
import { ShoppingEntryDialog } from '../../src/components/shopping/ShoppingEntryDialog';
import { ShoppingListCard } from '../../src/components/shopping/ShoppingListCard';
import { ShoppingSectionHeader } from '../../src/components/shopping/ShoppingSectionHeader';
import { Text } from '../../src/components/primitives/Text';
import { getHouseholdForUser, type Household } from '../../src/services/householdService';
import {
  createShoppingList,
  getShoppingLists,
  type ShoppingListSummary,
} from '../../src/services/shoppingService';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useHouseholdShell } from '../../src/state/HouseholdShellContext';

export default function ShoppingListsScreen() {
  const user = useAuthStore((state) => state.user);
  const { setHousehold: setShellHousehold } = useHouseholdShell();
  const [household, setHousehold] = useState<Household | null>(null);
  const [lists, setLists] = useState<ShoppingListSummary[]>([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const reloadLists = useCallback(async (householdId: number) => {
    setLists(await getShoppingLists(householdId));
  }, []);

  useFocusEffect(useCallback(() => {
    if (!user) return undefined;
    let active = true;

    const load = async () => {
      setError('');
      try {
        const currentHousehold = await getHouseholdForUser(user.id);
        if (!active) return;
        if (!currentHousehold) {
          setShellHousehold(null);
          router.replace('/(app)/household' as Href);
          return;
        }
        setShellHousehold(currentHousehold);
        const householdLists = await getShoppingLists(currentHousehold.id);
        if (active) {
          setHousehold(currentHousehold);
          setShellHousehold(currentHousehold);
          setLists(householdLists);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load shopping lists.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [setShellHousehold, user]));

  const handleCreateList = async () => {
    if (!household || !user) return;
    setError('');
    setIsSaving(true);
    try {
      await createShoppingList(household.id, user.id, title);
      setTitle('');
      setIsDialogVisible(false);
      try {
        await reloadLists(household.id);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? `The list was created, but the overview could not be refreshed: ${loadError.message}`
            : 'The list was created, but the overview could not be refreshed.',
        );
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create shopping list.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDialog = () => {
    setError('');
    setTitle('');
    setIsDialogVisible(true);
  };

  const closeDialog = () => {
    if (isSaving) return;
    setIsDialogVisible(false);
    setTitle('');
    setError('');
  };

  if (isLoading) return <PageLoadingState />;
  if (!household || !user) {
    return (
      <PageContainer safeArea={false}>
        <FeedbackMessage message={error || 'Household details are unavailable.'} />
      </PageContainer>
    );
  }

  return (
    <PageContainer safeArea={false}>
      <Text size="xl" weight="bold">Shopping lists</Text>
      <Text color="#52606D">Shared shopping lists for your household.</Text>
      <FeedbackMessage message={error} />
      <ShoppingSectionHeader
        title="Your lists"
        addAccessibilityLabel="Create shopping list"
        onAdd={openDialog}
      />
      <ListGroup>
        {lists.length === 0 ? (
          <Text color="#69756F">No shopping lists yet. Create one to get started.</Text>
        ) : lists.map((list) => (
          <ShoppingListCard
            key={list.id}
            list={list}
            onPress={() => router.push(`/shopping/${list.id}` as Href)}
          />
        ))}
      </ListGroup>
      <ShoppingEntryDialog
        visible={isDialogVisible}
        title="New shopping list"
        fieldLabel="List title"
        placeholder="For example, Weekly groceries"
        submitLabel="Create list"
        value={title}
        error={error}
        isSaving={isSaving}
        onClose={closeDialog}
        onValueChange={(value) => {
          setTitle(value);
          setError('');
        }}
        onSubmit={() => void handleCreateList()}
      />
    </PageContainer>
  );
}
