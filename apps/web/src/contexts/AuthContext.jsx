import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';

const AuthContext = createContext(null);
const GUEST_KEY = 'focusflow_guest';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(localStorage.getItem(GUEST_KEY) === 'true');

  console.log('🛡️ AuthProvider Render - Loading:', loading, 'IsGuest:', isGuest);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      // Add a timeout to getSession to prevent hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout')), 3000)
      );
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser({
          ...session.user,
          ...profile,
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
          verified: !!session.user.email_confirmed_at
        });
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('❌ refreshUser error:', err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Safety timeout: if auth takes more than 1.5 seconds, force stop loading
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Auth initialization timed out after 1.5s. Forcing UI to load.');
        setLoading(false);
      }, 1500);

      try {
        await refreshUser();
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth State Event:', event, 'User:', session?.user?.email || 'None');
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      localStorage.removeItem(GUEST_KEY);
      await refreshUser();
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    try {
      if (password !== passwordConfirm) {
        throw new Error('Passwords do not match');
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const resendVerification = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
      return data;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(GUEST_KEY);
    setCurrentUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_KEY, 'true');
    setIsGuest(true);
  };

  const requestPasswordReset = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  };

  const confirmPasswordReset = async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isGuest,
    loading,
    initialLoading: loading,
    login,
    signup,
    loginWithGoogle,
    resendVerification,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
    continueAsGuest,
    refreshProfile: refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};