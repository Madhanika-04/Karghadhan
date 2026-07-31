import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppContextType, AppState, Language, Notification, UserProfile, YarnPassbookData, UserDocument } from '../types';
import { languages } from '../data/languages';
import { notifications as initialNotifications } from '../data/mockUser';
import { initialDocuments, defaultYarnPassbookData } from '../data/documents';
import i18n from '../i18n';
import { weaverApi } from '../services/api';

const AppContext = createContext<AppContextType | null>(null);

const getInitialUser = (): UserProfile | null => {
  try {
    const savedUser = localStorage.getItem('user_profile');
    const authToken = localStorage.getItem('auth_token');
    if (savedUser && (authToken || savedUser.includes('weaver-demo-001'))) {
      return JSON.parse(savedUser);
    }
  } catch (e) {
    console.error('Failed to load initial user from localStorage:', e);
  }
  return null;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const initialUser = getInitialUser();
    const storedLangCode = localStorage.getItem('i18nextLng') || 'en';
    const baseCode = storedLangCode.split('-')[0];
    const initialLang = languages.find(l => l.code === baseCode) || languages[0];
    
    return {
      language: initialLang,
      user: initialUser,
      isVerified: initialUser?.isVerified || false,
      notifications: initialNotifications,
      onboardingStep: 0,
      yarnPassbook: defaultYarnPassbookData,
      documentsList: initialDocuments,
      isNewWeaver: false,
    };
  });

  const refreshUser = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem('user_profile');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        const userId = parsedUser.id || parsedUser.user_id;

        // Only call the backend if the ID looks like a real UUID (not mock data)
        const isRealUUID = userId && /^[0-9a-f-]{36}$/i.test(userId);
        
        if (isRealUUID) {
          try {
            const freshProfile = await weaverApi.getProfile(userId);
            
            const mappedProfile: UserProfile = {
              id: freshProfile.id,
              name: freshProfile.full_name || freshProfile.name || 'Weaver',
              age: freshProfile.age || 30,
              gender: freshProfile.gender || 'Other',
              phone: freshProfile.phone_number || freshProfile.phone || '',
              district: (freshProfile.cluster_location || 'Unknown').split(',')[0].trim(),
              state: (freshProfile.cluster_location || ', Unknown').split(',')[1]?.trim() || 'Unknown',
              occupation: freshProfile.occupation || 'Handloom Weaver',
              yearsOfExperience: freshProfile.experience_years || 0,
              monthlyIncome: freshProfile.monthly_income || 0,
              weaverIdNumber: freshProfile.pehchan_id || '',
              pehchan_id: freshProfile.pehchan_id,
              yarn_passbook_id: freshProfile.yarn_passbook_id || 'YPB-UP-2024-8842',
              cibil_score: freshProfile.cibil_score,
              aadhaarNumber: parsedUser.aadhaarNumber || 'XXXX XXXX XXXX',
              profileCompletion: 100,
              isVerified: freshProfile.is_verified || false,
              joinedDate: freshProfile.created_at || new Date().toISOString(),
              familyMembers: freshProfile.family_members || 1,
              ownsLoom: !!(freshProfile.loom_assets && freshProfile.loom_assets.length > 0),
              hasExistingLoan: false,
              hasExistingInsurance: false,
              hasUPI: true,
              savingsHabit: 'Monthly',
              trustScore: freshProfile.trust_score || 0,
            };

            setState(prev => ({ ...prev, user: mappedProfile, isVerified: mappedProfile.isVerified }));
            localStorage.setItem('user_profile', JSON.stringify(mappedProfile));
          } catch (apiError) {
            console.warn('Backend profile fetch failed, using cached profile:', apiError);
            if (parsedUser.name) {
              setState(prev => ({ ...prev, user: parsedUser, isVerified: parsedUser.isVerified || false }));
            }
          }
        } else {
          if (parsedUser.name) {
            setState(prev => ({ ...prev, user: parsedUser, isVerified: parsedUser.isVerified || false }));
          }
        }
      }
    } catch (e) {
      console.error('Failed to refresh user profile:', e);
    }
  }, []);

  // Load user & local stored documents/passbook on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    const authToken = localStorage.getItem('auth_token');
    const savedPassbook = localStorage.getItem('yarn_passbook_data');
    const savedDocs = localStorage.getItem('documents_list');

    if (savedPassbook) {
      try {
        const parsed = JSON.parse(savedPassbook);
        setState(prev => ({ ...prev, yarnPassbook: parsed }));
      } catch (e) { console.error(e); }
    }
    if (savedDocs) {
      try {
        const parsedDocs = JSON.parse(savedDocs);
        setState(prev => ({ ...prev, documentsList: parsedDocs }));
      } catch (e) { console.error(e); }
    }

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const userId = user.id || user.user_id || '';

        if (!authToken && !userId.includes('weaver-demo-001')) {
          console.info('No auth token found, clearing user data');
          localStorage.removeItem('user_profile');
          setState(prev => ({ ...prev, user: null, isVerified: false }));
          return;
        }

        refreshUser();
      } catch (e) {
        console.error(e);
        localStorage.removeItem('user_profile');
        setState(prev => ({ ...prev, user: null, isVerified: false }));
      }
    } else {
      setState(prev => ({ ...prev, user: null, isVerified: false }));
    }

    const handleUnauthorized = () => {
      setTimeout(() => setState(prev => ({ ...prev, user: null, isVerified: false })), 0);
    };
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, [refreshUser]);

  const setLanguage = useCallback((language: Language) => {
    i18n.changeLanguage(language.code);
    setState((prev) => ({ ...prev, language }));
  }, []);

  React.useEffect(() => {
    if (i18n.language && i18n.language !== state.language.code) {
      const detected = languages.find(l => l.code === i18n.language);
      if (detected) {
        setTimeout(() => setState(prev => ({ ...prev, language: detected })), 0);
      }
    }
  }, [state.language.code]);

  const setUser = useCallback((user: UserProfile | null) => {
    if (user) {
      localStorage.setItem('user_profile', JSON.stringify(user));
      setState((prev) => ({ ...prev, user, isVerified: user.isVerified || false }));
    } else {
      localStorage.removeItem('user_profile');
      setState((prev) => ({ ...prev, user: null, isVerified: false }));
    }
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

  const updateYarnPassbook = useCallback((data: Partial<YarnPassbookData>) => {
    setState((prev) => {
      const updated = { ...prev.yarnPassbook, ...data };
      localStorage.setItem('yarn_passbook_data', JSON.stringify(updated));
      return { ...prev, yarnPassbook: updated };
    });
  }, []);

  const addDocument = useCallback((doc: UserDocument) => {
    setState((prev) => {
      const updatedList = [doc, ...prev.documentsList.filter(d => d.id !== doc.id)];
      localStorage.setItem('documents_list', JSON.stringify(updatedList));
      return { ...prev, documentsList: updatedList };
    });
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<UserDocument>) => {
    setState((prev) => {
      const updatedList = prev.documentsList.map(d => d.id === id ? { ...d, ...updates } : d);
      localStorage.setItem('documents_list', JSON.stringify(updatedList));
      return { ...prev, documentsList: updatedList };
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setState((prev) => {
      const updatedList = prev.documentsList.filter(d => d.id !== id);
      localStorage.setItem('documents_list', JSON.stringify(updatedList));
      return { ...prev, documentsList: updatedList };
    });
  }, []);

  const setIsNewWeaver = useCallback((isNew: boolean) => {
    localStorage.setItem('is_new_weaver', JSON.stringify(isNew));
    setState((prev) => ({ ...prev, isNewWeaver: isNew }));
  }, []);

  // Load is_new_weaver on mount
  React.useEffect(() => {
    const savedIsNew = localStorage.getItem('is_new_weaver');
    if (savedIsNew !== null) {
      try {
        const parsed = JSON.parse(savedIsNew);
        setState((prev) => ({ ...prev, isNewWeaver: parsed }));
      } catch (e) { console.error(e); }
    }
  }, []);

  return (
    <AppContext.Provider
      value={{ 
        ...state, 
        setLanguage, 
        setUser, 
        setVerified, 
        markNotificationRead, 
        setOnboardingStep,
        refreshUser,
        updateYarnPassbook,
        addDocument,
        updateDocument,
        deleteDocument,
        setIsNewWeaver,
      }}
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

