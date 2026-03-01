'use client';

import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && (!isAuthenticated || !user)) {
      router.push('/');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
