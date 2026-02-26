'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { parkingApi } from '@/lib/api';

interface Analytics {
  totalLocations: number;
  activeLocations: number;
  totalAvailableSpots: number;
  totalOccupiedSpots: number;
  totalReservedSpots: number;
  occupancyRate: string;
}

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      parkingApi
        .getAnalytics()
        .then((data) => setAnalytics(data as unknown as Analytics))
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Locations',
      value: analytics?.totalLocations ?? '—',
      icon: '📍',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Active Locations',
      value: analytics?.activeLocations ?? '—',
      icon: '✅',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Available Spots',
      value: analytics?.totalAvailableSpots ?? '—',
      icon: '🅿️',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Occupied Spots',
      value: analytics?.totalOccupiedSpots ?? '—',
      icon: '🚗',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Reserved Spots',
      value: analytics?.totalReservedSpots ?? '—',
      icon: '📋',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Occupancy Rate',
      value: analytics?.occupancyRate ?? '—',
      icon: '📊',
      color: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">ParkingApp Admin</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">{user.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your parking operations
          </p>
        </div>

        {/* Stats grid */}
        {loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
                <div className="h-4 w-24 rounded bg-slate-200 mb-3" />
                <div className="h-8 w-16 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg ${s.color}`}>
                    {s.icon}
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Parking Locations</h3>
            <p className="text-sm text-slate-500">Manage and view all parking locations.</p>
            <p className="text-xs text-slate-400 mt-4 italic">Full implementation coming soon...</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Recent Bookings</h3>
            <p className="text-sm text-slate-500">View latest booking activity.</p>
            <p className="text-xs text-slate-400 mt-4 italic">Full implementation coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
