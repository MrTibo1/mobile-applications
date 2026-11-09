import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FeedbackMessage } from '../../src/components/common/FeedbackMessage';
import { FormPanel } from '../../src/components/common/FormPanel';
import { PageContainer } from '../../src/components/common/PageContainer';
import { ReceiveInvitesPreference } from '../../src/components/household/ReceiveInvitesPreference';
import { StyledButton } from '../../src/components/common/StyledButton';
import { InputField } from '../../src/components/primitives/InputField';
import { Text } from '../../src/components/primitives/Text';
import { createHousehold, getHouseholdForUser } from '../../src/services/householdService';
import { useHouseholdShell } from '../../src/state/HouseholdShellContext';
import { useAuthStore } from '../../src/state/useAuthStore';

export default function HouseholdScreen() {
  const user = useAuthStore((state) => state.user);
  const { setHousehold } = useHouseholdShell();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canReceiveInvites, setCanReceiveInvites] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setCanReceiveInvites(false);
    void getHouseholdForUser(user.id)
      .then((household) => {
        if (active) {
          setHousehold(household);
          setCanReceiveInvites(!household);
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load household.');
      });

    return () => { active = false; };
  }, [setHousehold, user]);

  const handleCreate = async () => {
    if (!user) return;
    setError('');
    setIsLoading(true);
    try {
      setHousehold(await createHousehold(name, user.id));
      router.replace('/');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create household.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer centered safeArea={false}>
      <FormPanel>
        <Text size="xl" weight="bold">Set up your household</Text>
        <Text color="#52606D">Create a household, then invite other people by email.</Text>
        <InputField label="Household name" value={name} onChangeText={setName} placeholder="My household" maxLength={80} />
        <StyledButton label="Create household" onPress={handleCreate} isLoading={isLoading} />
        {canReceiveInvites ? <ReceiveInvitesPreference /> : null}
        <FeedbackMessage message={error} />
      </FormPanel>
    </PageContainer>
  );
}
