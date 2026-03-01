'use client';

import { useEffect, useMemo } from 'react';
import { useComplaintStore } from '@/lib/complaint-store';
import { useAuthStore } from '@/lib/auth-store';
import { StatCard, PageHeader, StatusBadge } from '@/components/ui';
import { CATEGORY_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { format, differenceInDays } from 'date-fns';
import {
  BarChart3, AlertTriangle, CheckCircle, Clock, Users, TrendingUp,
  MapPin, FileText, ShieldAlert, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/ComplaintMap'), { ssr: false });

export default function AdminDashboard() {
  const { initialize, complaints } = useComplaintStore();
  const { user } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => ['in-progress', 'verified'].includes(c.status)).length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const escalated = complaints.filter(c => c.status === 'escalated').length;
    const overdue = complaints.filter(c => c.isOverdue && c.status !== 'resolved').length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
    const avgDays = resolvedComplaints.length > 0
      ? Math.round(resolvedComplaints.reduce((sum, c) => sum + differenceInDays(new Date(), new Date(c.createdAt)), 0) / resolvedComplaints.length)
      : 0;

    const categoryBreakdown = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      key,
      label: config.label,
      count: complaints.filter(c => c.category === key).length,
      color: config.color,
    })).sort((a, b) => b.count - a.count);

    const uniqueVolunteers = new Set(complaints.filter(c => c.assignedVolunteerId).map(c => c.assignedVolunteerId));

    return { total, pending, inProgress, resolved, escalated, overdue, resolutionRate, avgDays, categoryBreakdown, activeVolunteers: uniqueVolunteers.size };
  }, [complaints]);

  const recentComplaints = useMemo(
    () => [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [complaints]
  );

  const escalatedComplaints = useMemo(
    () => complaints.filter(c => c.status === 'escalated' || (c.isOverdue && c.status !== 'resolved')),
    [complaints]
  );

  return (
    <div>
      <PageHeader
        title={`Admin Dashboard`}
        subtitle={`Welcome, ${user?.name ?? 'Admin'}. Here's the system overview.`}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <StatCard title="Total" value={stats.total} icon={<FileText size={18} />} color="blue" />
        <StatCard title="Pending" value={stats.pending} icon={<Clock size={18} />} color="amber" />
        <StatCard title="In Progress" value={stats.inProgress} icon={<TrendingUp size={18} />} color="blue" />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle size={18} />} color="green" />
        <StatCard title="Escalated" value={stats.escalated} icon={<ShieldAlert size={18} />} color="red" />
        <StatCard title="Overdue" value={stats.overdue} icon={<AlertTriangle size={18} />} color="red" />
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.resolutionRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Resolution Rate</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${stats.resolutionRate}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.avgDays}</p>
          <p className="text-sm text-gray-500 mt-1">Avg. Resolution (days)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.activeVolunteers}</p>
          <p className="text-sm text-gray-500 mt-1">Active Volunteers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">By Category</h2>
            <Link href="/admin/analytics" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Analytics <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.categoryBreakdown.map((cat) => (
              <div key={cat.key} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-gray-700 flex-1">{cat.label}</span>
                <span className="text-sm font-semibold text-gray-900">{cat.count}</span>
                <div className="w-20 bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: cat.color, width: `${stats.total > 0 ? (cat.count / stats.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalated / Overdue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-red-700 flex items-center gap-1">
              <AlertTriangle size={14} /> Requires Attention ({escalatedComplaints.length})
            </h2>
            <Link href="/admin/complaints" className="text-xs text-blue-600 hover:underline">View All →</Link>
          </div>

          {escalatedComplaints.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No escalated or overdue complaints!</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {escalatedComplaints.slice(0, 6).map((c) => {
                const st = STATUS_CONFIG[c.status];
                return (
                  <Link key={c.id} href={`/admin/complaints`} className="flex items-center justify-between p-2 hover:bg-red-50 rounded-lg transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin size={10} />{c.area}</span>
                        <span>{format(new Date(c.createdAt), 'MMM dd')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {c.isOverdue && <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">Overdue</span>}
                      <StatusBadge status={st.label} color={st.color} bgColor={st.bgColor} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Complaint Map — MMR Overview</h2>
        <div className="h-72 rounded-lg overflow-hidden">
          <ComplaintMap complaints={complaints} height="100%" />
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Complaints</h2>
          <Link href="/admin/complaints" className="text-xs text-blue-600 hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="pb-2 pr-4">Ticket</th>
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Priority</th>
                <th className="pb-2 pr-4">Area</th>
                <th className="pb-2">Filed</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((c) => {
                const cat = CATEGORY_CONFIG[c.category];
                const st = STATUS_CONFIG[c.status];
                const pri = PRIORITY_CONFIG[c.priority];
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-mono text-xs text-gray-400">{c.ticketNumber}</td>
                    <td className="py-2 pr-4 text-gray-900 font-medium truncate max-w-[200px]">{c.title}</td>
                    <td className="py-2 pr-4">
                      <span className="text-xs" style={{ color: cat.color }}>{cat.label}</span>
                    </td>
                    <td className="py-2 pr-4"><StatusBadge status={st.label} color={st.color} bgColor={st.bgColor} /></td>
                    <td className="py-2 pr-4">
                      <span className="text-xs font-medium" style={{ color: pri.color }}>{pri.label}</span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-gray-500">{c.area}</td>
                    <td className="py-2 text-xs text-gray-500">{format(new Date(c.createdAt), 'MMM dd')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
