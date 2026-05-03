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
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  console.log('🛡️ AuthProvider Render - Loading:', loading, 'IsGuest:', isGuest);

  const fetchProfile = async (userId) => {
    console.log('🔍 fetchProfile started for:', userId);
    try {
      // Create a promise that rejects after 3 seconds
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
      });

      // Execute the query
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('⏳ Starting Promise.race for profile...');
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      clearTimeout(timeoutId);

      if (error) throw error;
      console.log('✅ Profile fetch result:', data ? 'Found' : 'Not found');
      return data;
    } catch (err) {
      console.error('⚠️ Profile fetch error/timeout:', err.message);
      return null;
    }
  };

  const refreshUser = async (existingSession = null) => {
    console.log('🔄 refreshUser starting...');
    try {
      let session = existingSession;
      if (!session) {
        const { data } = await supabase.auth.getSession();
        session = data.session;
      }

      if (session?.user) {
        // Step 1: Set user immediately with session data (eager update)
        const basicUserData = {
          ...session.user,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
          verified: !!session.user.email_confirmed_at
        };
        console.log('👤 Eager user data set:', basicUserData.email);
        setCurrentUser(basicUserData);
        // Reset onboarding flag on new session
        setNeedsOnboarding(false);

        // Step 2: Fetch profile in background and merge
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          const fullUserData = {
            ...basicUserData,
            ...profile,
            name: profile.full_name || basicUserData.name,
            avatar: profile.avatar_url || basicUserData.avatar,
          };
          console.log('👤 Full user profile merged');
          setCurrentUser(fullUserData);
          // Determine if onboarding is needed (missing name or daily goal)
          const needsOnboard = !profile.full_name || profile.daily_goal == null;
          setNeedsOnboarding(needsOnboard);
        } else {
          setNeedsOnboarding(true);
        }
      } else {
        console.log('👤 No session found, clearing user');
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('❌ refreshUser error:', err);
      setCurrentUser(null);
    } finally {
      console.log('🔄 refreshUser complete');
    }
  };

  useEffect(() => {
    let mounted = true;
    let authChecked = false;

    const initializeAuth = async () => {
      // Safety timeout
      const timeoutId = setTimeout(() => {
        if (mounted && !authChecked) {
          console.warn('⚠️ Auth check timed out. Forcing UI load.');
          setLoading(false);
        }
      }, 8000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          // Non-blocking refresh
          refreshUser(session);
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
      } finally {
        if (mounted) {
          authChecked = true;
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth State Event:', event, 'User:', session?.user?.email || 'None');

      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (mounted) {
            // Eagerly unblock loading if it's the first sign in
            const updatePromise = refreshUser(session);
            if (!authChecked) {
              await updatePromise;
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setCurrentUser(null);
            setIsGuest(false);
            localStorage.removeItem(GUEST_KEY);
          }
        }
      } catch (err) {
        console.error('❌ Auth state change error:', err);
      } finally {
        if (mounted) {
          authChecked = true;
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
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
      // Let onAuthStateChange handle the profile fetching and state update
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
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      throw error;
    }
  };

  const completeOnboarding = async ({ displayName, avatarUrl, dailyGoal }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('No authenticated user');

      const updates = {
        id: userId,
        full_name: displayName,
        avatar_url: avatarUrl || null,
        daily_goal: dailyGoal,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      setCurrentUser(prev => ({
        ...prev,
        name: displayName,
        full_name: displayName,
        avatar: avatarUrl || prev?.avatar || '',
        avatar_url: avatarUrl || prev?.avatar_url || '',
        daily_goal: dailyGoal,
      }));
      setNeedsOnboarding(false);
    } catch (err) {
      console.error('❌ completeOnboarding error:', err);
      throw err;
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
    needsOnboarding,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};