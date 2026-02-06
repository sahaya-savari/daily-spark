import React, { createContext, useContext, useEffect } from 'react';
import { useStreaks as useStreaksHook } from '@/hooks/useStreaks';
import { useRecoveryAlert } from './RecoveryAlertContext';

type StreaksContextValue = ReturnType<typeof useStreaksHook>;

const StreaksContext = createContext<StreaksContextValue | null>(null);

export const StreaksProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useStreaksHook();
  const { showRecoveryAlert } = useRecoveryAlert();

  // Show recovery alert if data was recovered
  useEffect(() => {
    if (value.recoveryResult?.recovered) {
      const title = value.recoveryResult.reason === 'backup_restored' 
        ? '⚠️  Data Restored'
        : '⚠️  Starting Fresh';
      
      showRecoveryAlert({
        title,
        message: value.recoveryResult.message,
        type: value.recoveryResult.reason === 'no_backup' ? 'info' : 'warning',
      });
    }
  }, [value.recoveryResult, showRecoveryAlert]);

  return <StreaksContext.Provider value={value}>{children}</StreaksContext.Provider>;
};

export const useStreaksContext = (): StreaksContextValue => {
  const ctx = useContext(StreaksContext);
  if (!ctx) {
    throw new Error('useStreaksContext must be used within a StreaksProvider');
  }
  return ctx;
};
