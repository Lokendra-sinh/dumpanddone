import { ModelsType } from "@dumpanddone/types";
import { create } from "zustand";
import { BlogType } from "./useBlogsStore";

interface User {
  id: string,
  name: string;
  email: string;
  avatar: string;
  auth_method: string;
  created_at: string;
  blogs: BlogType[]
}

interface UserState {
  user: User | null;
  selectedModel: ModelsType
  setUser: (user: User) => void;
  clearUser: () => void;
  setSelectedModel: (model: ModelsType) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  selectedModel: "claude",
  setSelectedModel: (model) => set({selectedModel: model}),
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
