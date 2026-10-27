import { createContext, useContext } from "react";

/** Opens the shared "New habit" sheet owned by the app layout. */
export const AddHabitContext = createContext<() => void>(() => {});

export function useOpenAddHabit() {
  return useContext(AddHabitContext);
}
