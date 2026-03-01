'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';
import { Shield, Users, User, ArrowRight, MapPin, CheckCircle, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading, isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && isAuthenticated && user) {
      router.push(`/${user.role}`);
    }
  }, [hydrated, isAuthenticated, user, router]);

  const handleLogin = async () => {
    const success = await login('', '', selectedRole);
    if (success) {
      router.push(`/${selectedRole}`);
    }
  };

  const roles: { role: UserRole; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'citizen',
      label: 'Citizen',
      description: 'File complaints, upload proof, track status',
      icon: <User size={24} />,
      color: 'blue',
    },
    {
      role: 'volunteer',
      label: 'Youth Volunteer',
      description: 'Verify issues, follow up, add field notes',
      icon: <Users size={24} />,
      color: 'green',
    },
    {
      role: 'admin',
      label: 'NGO Admin (BRM)',
      description: 'Manage dashboard, assign tasks, analytics',
      icon: <Shield size={24} />,
      color: 'purple',
    },
  ];

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <img src="/image.png" alt="Samvaad Logo" className="w-14 h-14 rounded-2xl shadow-lg shadow-blue-200 object-contain" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Project <span className="text-blue-600">Samvaad</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-2">
            Connecting Citizens, Youth & Administration
          </p>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            A youth-led civic complaint tracking platform for Mumbai Metropolitan Region.
            File issues, track resolutions, and build accountability — together.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
          {[
            { icon: <MapPin size={20} />, title: 'Geotagged Proof', desc: 'Location-verified complaints with photo/video evidence' },
            { icon: <CheckCircle size={20} />, title: 'Youth Verification', desc: 'Volunteer-verified field reports for transparency' },
            { icon: <BarChart3 size={20} />, title: 'Ward Dashboard', desc: 'Real-time analytics with SLA tracking and insights' },
          ].map((item, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-white/60 border border-gray-100">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 mb-2">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Role Selection */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-lg font-semibold text-gray-900 mb-6">
            Choose your role to continue
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {roles.map(({ role, label, description, icon, color }) => {
              const colorMap: Record<string, { border: string; bg: string; iconBg: string }> = {
                blue: { border: '#3b82f6', bg: '#eff6ff', iconBg: '#3b82f6' },
                green: { border: '#22c55e', bg: '#f0fdf4', iconBg: '#22c55e' },
                purple: { border: '#8b5cf6', bg: '#faf5ff', iconBg: '#8b5cf6' },
              };
              const isSelected = selectedRole === role;
              const colors = colorMap[color];

              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected ? 'shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                  style={isSelected ? { borderColor: colors.border, backgroundColor: colors.bg } : undefined}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={isSelected 
                      ? { backgroundColor: colors.iconBg, color: 'white' } 
                      : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                    }
                  >
                    {icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Continue as {roles.find((r) => r.role === selectedRole)?.label}
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Demo mode — no registration required. Click to explore any role.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-6 text-center">
        <p className="text-xs text-gray-500">
          Built for <strong>Samadhan 2026</strong> Inter-Collegiate Social Ideathon by SFIT
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Problem Statement ID: 0003 · Blue Ribbon Movement (BRM)
        </p>
      </footer>
    </div>
  );
}
