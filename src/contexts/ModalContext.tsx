import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ModalContextType {
  isAddStreakOpen: boolean;
  openAddStreak: () => void;
  closeAddStreak: () => void;
  setAddStreakOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isAddStreakOpen, setIsAddStreakOpen] = useState(false);

  const openAddStreak = useCallback(() => setIsAddStreakOpen(true), []);
  const closeAddStreak = useCallback(() => setIsAddStreakOpen(false), []);
  const setAddStreakOpen = useCallback((open: boolean) => setIsAddStreakOpen(open), []);

  return (
    <ModalContext.Provider value={{ isAddStreakOpen, openAddStreak, closeAddStreak, setAddStreakOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
