export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; updated_at: string | null; username: string | null; full_name: string | null; allow_receive_invites: boolean };
        Insert: { id: string; updated_at?: string | null; username?: string | null; full_name?: string | null; allow_receive_invites?: boolean };
        Update: { id?: string; updated_at?: string | null; username?: string | null; full_name?: string | null; allow_receive_invites?: boolean };
        Relationships: [];
      };
      households: {
        Row: { id: number; created_at: string; name: string; owner_id: string };
        Insert: { id?: number; created_at?: string; name?: string; owner_id: string };
        Update: { id?: number; created_at?: string; name?: string; owner_id?: string };
        Relationships: [];
      };
      household_invites: {
        Row: {
          id: string;
          household_id: number;
          invited_email: string;
          invited_by: string;
          status: 'pending' | 'accepted' | 'ignored';
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          household_id: number;
          invited_email: string;
          invited_by: string;
          status?: 'pending' | 'accepted' | 'ignored';
          created_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          household_id?: number;
          invited_email?: string;
          invited_by?: string;
          status?: 'pending' | 'accepted' | 'ignored';
          created_at?: string;
          responded_at?: string | null;
        };
        Relationships: [];
      };
      household_members: {
        Row: { household_id: number; user_id: string; joined_at: string };
        Insert: { household_id: number; user_id: string; joined_at?: string };
        Update: { household_id?: number; user_id?: string; joined_at?: string };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: number;
          updated_at: string;
          household_id: number;
          message: string;
          deadline: string | null;
          updated_by: string;
          is_completed: boolean;
        };
        Insert: {
          id?: number;
          updated_at?: string;
          household_id: number;
          message: string;
          deadline?: string | null;
          updated_by: string;
          is_completed?: boolean;
        };
        Update: {
          id?: number;
          updated_at?: string;
          household_id?: number;
          message?: string;
          deadline?: string | null;
          updated_by?: string;
          is_completed?: boolean;
        };
        Relationships: [];
      };
      shopping_lists: {
        Row: {
          id: number;
          household_id: number;
          title: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          id?: number;
          household_id: number;
          title: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          id?: number;
          household_id?: number;
          title?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [];
      };
      shopping_list_items: {
        Row: {
          id: number;
          shopping_list_id: number;
          name: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          id?: number;
          shopping_list_id: number;
          name: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          id?: number;
          shopping_list_id?: number;
          name?: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_household: {
        Args: { p_name: string };
        Returns: { household_id: number }[];
      };
      invite_household_member: {
        Args: { p_email: string };
        Returns: string;
      };
      get_pending_household_invites: {
        Args: Record<PropertyKey, never>;
        Returns: {
          invite_id: string;
          household_id: number;
          household_name: string;
          invited_by: string;
          inviter_username: string;
          inviter_email: string;
          created_at: string;
        }[];
      };
      accept_household_invite: {
        Args: { p_invite_id: string };
        Returns: number;
      };
      ignore_household_invite: {
        Args: { p_invite_id: string };
        Returns: undefined;
      };
      get_receive_invites_preference: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      set_receive_invites_preference: {
        Args: { p_enabled: boolean };
        Returns: undefined;
      };
      leave_household: {
        Args: { p_confirm_delete: boolean };
        Returns: boolean;
      };
      is_household_member: {
        Args: { p_household_id: number };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
