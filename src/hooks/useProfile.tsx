import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  department: string | null;
  job_title: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  console.log('[useProfile] Hook initialized');
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('[useProfile] State initialized:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    profile: profile ? 'exists' : 'null',
    loading 
  });

  const fetchProfile = async () => {
    if (!user) {
      console.log('[useProfile] No user, skipping profile fetch');
      setProfile(null);
      setLoading(false);
      return;
    }
    
    console.log('[useProfile] Fetching profile for user:', user.id);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('[useProfile] Profile fetch result:', { 
        hasData: !!data, 
        error: error?.message,
        data: data ? {
          id: data.id,
          display_name: data.display_name,
          department: data.department,
          job_title: data.job_title,
          email: data.email
        } : null
      });

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          console.log('[useProfile] No profile found, creating new one');
          await createProfile();
        } else {
          throw error;
        }
      } else if (data) {
        console.log('[useProfile] Profile found and set:', {
          display_name: data.display_name,
          department: data.department,
          job_title: data.job_title
        });
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
    
    console.log('[useProfile] Creating profile for user:', {
      userId: user.id,
      email: user.email,
      displayName: user.user_metadata?.display_name,
      emailPrefix: user.email?.split('@')[0]
    });
    
    try {
      const profileData = {
        user_id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
        department: null,
        job_title: null,
      };
      
      console.log('[useProfile] Inserting profile data:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      console.log('[useProfile] Profile creation result:', { 
        hasData: !!data, 
        error: error?.message,
        data: data ? {
          display_name: data.display_name,
          department: data.department,
          job_title: data.job_title
        } : null
      });

      if (error) throw error;
      
      setProfile(data);
      console.log('[useProfile] Profile created and set successfully');
    } catch (error) {
      console.error('[useProfile] Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'department' | 'job_title' | 'avatar_url'>>) => {
    if (!user || !profile) return null;

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
    
    console.log('[useProfile] Clearing and recreating profile for user:', user.id);
    setLoading(true);
    
    try {
      // Delete existing profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error('[useProfile] Error deleting profile:', deleteError);
      } else {
        console.log('[useProfile] Profile deleted successfully');
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