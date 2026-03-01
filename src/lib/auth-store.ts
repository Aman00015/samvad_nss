import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;
}

// Demo users for prototype
const DEMO_USERS: Record<UserRole, User> = {
  citizen: {
    id: 'citizen-001',
    name: 'Ramesh Patil',
    email: 'citizen@samvaad.in',
    phone: '+91 98765 43210',
    role: 'citizen',
    ward: 'Palghar Ward 5',
    city: 'Mumbai Metropolitan Region',
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
  },
  volunteer: {
    id: 'volunteer-001',
    name: 'Priya Sharma',
    email: 'volunteer@samvaad.in',
    phone: '+91 98765 43211',
    role: 'volunteer',
    ward: 'Palghar Ward 5',
    city: 'Mumbai Metropolitan Region',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
  },
  admin: {
    id: 'admin-001',
    name: 'Dr. Anita Deshmukh',
    email: 'admin@samvaad.in',
    phone: '+91 98765 43212',
    role: 'admin',
    city: 'Mumbai Metropolitan Region',
    isActive: true,
    createdAt: '2026-01-01T10:00:00Z',
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string, role: UserRole) => {
        set({ isLoading: true });

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 800));

        // For prototype: accept demo credentials or any email with matching role
        const demoUser = DEMO_USERS[role];
        if (demoUser) {
          const user: User = {
            ...demoUser,
            email: email || demoUser.email,
            lastLoginAt: new Date().toISOString(),
          };
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        }

        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      switchRole: (role: UserRole) => {
        const demoUser = DEMO_USERS[role];
        if (demoUser) {
          set({
            user: { ...demoUser, lastLoginAt: new Date().toISOString() },
            isAuthenticated: true,
          });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'samvaad-auth',
    }
  )
);
