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
  const refreshingRef = React.useRef(false);
  const fetchingProfileRef = React.useRef(null);



  const fetchProfile = async (userId) => {
    if (fetchingProfileRef.current === userId) {
      console.log('🔍 fetchProfile already in progress for this user, skipping...');
      return null;
    }
    fetchingProfileRef.current = userId;
    try {
      // Create a promise that rejects after 20 seconds
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Profile fetch timeout')), 20000);
      });

      // Execute the query
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      clearTimeout(timeoutId);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('⚠️ Profile fetch error/timeout:', err.message);
      return null;
    } finally {
      fetchingProfileRef.current = null;
    }
  };

  const refreshUser = async (existingSession = null) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      let session = existingSession;
      if (!session) {
        // Only use getSession if we don't already have one
        const { data } = await supabase.auth.getSession();
        session = data.session;
      }

      if (session?.user) {
        // Use the session user immediately. Only fetch server-side user if we don't have a session
        // or if we explicitly need to verify the email confirmation status.
        let userToUse = session.user;

        // Optimization: If this is an existing session, we trust its user data for the 'eager' load
        // This avoids hitting the Supabase Auth Lock which causes hangs in React 18
        if (!existingSession) {
          try {
            const { data: { user: latestUser } } = await supabase.auth.getUser();
            if (latestUser) userToUse = latestUser;
          } catch (e) {
            console.warn('⚠️ Could not fetch latest user status, using session user.');
          }
        }

        console.log('👤 User verification status:', userToUse.email_confirmed_at ? 'Verified' : 'Pending');

        // Step 1: Set user immediately with session data (eager update)
        const basicUserData = {
          ...userToUse,
          name: userToUse.user_metadata?.full_name || userToUse.user_metadata?.name || userToUse.email.split('@')[0],
          avatar: userToUse.user_metadata?.avatar_url || userToUse.user_metadata?.picture || '',
          verified: !!userToUse.email_confirmed_at
        };

        setCurrentUser(basicUserData);

        // Step 2: Fetch profile in background with a safety timeout
        try {
          const profilePromise = fetchProfile(userToUse.id);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile timeout')), 10000)
          );

          const profile = await Promise.race([profilePromise, timeoutPromise]);

          if (profile) {
            const fullUserData = {
              id: userToUse.id,
              email: userToUse.email,
              ...profile,
              name: profile.full_name || basicUserData.name,
              avatar: profile.avatar_url || basicUserData.avatar,
              verified: !!userToUse.email_confirmed_at
            };
            setCurrentUser(fullUserData);
            return fullUserData;
          }
        } catch (profileError) {
          console.warn('⚠️ Profile fetch skipped/failed:', profileError.message);
        }

        return basicUserData;
      } else {
        setCurrentUser(null);
        return null;
      }
    } catch (err) {
      console.error('❌ refreshUser error:', err);
      return null;
    } finally {
      refreshingRef.current = false;
    }
  };


  const refreshAuth = async () => {
    return await refreshUser();
  };

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    // Safety timeout to ensure loading spinner doesn't stay forever
    // Increased to 15s to handle slow Supabase cold starts or network issues
    const timeoutId = setTimeout(() => {
      if (mounted && !initialized) {
        console.warn('⚠️ Auth initialization timeout. Releasing UI.');
        React.startTransition(() => {
          setLoading(false);
        });
      }
    }, 15000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      try {
        // We always refresh user on these events or on the first event (initialization)
        if (!initialized || ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          if (mounted) {
            await refreshUser(session);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            React.startTransition(() => {
              setCurrentUser(null);
              setIsGuest(false);
            });
            localStorage.removeItem(GUEST_KEY);
          }
        }
      } catch (err) {
        console.error('❌ Auth refresh error:', err);
      } finally {
        if (mounted && !initialized) {
          initialized = true;
          clearTimeout(timeoutId);
          React.startTransition(() => {
            setLoading(false);
          });
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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

  const updateProfile = async (updates) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: session.user.email,
          updated_at: new Date().toISOString(),
          ...updates
        });

      if (error) {
        console.error('❌ Supabase upsert error:', error);
        throw error;
      }

      // Update local state immediately for snappy UI
      setCurrentUser(prev => {
        const newState = { ...prev, ...updates };
        // Map database fields to local state fields consistently
        if (updates.full_name !== undefined) newState.name = updates.full_name;
        if (updates.avatar_url !== undefined) newState.avatar = updates.avatar_url;
        if (updates.daily_goal !== undefined) newState.daily_goal = updates.daily_goal;
        if (updates.onboarding_completed !== undefined) {
          newState.onboarding_completed = updates.onboarding_completed;
        }
        return newState;
      });

      return true;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };


  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isAuthenticated: !!currentUser,
      isGuest,
      login,
      signup,
      resendVerification,
      loginWithGoogle,
      logout,
      refreshAuth,
      continueAsGuest,
      requestPasswordReset,
      confirmPasswordReset,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};