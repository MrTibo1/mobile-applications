import { useCallback, useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import {
  acceptHouseholdInvite,
  createHousehold,
  getHouseholdForUser,
  getHouseholdMembers,
  getPendingHouseholdInvites,
  ignoreHouseholdInvite,
  inviteHouseholdMember,
  leaveHousehold,
  type Household,
  type HouseholdMember,
  type PendingHouseholdInvite,
} from '../services/householdService';
import { useHouseholdShell } from '../state/HouseholdShellContext';
import type { User } from '../types/User';

export function useHouseholdOverviewController(user: User | null) {
  const { setHousehold: setShellHousehold } = useHouseholdShell();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [invites, setInvites] = useState<PendingHouseholdInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workingInviteId, setWorkingInviteId] = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showLastMemberWarning, setShowLastMemberWarning] = useState(false);

  const loadOverview = useCallback(async () => {
    if (!user) return;
    const [currentHousehold, pendingInvites] = await Promise.all([
      getHouseholdForUser(user.id),
      getPendingHouseholdInvites(),
    ]);
    setShellHousehold(currentHousehold);
    const householdMembers = currentHousehold
      ? await getHouseholdMembers(currentHousehold.id, currentHousehold.ownerId)
      : [];
    setHousehold(currentHousehold);
    setShellHousehold(currentHousehold);
    setMembers(householdMembers);
    setInvites(pendingInvites);
  }, [setShellHousehold, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const load = async () => {
      try {
        await loadOverview();
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load household.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [user, loadOverview]);

  const handleCreateHousehold = async () => {
    if (!user) return;
    setError('');
    setIsSubmitting(true);
    try {
      await createHousehold(householdName, user.id);
      setHouseholdName('');
      await loadOverview();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create household.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async () => {
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      await inviteHouseholdMember(inviteEmail);
      setInviteEmail('');
      setNotice('Invitation sent.');
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : 'Unable to send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteResponse = async (invite: PendingHouseholdInvite, accept: boolean) => {
    setError('');
    setWorkingInviteId(invite.inviteId);
    try {
      if (accept) await acceptHouseholdInvite(invite.inviteId);
      else await ignoreHouseholdInvite(invite.inviteId);
      await loadOverview();
    } catch (responseError) {
      setError(responseError instanceof Error ? responseError.message : 'Unable to respond to invitation.');
    } finally {
      setWorkingInviteId(null);
    }
  };

  const finishLeavingHousehold = async (confirmDelete: boolean) => {
    setError('');
    setIsSubmitting(true);
    try {
      const leftHousehold = await leaveHousehold(confirmDelete);
      if (leftHousehold) {
        setHousehold(null);
        setShellHousehold(null);
        router.replace('/(app)/household' as Href);
      } else if (confirmDelete) {
        setError('Unable to delete the household. Please try again.');
      } else {
        setShowLastMemberWarning(true);
      }
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : 'Unable to leave household.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    household,
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
  };
}
