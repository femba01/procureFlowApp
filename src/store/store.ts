import { create } from "zustand";
import type { User } from "../types/types";
const demoUser: User = {
  id: "usr-1",
  name: "Muideen Adeogun",
  email: "muideen@procureflow.demo",
  role: "Administrator",
  department: "Operations",
  initials: "MA",
  organization: ""
};
interface AppState {
  user: User | null;
  sidebarOpen: boolean;
  login: (email: string) => void;
  logout: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}
export const useAppStore = create<AppState>((set) => ({
  user: demoUser,
  sidebarOpen: false,
  login: (email) => set({
    user: { ...demoUser, email }
  }),
  logout: () => set({
    user: null
  }),
  toggleSidebar: () => set((s) => ({
    sidebarOpen: !s.sidebarOpen
  })),
  closeSidebar: () => set({
    sidebarOpen: false
  }),
}));
