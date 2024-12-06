import { create } from "zustand";

interface User {
  id: string,
  name: string;
  email: string;
  avatar: string;
  auth_method: string;
  created_at: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
