import { useCallback, useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import {
  acceptHouseholdInvite,
  createHousehold,
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
import { reportNetworkFailure, useNetworkStatus } from './useNetworkStatus';
import type { User } from '../types/User';

export function useHouseholdOverviewController(user: User | null) {
  const {
    household,
    isLoading: isHouseholdLoading,
    refreshHousehold,
    setHousehold,
  } = useHouseholdShell();
  const isOnline = useNetworkStatus();
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

  const loadOverview = useCallback(async (currentHousehold: Household | null = household) => {
    if (!user) return;
    const [householdMembers, pendingInvites] = await Promise.all([
      currentHousehold
        ? getHouseholdMembers(currentHousehold.id, currentHousehold.ownerId)
        : Promise.resolve([]),
      getPendingHouseholdInvites(),
    ]);
    setMembers(householdMembers);
    setInvites(pendingInvites);
  }, [household, user]);

  useEffect(() => {
    if (!user || isHouseholdLoading) return;
    let active = true;

    const load = async () => {
      if (!isOnline) {
        setMembers([]);
        setInvites([]);
        if (active) setIsLoading(false);
        return;
      }

      setError('');
      try {
        await loadOverview();
      } catch (loadError) {
        reportNetworkFailure(loadError);
        if (active && household) {
          setError('Unable to refresh household details. Showing the saved household.');
        } else if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load household.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [household, isOnline, isHouseholdLoading, user, loadOverview]);

  const handleCreateHousehold = async () => {
    if (!isOnline) return;
    if (!user) return;
    setError('');
    setIsSubmitting(true);
    try {
      const createdHousehold = await createHousehold(householdName, user.id);
      setHousehold(createdHousehold);
      setHouseholdName('');
      const currentHousehold = await refreshHousehold();
      await loadOverview(currentHousehold);
    } catch (createError) {
      reportNetworkFailure(createError);
      setError(createError instanceof Error ? createError.message : 'Unable to create household.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async () => {
    if (!isOnline) return;
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      await inviteHouseholdMember(inviteEmail);
      setInviteEmail('');
      setNotice('Invitation sent.');
    } catch (inviteError) {
      reportNetworkFailure(inviteError);
      setError(inviteError instanceof Error ? inviteError.message : 'Unable to send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteResponse = async (invite: PendingHouseholdInvite, accept: boolean) => {
    if (!isOnline) return;
    setError('');
    setWorkingInviteId(invite.inviteId);
    try {
      if (accept) await acceptHouseholdInvite(invite.inviteId);
      else await ignoreHouseholdInvite(invite.inviteId);
      const currentHousehold = accept ? await refreshHousehold() : household;
      await loadOverview(currentHousehold);
    } catch (responseError) {
      reportNetworkFailure(responseError);
      setError(responseError instanceof Error ? responseError.message : 'Unable to respond to invitation.');
    } finally {
      setWorkingInviteId(null);
    }
  };

  const finishLeavingHousehold = async (confirmDelete: boolean) => {
    if (!isOnline) return;
    setError('');
    setIsSubmitting(true);
    try {
      const leftHousehold = await leaveHousehold(confirmDelete);
      if (leftHousehold) {
        setHousehold(null);
        router.replace('/(app)/household' as Href);
      } else if (confirmDelete) {
        setError('Unable to delete the household. Please try again.');
      } else {
        setShowLastMemberWarning(true);
      }
    } catch (leaveError) {
      reportNetworkFailure(leaveError);
      setError(leaveError instanceof Error ? leaveError.message : 'Unable to leave household.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
