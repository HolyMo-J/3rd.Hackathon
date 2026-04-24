import { create } from "zustand";

export const useFinanceStore = create((set) => ({
  user: null,
  selectedMonth: "2026-04",
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
}));
