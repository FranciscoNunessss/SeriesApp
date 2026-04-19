import { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveUserContextType {
  activeUserId: number | null;
  setActiveUserId: (userId: number | null) => void;
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined);

export function ActiveUserProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserId] = useState<number | null>(null);

  return (
    <ActiveUserContext.Provider value={{ activeUserId, setActiveUserId }}>
      {children}
    </ActiveUserContext.Provider>
  );
}

export function useActiveUser() {
  const context = useContext(ActiveUserContext);
  if (!context) {
    throw new Error('useActiveUser must be used within ActiveUserProvider');
  }
  return context;
}
