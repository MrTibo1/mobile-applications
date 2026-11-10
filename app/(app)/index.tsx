import { FeedbackMessage } from '../../src/components/common/FeedbackMessage';
import { HouseholdInvitationList } from '../../src/components/household/HouseholdInvitationList';
import { HouseholdMembers } from '../../src/components/household/HouseholdMembers';
import { HouseholdOwnerCard } from '../../src/components/household/HouseholdOwnerCard';
import { PageLoadingState } from '../../src/components/common/PageLoadingState';
import { PageContainer } from '../../src/components/common/PageContainer';
import { ReceiveInvitesPreference } from '../../src/components/household/ReceiveInvitesPreference';
import { StyledButton } from '../../src/components/common/StyledButton';
import { Card } from '../../src/components/primitives/Card';
import { InputField } from '../../src/components/primitives/InputField';
import { Text } from '../../src/components/primitives/Text';
import { useHouseholdOverviewController } from '../../src/hooks/useHouseholdOverviewController';
import { useAuthStore } from '../../src/state/useAuthStore';

export default function HouseholdOverviewScreen() {
  const user = useAuthStore((state) => state.user);
  const {
    household,
    isOnline,
    members,
    invites,
    isLoading,
    isSubmitting,
    workingInviteId,
    householdName,
    setHouseholdName,
    inviteEmail,
    setInviteEmail,
    error,
    notice,
    showLastMemberWarning,
    setShowLastMemberWarning,
    handleCreateHousehold,
    handleInvite,
    handleInviteResponse,
    finishLeavingHousehold,
  } = useHouseholdOverviewController(user);

  if (isLoading) return <PageLoadingState />;
  if (!user) {
    return (
      <PageContainer safeArea={false}>
        <FeedbackMessage message={error || 'Household details are unavailable.'} />
      </PageContainer>
    );
  }

  return (
    <PageContainer safeArea={false}>
      <Text size="xl" weight="bold">{household ? 'Household overview' : 'Welcome'}</Text>
      <Text color="#52606D">
        {household ? `Welcome, ${user.name}. Here is your household at a glance.` : `Welcome, ${user.name}.`}
      </Text>
      <FeedbackMessage message={error} />
      <FeedbackMessage message={notice} tone="success" />
      <HouseholdInvitationList
        invites={invites}
        workingInviteId={workingInviteId}
        disabled={!isOnline}
        onRespond={(invite, accept) => { void handleInviteResponse(invite, accept); }}
      />
      {household ? (
        <>
          <HouseholdOwnerCard
            name={
              members.find((member) => member.isOwner)?.name ??
              (household.ownerId === user.id ? user.name : 'Owner unavailable')
            }
          />
          <Card variant="callout">
            <Text size="lg" weight="bold">Invite someone to your household</Text>
            <Text size="sm" color="#52606D">Send a household invitation to their email address.</Text>
            <InputField
              label="Email address"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              editable={isOnline}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoComplete="email"
              autoCorrect={false}
            />
            <StyledButton label="Send invitation" onPress={handleInvite} isLoading={isSubmitting} disabled={!isOnline} />
          </Card>
          <HouseholdMembers members={members} currentUserId={user.id} />
          <Card>
            <Text size="lg" weight="bold">Leave household</Text>
            <Text size="sm" color="#52606D">Leave this household and its shared lists and tasks.</Text>
            <StyledButton
              label="Leave household"
              onPress={() => { void finishLeavingHousehold(false); }}
              variant="secondary"
              isLoading={isSubmitting}
              disabled={!isOnline}
            />
            {showLastMemberWarning ? (
              <Card>
                <Text weight="bold">You are the last household member</Text>
                <Text color="#52606D">
                  Leaving will permanently delete this household, its tasks, shopping lists and items, and invitations.
                  This cannot be undone.
                </Text>
                <StyledButton
                  label="Cancel"
                  onPress={() => setShowLastMemberWarning(false)}
                  variant="secondary"
                  disabled={isSubmitting}
                />
                <StyledButton
                  label="Leave & delete"
                  onPress={() => { void finishLeavingHousehold(true); }}
                  isLoading={isSubmitting}
                  disabled={!isOnline}
                />
              </Card>
            ) : null}
          </Card>
        </>
      ) : (
        <Card>
          <Text size="lg" weight="bold">Create a household</Text>
          <Text size="sm" color="#52606D">Create a household, then invite others by email.</Text>
          <InputField
            label="Household name"
            value={householdName}
            onChangeText={setHouseholdName}
            editable={isOnline}
            placeholder="My household"
            maxLength={80}
          />
          <StyledButton label="Create household" onPress={handleCreateHousehold} isLoading={isSubmitting} disabled={!isOnline} />
        </Card>
      )}
      {!household ? (
        <Card>
          <ReceiveInvitesPreference />
        </Card>
      ) : null}
    </PageContainer>
  );
}
