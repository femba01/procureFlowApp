import type { User as SupabaseUser } from "@supabase/supabase-js";
import { create } from "zustand";
import { getProfiles } from "../api/profilesApi";
import supabase from "../api/supabase";
import type { User } from "../types/auth";

interface AppState {
  user: User | null;
  authReady: boolean;
  sidebarOpen: boolean;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

let initialization: Promise<void> | null = null;

const profileFor = async (authUser: SupabaseUser): Promise<User> => {
  const profile = await getProfiles(authUser.id);
  const name: string =
    profile.name || authUser.user_metadata.name || authUser.email || "User";

  return {
    ...profile,
    id: profile.id,
    auth_user_id: authUser.id,
    name,
    email: profile.email || authUser.email || "",
    initials:
      profile.initials ||
      name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
  };
};

export const useAppStore = create<AppState>((set) => ({
  user: null,
  authReady: false,
  sidebarOpen: false,

  initializeAuth: async () => {
    if (initialization) return initialization;

    initialization = (async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session) {
        try {
          set({ user: await profileFor(data.session.user) });
        } catch {
          await supabase.auth.signOut();
          set({ user: null });
        }
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          set({ user: null });
        }
      });
    })().finally(() => set({ authReady: true }));

    return initialization;
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    try {
      set({ user: await profileFor(data.user) });
    } catch (profileError) {
      await supabase.auth.signOut();
      throw profileError;
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
