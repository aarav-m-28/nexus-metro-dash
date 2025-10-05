import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role: string | null;
  course: string | null;
  section: string | null;
  year: number | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createProfile();
        } else {
          throw error;
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('[useProfile] Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;
    
    try {
      const profileData = {
        user_id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error('[useProfile] Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'role' | 'course' | 'section' | 'year'>>) => {
    if (!user || !profile) return null;

    if (profile.role && (profile.role.toLowerCase() === 'student' || profile.role.toLowerCase() === 'studen')) {
      toast({
        title: "Permission Denied",
        description: "Students are not allowed to edit their profile.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      return data;
    } catch (error) {
      console.error('[useProfile] Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return null;
    }
  };

  const clearAndRecreateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Delete existing profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error('[useProfile] Error deleting profile:', deleteError);
      }
      
      // Clear local state
      setProfile(null);
      
      // Create new profile
      await createProfile();
      
      toast({
        title: "Profile Reset",
        description: "Profile has been cleared and recreated"
      });
    } catch (error) {
      console.error('[useProfile] Error clearing and recreating profile:', error);
      toast({
        title: "Error",
        description: "Failed to reset profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully"
      });

      return true;
    } catch (error) {
      console.error('[useProfile] Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
      return false;
    }
  };

  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    changePassword,
    refetch: fetchProfile,
    clearAndRecreateProfile,
  };
}
