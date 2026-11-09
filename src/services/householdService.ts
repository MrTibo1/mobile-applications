import { getSupabaseClient } from './supabaseClient';

export interface Household {
  id: number;
  name: string;
  ownerId: string;
}

export interface PendingHouseholdInvite {
  inviteId: string;
  householdId: number;
  householdName: string;
  invitedBy: string;
  inviterUsername: string;
  inviterEmail: string;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  isOwner: boolean;
  joinedAt: string;
}

export async function getHouseholdForUser(userId: string): Promise<Household | null> {
  const client = getSupabaseClient();
  const { data: membership, error: membershipError } = await client
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data, error } = await client
    .from('households')
    .select('id, name, owner_id')
    .eq('id', membership.household_id)
    .single();

  if (error) throw error;
  return { id: data.id, name: data.name, ownerId: data.owner_id };
}

export async function getHouseholdMembers(
  householdId: number,
  ownerId: string,
): Promise<HouseholdMember[]> {
  const client = getSupabaseClient();
  const { data: memberships, error: membershipError } = await client
    .from('household_members')
    .select('user_id, joined_at')
    .eq('household_id', householdId)
    .order('joined_at', { ascending: true });

  if (membershipError) throw membershipError;
  if (!memberships?.length) return [];

  const { data: profiles, error: profileError } = await client
    .from('profiles')
    .select('id, username, full_name')
    .in('id', memberships.map((membership) => membership.user_id));

  if (profileError) throw profileError;
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  return memberships.map((membership) => {
    const profile = profilesById.get(membership.user_id);
    return {
      id: membership.user_id,
      name: profile?.username || profile?.full_name || 'Household member',
      isOwner: membership.user_id === ownerId,
      joinedAt: membership.joined_at,
    };
  });
}

export async function createHousehold(name: string, ownerId: string): Promise<Household> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Enter a household name.');

  const { data, error } = await getSupabaseClient().rpc('create_household', { p_name: cleanName });
  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result.household_id !== 'number') {
    throw new Error('The server returned an invalid household response.');
  }

  return { id: result.household_id, name: cleanName, ownerId };
}

export async function inviteHouseholdMember(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Enter a valid email address.');
  }

  const { error } = await getSupabaseClient().rpc('invite_household_member', { p_email: cleanEmail });
  if (error) throw error;
}

export async function getPendingHouseholdInvites(): Promise<PendingHouseholdInvite[]> {
  const { data, error } = await getSupabaseClient().rpc('get_pending_household_invites');
  if (error) throw error;

  return (data ?? []).map((invite) => ({
    inviteId: invite.invite_id,
    householdId: invite.household_id,
    householdName: invite.household_name,
    invitedBy: invite.invited_by,
    inviterUsername: invite.inviter_username,
    inviterEmail: invite.inviter_email,
    createdAt: invite.created_at,
  }));
}

export async function acceptHouseholdInvite(inviteId: string): Promise<number> {
  const { data, error } = await getSupabaseClient().rpc('accept_household_invite', { p_invite_id: inviteId });
  if (error) throw error;
  if (typeof data !== 'number') throw new Error('The server returned an invalid invite response.');
  return data;
}

export async function ignoreHouseholdInvite(inviteId: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc('ignore_household_invite', { p_invite_id: inviteId });
  if (error) throw error;
}

export async function getReceiveInvitesPreference(): Promise<boolean> {
  const { data, error } = await getSupabaseClient().rpc('get_receive_invites_preference');
  if (error) throw error;
  return data;
}

export async function setReceiveInvitesPreference(enabled: boolean): Promise<void> {
  const { error } = await getSupabaseClient().rpc('set_receive_invites_preference', { p_enabled: enabled });
  if (error) throw error;
}

export async function leaveHousehold(confirmDelete: boolean): Promise<boolean> {
  const { data, error } = await getSupabaseClient().rpc('leave_household', {
    p_confirm_delete: confirmDelete,
  });
  if (error) throw error;
  if (typeof data !== 'boolean') throw new Error('The server returned an invalid leave-household response.');
  return data;
}
