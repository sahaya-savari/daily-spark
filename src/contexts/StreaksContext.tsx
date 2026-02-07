import React, { createContext, useContext, useEffect } from 'react';
import { useStreaks as useStreaksHook } from '@/hooks/useStreaks';
import { useRecoveryAlert } from './RecoveryAlertContext';

type StreaksContextValue = ReturnType<typeof useStreaksHook>;

const StreaksContext = createContext<StreaksContextValue | null>(null);

export const StreaksProvider = ({ children }: { children: React.ReactNode }) => {
  try {
    const value = useStreaksHook();
    let showRecoveryAlert: any = null;
    
    try {
      const recovery = useRecoveryAlert();
      showRecoveryAlert = recovery?.showRecoveryAlert;
    } catch (contextError) {
      console.warn('[StreaksProvider] RecoveryAlertContext not available, recovery alerts disabled');
    }

    // Show recovery alert if data was recovered
    useEffect(() => {
      if (value.recoveryResult?.recovered && showRecoveryAlert) {
        try {
          const title = value.recoveryResult.reason === 'backup_restored' 
            ? '⚠️  Data Restored'
            : '⚠️  Starting Fresh';
          
          showRecoveryAlert({
            title,
            message: value.recoveryResult.message,
            type: value.recoveryResult.reason === 'no_backup' ? 'info' : 'warning',
          });
        } catch (error) {
          console.error('[StreaksProvider] Failed to show recovery alert:', error);
        }
      }
    }, [value.recoveryResult, showRecoveryAlert]);

    return <StreaksContext.Provider value={value}>{children}</StreaksContext.Provider>;
  } catch (error) {
    console.error('[StreaksProvider] ❌ Critical error initializing streaks:', error);
    // Return empty context to prevent app crash
    const emptyValue = {
      streaks: [],
      lists: [],
      isLoading: false,
      recoveryResult: null,
      addStreak: () => {},
      updateStreak: () => {},
      deleteStreak: () => {},
      completeStreak: () => {},
      addList: () => {},
      deleteList: () => {},
      renameList: () => {},
    } as any;
    return <StreaksContext.Provider value={emptyValue}>{children}</StreaksContext.Provider>;
  }
};

export const useStreaksContext = (): StreaksContextValue => {
  const ctx = useContext(StreaksContext);
  if (!ctx) {
    throw new Error('useStreaksContext must be used within a StreaksProvider');
  }
  return ctx;
};
