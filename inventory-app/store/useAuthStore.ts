import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  email: string;
  role: string;
  token?: string;
} | null;

type AuthStore = {
  user: User;
  isHydrated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  hydrateUser: () => Promise<void>;
};

const USER_STORAGE_KEY = "@auth_user";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isHydrated: false,

  setUser: async (user) => {
    set({ user });
    if (user) {
      try {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } catch (error) {
        console.error("Failed to save user to storage:", error);
      }
    }
  },

  clearUser: async () => {
    set({ user: null });
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove user from storage:", error);
    }
  },

  hydrateUser: async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        set({ user: JSON.parse(storedUser), isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      set({ isHydrated: true });
    }
  },
}));
