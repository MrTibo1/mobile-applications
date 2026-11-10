import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FeedbackMessage } from '../../src/components/common/FeedbackMessage';
import { FormPanel } from '../../src/components/common/FormPanel';
import { PageContainer } from '../../src/components/common/PageContainer';
import { PageLoadingState } from '../../src/components/common/PageLoadingState';
import { ReceiveInvitesPreference } from '../../src/components/household/ReceiveInvitesPreference';
import { StyledButton } from '../../src/components/common/StyledButton';
import { InputField } from '../../src/components/primitives/InputField';
import { Text } from '../../src/components/primitives/Text';
import { OfflineNotice } from '../../src/components/common/OfflineNotice';
import { reportNetworkFailure, useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { createHousehold } from '../../src/services/householdService';
import { useHouseholdShell } from '../../src/state/HouseholdShellContext';
import { useAuthStore } from '../../src/state/useAuthStore';

export default function HouseholdScreen() {
  const user = useAuthStore((state) => state.user);
  const isOnline = useNetworkStatus();
  const { household, isLoading: isHouseholdLoading, setHousehold } = useHouseholdShell();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [canReceiveInvites, setCanReceiveInvites] = useState(false);

  useEffect(() => {
    if (isHouseholdLoading) return;
    setCanReceiveInvites(!household);
    if (household) router.replace('/');
  }, [household, isHouseholdLoading]);

  const handleCreate = async () => {
    if (!isOnline) return;
    if (!user) return;
    setError('');
    setIsSaving(true);
    try {
      setHousehold(await createHousehold(name, user.id));
      router.replace('/');
    } catch (createError) {
      reportNetworkFailure(createError);
      setError(createError instanceof Error ? createError.message : 'Unable to create household.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isHouseholdLoading) return <PageLoadingState />;

  return (
    <PageContainer centered safeArea={false}>
      <OfflineNotice isOnline={isOnline} />
      <FormPanel>
        <Text size="xl" weight="bold">Set up your household</Text>
        <Text color="#52606D">Create a household, then invite other people by email.</Text>
        <InputField label="Household name" value={name} onChangeText={setName} placeholder="My household" maxLength={80} editable={isOnline} />
        <StyledButton label="Create household" onPress={handleCreate} isLoading={isSaving} disabled={!isOnline} />
        {canReceiveInvites ? <ReceiveInvitesPreference /> : null}
        <FeedbackMessage message={error} />
      </FormPanel>
    </PageContainer>
  );
}
