import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppContextType, AppState, Language, Notification, UserProfile } from '../types';
import { languages } from '../data/languages';
import { mockUser, notifications as initialNotifications } from '../data/mockUser';

const AppContext = createContext<AppContextType | null>(null);

const defaultState: AppState = {
  language: languages[0],
  user: mockUser,
  isVerified: false,
  notifications: initialNotifications,
  onboardingStep: 0,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const setLanguage = useCallback((language: Language) => {
    setState((prev) => ({ ...prev, language }));
  }, []);

  const setUser = useCallback((user: UserProfile) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const setVerified = useCallback((isVerified: boolean) => {
    setState((prev) => ({ ...prev, isVerified }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n: Notification) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  }, []);

  const setOnboardingStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, onboardingStep: step }));
  }, []);

  return (
    <AppContext.Provider
      value={{ ...state, setLanguage, setUser, setVerified, markNotificationRead, setOnboardingStep }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
