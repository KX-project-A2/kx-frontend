import { create } from 'zustand';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthProfile {
  id: number;
  nickname: string;
  email: string;
  profileImageUrl?: string;
}

interface AuthStore {
  status: AuthStatus;
  profile: AuthProfile | null;
  setChecking: () => void;
  setAuthenticated: (profile: AuthProfile) => void;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'idle',
  profile: null,
  setChecking: () => set({ status: 'loading' }),
  setAuthenticated: (profile) => set({ status: 'authenticated', profile }),
  setUnauthenticated: () => set({ status: 'unauthenticated', profile: null }),
}));
