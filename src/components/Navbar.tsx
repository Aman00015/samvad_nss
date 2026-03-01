'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useConnectivityStore } from '@/lib/sync';
import {
  Menu,
  X,
  Bell,
  Wifi,
  WifiOff,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Users,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { UserRole } from '@/types';

const NAV_ITEMS: Record<UserRole, { label: string; href: string; icon: React.ReactNode }[]> = {
  citizen: [
    { label: 'Home', href: '/citizen', icon: <Home size={18} /> },
    { label: 'My Complaints', href: '/citizen/complaints', icon: <User size={18} /> },
    { label: 'File Complaint', href: '/citizen/new-complaint', icon: <Shield size={18} /> },
  ],
  volunteer: [
    { label: 'Dashboard', href: '/volunteer', icon: <Home size={18} /> },
    { label: 'Assigned Tasks', href: '/volunteer/tasks', icon: <Users size={18} /> },
    { label: 'Field Verify', href: '/volunteer/verify', icon: <Shield size={18} /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: <Home size={18} /> },
    { label: 'All Complaints', href: '/admin/complaints', icon: <Shield size={18} /> },
    { label: 'Volunteers', href: '/admin/volunteers', icon: <Users size={18} /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <Shield size={18} /> },
    { label: 'Social Feed', href: '/admin/social', icon: <Shield size={18} /> },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout, switchRole } = useAuthStore();
  const { isOnline, pendingSyncCount } = useConnectivityStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  if (!isAuthenticated || !user) return null;

  const navItems = NAV_ITEMS[user.role] || [];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${user.role}`} className="flex items-center gap-2">
            <img src="/image.png" alt="Samvaad Logo" className="w-8 h-8 rounded-lg object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Samvaad</h1>
              <p className="text-xs text-gray-500 -mt-1">Civic Platform</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Connectivity Status */}
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
              {pendingSyncCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white px-1.5 rounded-full text-[10px]">
                  {pendingSyncCount}
                </span>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Role Switcher (for demo) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:block text-gray-700">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="py-1 border-b border-gray-100">
                    <p className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider">Switch Role (Demo)</p>
                    {(['citizen', 'volunteer', 'admin'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => { switchRole(role); setRoleMenuOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 capitalize ${user.role === role ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                      >
                        {role === 'admin' ? 'Admin (NGO)' : role}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
