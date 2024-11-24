import { create } from 'zustand'


interface User {
    name: string;
    email: string;
    avatar: string;
    auth_method: string;
  }
  
  interface UserState {
    user: User | null; 
    isLoggedIn: boolean,
    isLoading: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
  }
  

  export const useUserStore = create<UserState>()((set) => ({
    user: null,
    isLoggedIn: false,
    isLoading: false,
  
    // Actions
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    setLoading: (loading) => set({ isLoading: loading }),
  }));