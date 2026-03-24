import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === 'true');

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      // Clear guest mode when user logs in properly
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
      setCurrentUser(authData.record);
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    try {
      const user = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name: name || email.split('@')[0],
      });
      
      // Trigger verification email
      await pb.collection('users').requestVerification(email);
      
      return user;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const resendVerification = async (email) => {
    try {
      await pb.collection('users').requestVerification(email);
      return true;
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      
      // Clear guest mode when user logs in with Google
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
      setCurrentUser(authData.record);
      return authData;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
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
      await pb.collection('users').requestPasswordReset(email);
      return true;
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  };

  const confirmPasswordReset = async (token, password, passwordConfirm) => {
    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
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
    initialLoading,
    login,
    signup,
    loginWithGoogle,
    resendVerification,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};