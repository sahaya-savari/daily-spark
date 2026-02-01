import React, { createContext, useContext } from 'react';
import { useStreaks as useStreaksHook } from '@/hooks/useStreaks';

type StreaksContextValue = ReturnType<typeof useStreaksHook>;

const StreaksContext = createContext<StreaksContextValue | null>(null);

export const StreaksProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useStreaksHook();
  return <StreaksContext.Provider value={value}>{children}</StreaksContext.Provider>;
};

export const useStreaksContext = (): StreaksContextValue => {
  const ctx = useContext(StreaksContext);
  if (!ctx) {
    throw new Error('useStreaksContext must be used within a StreaksProvider');
  }
  return ctx;
};
