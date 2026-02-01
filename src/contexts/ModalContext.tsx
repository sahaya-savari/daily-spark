import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isAddStreakOpen: boolean;
  openAddStreak: () => void;
  closeAddStreak: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isAddStreakOpen, setIsAddStreakOpen] = useState(false);

  const openAddStreak = () => setIsAddStreakOpen(true);
  const closeAddStreak = () => setIsAddStreakOpen(false);

  return (
    <ModalContext.Provider value={{ isAddStreakOpen, openAddStreak, closeAddStreak }}>
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
