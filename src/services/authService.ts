import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types/User';
import { getSupabaseClient } from './supabaseClient';

function mapUser(authUser: SupabaseUser): User {
  const email = authUser.email ?? '';
  const username = authUser.user_metadata.username;

  return {
    id: authUser.id,
    email,
    name: typeof username === 'string' && username.length > 0 ? username : email.split('@')[0],
  };
}

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return mapUser(data.user);
}

export async function register(email: string, password: string, username: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: { data: { username: username.trim() } },
  });
  if (error) throw error;
}

export async function logout(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session ? mapUser(data.session.user) : null;
}

export function subscribeToAuthChanges(listener: (user: User | null) => void): () => void {
  const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session: Session | null) => {
    listener(session ? mapUser(session.user) : null);
  });
  return () => data.subscription.unsubscribe();
}
