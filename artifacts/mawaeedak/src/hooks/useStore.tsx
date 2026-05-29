import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  name: string;
  email: string;
  city: string;
  timezone: string;
  onboardingComplete: boolean;
  interests: string[];
}

interface StoreContextType {
  user: UserData;
  setUser: (user: Partial<UserData>) => void;
  hideAds: boolean;
  setHideAds: (hide: boolean) => void;
  isAdmin: boolean;
  setAdmin: (isAdmin: boolean) => void;
}

const defaultUser: UserData = {
  name: '',
  email: '',
  city: 'الرياض',
  timezone: 'Asia/Riyadh',
  onboardingComplete: false,
  interests: [],
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserData>(() => {
    try {
      const stored = localStorage.getItem('app-user');
      return stored ? JSON.parse(stored) : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  const [hideAds, setHideAds] = useState(() => localStorage.getItem('hide-ads') === 'true');
  const [isAdmin, setAdmin] = useState(() => localStorage.getItem('admin_authenticated') === 'true');

  const setUser = (updates: Partial<UserData>) => {
    setUserState(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app-user', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('hide-ads', hideAds ? 'true' : 'false');
  }, [hideAds]);

  useEffect(() => {
    localStorage.setItem('admin_authenticated', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  return (
    <StoreContext.Provider value={{ user, setUser, hideAds, setHideAds, isAdmin, setAdmin }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
