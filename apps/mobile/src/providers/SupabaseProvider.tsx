import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type SupabaseContextType = {
  session: Session | null;
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  initialized: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if we have a session in storage
        const storedSession = await AsyncStorage.getItem('supabase.session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initialize();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await AsyncStorage.setItem('supabase.session', JSON.stringify(session));
        } else {
          await AsyncStorage.removeItem('supabase.session');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'medreminder://',
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
      throw error;
    }
    await AsyncStorage.removeItem('supabase.session');
  };

  const value = {
    session,
    user: session?.user ?? null,
    signIn,
    signOut,
    loading,
    initialized,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};