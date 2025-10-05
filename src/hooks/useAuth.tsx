import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { role: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test Supabase connection first
    console.log('[useAuth] Testing Supabase connection...');
    supabase.from('profiles').select('count').limit(1).then(({ data, error }) => {
      if (error) {
        console.error('[useAuth] Supabase connection failed:', error);
      } else {
        console.log('[useAuth] Supabase connection successful');
      }
    });

    // Removed refresh handler to prevent logout on page refresh
    
    // First, check for existing session and finish initial load gate here
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[useAuth] getSession resolved', {
        hasSession: Boolean(session),
        userId: session?.user?.id,
      });
      let effectiveSession = session;
      let effectiveUser = session?.user ?? null;

      // Validate session with backend; stale tokens can cause UI stalls on refresh
      if (session) {
        try {
          const { data, error } = await supabase.auth.getUser();
          if (error || !data?.user) {
            console.warn('[useAuth] getUser failed; treating as signed-out', error);
            effectiveSession = null;
            effectiveUser = null;
            // best-effort cleanup of stale keys
            try {
              const keysToRemove: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;
                if (key.startsWith('sb-') || key.includes('supabase')) {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach((k) => localStorage.removeItem(k));
            } catch {}
          }
        } catch (e) {
          console.warn('[useAuth] getUser threw; treating as signed-out', e);
          effectiveSession = null;
          effectiveUser = null;
        }
      }

      setSession(effectiveSession);
      setUser(effectiveUser);
      console.log('[useAuth] initial state set', {
        loadingBefore: true,
        hasUser: Boolean(effectiveUser),
      });

      // Do not block initial load on profile ensure; run it in background
      if (effectiveUser) {
        Promise.race([
          ensureProfile(effectiveUser),
          new Promise((resolve) => setTimeout(resolve, 3000)), // safety timeout
        ]).catch((e) => console.warn('[useAuth] ensureProfile (background) error', e));
      }

      setLoading(false); // unblock UI immediately
      console.log('[useAuth] loading=false');
    });

    // Then, keep listening for subsequent auth changes without toggling initial loading gate
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] onAuthStateChange', {
          event,
          hasSession: Boolean(session),
          userId: session?.user?.id,
        });
        setSession(session);
        setUser(session?.user ?? null);
        console.log('[useAuth] state after onAuthStateChange', {
          event,
          hasUser: Boolean(session?.user),
        });

        // Do not block UI on subsequent auth changes either
        if (event === 'SIGNED_IN' && session?.user) {
          Promise.race([
            ensureProfile(session.user),
            new Promise((resolve) => setTimeout(resolve, 3000)),
          ]).catch((e) => console.warn('[useAuth] ensureProfile (auth change) error', e));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const ensureProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
            role: user.user_metadata?.role || 'student', // default to student
          });
      } else if (data && !data.role && user.user_metadata?.role) {
        // Profile exists but role is not set, update it
        await supabase
          .from('profiles')
          .update({ role: user.user_metadata.role })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
    }
  };

  const signUp = async (email: string, password: string, metadata: { role: string }) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('[useAuth] signIn: begin', { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('[useAuth] signIn: result', { data, error });
      if (error) {
        console.error('[useAuth] signIn error details:', error.message, error.status);
      }
      return { error };
    } catch (e) {
      console.error('[useAuth] signIn exception:', e);
      return { error: e };
    }
  };

  const signOut = async () => {
    console.log('[useAuth] signOut: begin');
    try {
      // Invalidate all sessions for this device to avoid lingering refresh tokens
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.warn('[useAuth] signOut: supabase error', error);
      }

      // Proactively clear cached auth to avoid stale sessions after refresh
      try {
        const beforeKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) beforeKeys.push(k);
        }
        console.log('[useAuth] signOut: storage before', beforeKeys);
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith('sb-') || key.includes('supabase')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        console.log('[useAuth] signOut: cleared keys', keysToRemove);
        const afterKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) afterKeys.push(k);
        }
        console.log('[useAuth] signOut: storage after', afterKeys);
      } catch (e) {
        console.warn('[useAuth] signOut: storage cleanup failed', e);
      }

      // Immediately update context to reflect logged-out state
      setSession(null);
      setUser(null);
      console.log('[useAuth] signOut: context cleared');

      return { error };
    } catch (e: any) {
      console.error('[useAuth] signOut: unexpected error', e);
      return { error: e };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  console.log('[useAuth] Hook called:', { 
    hasUser: !!context.user, 
    userEmail: context.user?.email,
    loading: context.loading 
  });
  
  return context;
}