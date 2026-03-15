import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthProfile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  subscription_tier: string;
}

interface AuthState {
  user: AuthUser | null;
  profile: AuthProfile | null;
  loading: boolean;
  isDemo: boolean;
}

interface AuthContextType extends AuthState {
  startDemoMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUser = {
  id: 'demo-user-123',
  email: 'demo@vouchvibe.com',
};

const DEMO_PROFILE: AuthProfile = {
  id: 'demo-user-123',
  email: 'demo@vouchvibe.com',
  full_name: 'Demo User',
  company_name: 'Demo Company',
  subscription_tier: 'pro',
};

const DEMO_KEY = 'vouchvibe_demo_mode';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(DEMO_KEY) === 'true') {
        console.log('[Auth] Restoring demo from localStorage');
        return { user: DEMO_USER, profile: DEMO_PROFILE, loading: false, isDemo: true };
      }
    }
    return { user: null, profile: null, loading: false, isDemo: false };
  });

  useEffect(() => {
    if (state.isDemo) {
      localStorage.setItem(DEMO_KEY, 'true');
    } else {
      localStorage.removeItem(DEMO_KEY);
    }
  }, [state.isDemo]);

  const startDemoMode = useCallback(() => {
    console.log('[Auth] Starting demo mode');
    setState({ user: DEMO_USER, profile: DEMO_PROFILE, loading: false, isDemo: true });
  }, []);

  const signUp = useCallback(async (email: string, _password: string, metadata?: Record<string, unknown>) => {
    console.log('[Auth] Sign up:', email, metadata);
    const newUser = { id: 'new-user-' + Date.now(), email };
    const newProfile = { 
      id: newUser.id, 
      email, 
      full_name: (metadata?.full_name as string) || email.split('@')[0],
      company_name: '',
      subscription_tier: 'free'
    };
    setState({ user: newUser, profile: newProfile, loading: false, isDemo: true });
    localStorage.setItem(DEMO_KEY, 'true');
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    console.log('[Auth] Sign in:', email);
    const user = { id: 'user-' + Date.now(), email };
    const profile = { ...DEMO_PROFILE, email, id: user.id };
    setState({ user, profile, loading: false, isDemo: true });
    localStorage.setItem(DEMO_KEY, 'true');
  }, []);

  const signOut = useCallback(async () => {
    console.log('[Auth] Sign out');
    setState({ user: null, profile: null, loading: false, isDemo: false });
    localStorage.removeItem(DEMO_KEY);
  }, []);

  const updateProfile = useCallback((updates: Partial<AuthProfile>) => {
    if (state.profile) {
      setState(prev => ({
        ...prev,
        profile: { ...prev.profile!, ...updates }
      }));
    }
  }, [state.profile]);

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      startDemoMode, 
      signIn, 
      signUp, 
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
