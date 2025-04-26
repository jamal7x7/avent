import { create } from "zustand";

interface NavLayoutState {
  isSidebar: boolean;
  toggleNavLayout: () => void;
}

export const useNavLayoutStore = create<NavLayoutState>((set) => ({
  isSidebar: true,
  toggleNavLayout: () => set((state) => ({ isSidebar: !state.isSidebar })),
}));
