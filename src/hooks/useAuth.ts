import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
}

const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@vouchvibe.com',
  app_metadata: {},
  user_metadata: { full_name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const DEMO_PROFILE: Profile = {
  id: 'demo-user-123',
  email: 'demo@vouchvibe.com',
  full_name: 'Demo User',
  avatar_url: null,
  company_name: 'Demo Company',
  website: 'https://demo.vouchvibe.com',
  subscription_tier: 'pro',
  stripe_customer_id: null,
  subscription_id: null,
  monthly_video_limit: -1,
  videos_used_this_month: 0,
  storage_used_bytes: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_KEY = 'vouchvibe_demo_mode';

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    // Check localStorage for persisted demo mode
    if (typeof window !== 'undefined') {
      const savedDemo = localStorage.getItem(DEMO_KEY);
      if (savedDemo === 'true') {
        return {
          user: DEMO_USER,
          session: null,
          profile: DEMO_PROFILE,
          loading: false,
          isDemo: true,
        };
      }
    }
    return {
      user: null,
      session: null,
      profile: null,
      loading: false,
      isDemo: false,
    };
  });

  // Persist demo mode to localStorage
  useEffect(() => {
    if (state.isDemo) {
      localStorage.setItem(DEMO_KEY, 'true');
      console.log('[Auth] Demo mode persisted to localStorage');
    } else {
      localStorage.removeItem(DEMO_KEY);
    }
  }, [state.isDemo]);

  // Initialize from Supabase or keep demo mode
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log('[Auth] Running in demo mode');
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setState(prev => ({ ...prev, user, session, loading: false }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const user = session?.user ?? null;
      setState(prev => ({ ...prev, user, session, loading: false }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const startDemoMode = useCallback(() => {
    console.log('[Auth] Starting demo mode...');
    setState({
      user: DEMO_USER,
      session: null,
      profile: DEMO_PROFILE,
      loading: false,
      isDemo: true,
    });
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    if (!isSupabaseConfigured()) {
      startDemoMode();
      return { user: DEMO_USER, session: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  }, [startDemoMode]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      startDemoMode();
      return { user: DEMO_USER, session: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, [startDemoMode]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setState({ user: null, session: null, profile: null, loading: false, isDemo: false });
      return;
    }
    await supabase.auth.signOut();
    setState({ user: null, session: null, profile: null, loading: false, isDemo: false });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (state.isDemo) {
      const updatedProfile = { ...DEMO_PROFILE, ...updates };
      setState(prev => ({ ...prev, profile: updatedProfile as Profile }));
      return updatedProfile;
    }
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }
    if (!state.user) throw new Error('No user logged in');
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single();
    if (error) throw error;
    setState(prev => ({ ...prev, profile: data as Profile }));
    return data;
  }, [state.user, state.isDemo]);

  return {
    ...state,
    startDemoMode,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}
