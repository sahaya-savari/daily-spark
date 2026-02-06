/**
 * Recovery Alert Context
 *
 * Displays recovery messages to user when app boots with corrupted data
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export interface RecoveryAlert {
  show: boolean;
  title: string;
  message: string;
  type: 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const RecoveryAlertContext = createContext<{
  alert: RecoveryAlert;
  showRecoveryAlert: (alert: Omit<RecoveryAlert, 'show'>) => void;
  dismissAlert: () => void;
}>({
  alert: { show: false, title: '', message: '', type: 'info' },
  showRecoveryAlert: () => {},
  dismissAlert: () => {},
});

export const RecoveryAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<RecoveryAlert>({
    show: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showRecoveryAlert = (newAlert: Omit<RecoveryAlert, 'show'>) => {
    setAlert({ ...newAlert, show: true });
  };

  const dismissAlert = () => {
    setAlert((prev) => ({ ...prev, show: false }));
  };

  return (
    <RecoveryAlertContext.Provider value={{ alert, showRecoveryAlert, dismissAlert }}>
      {children}
    </RecoveryAlertContext.Provider>
  );
};

export const useRecoveryAlert = () => {
  const context = useContext(RecoveryAlertContext);
  if (!context) {
    throw new Error('useRecoveryAlert must be used within RecoveryAlertProvider');
  }
  return context;
};
