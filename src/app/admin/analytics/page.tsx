'use client';

import { useEffect, useMemo } from 'react';
import { useComplaintStore } from '@/lib/complaint-store';
import { PageHeader } from '@/components/ui';
import {
  StatusDistributionPie,
  CategoryBarChart,
  ComplaintTrendLine,
  WardHeatmapBar,
  SLAComplianceChart,
} from '@/components/Charts';
import { CATEGORY_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { differenceInDays, subDays, format, startOfDay } from 'date-fns';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { initialize, complaints } = useComplaintStore();

  useEffect(() => { initialize(); }, [initialize]);

  // Status distribution
  const statusData = useMemo(() => {
    return Object.entries(STATUS_CONFIG).map(([key, config]) => ({
      name: config.label,
      value: complaints.filter(c => c.status === key).length,
      color: config.color,
    })).filter(d => d.value > 0);
  }, [complaints]);

  // Category breakdown
  const categoryData = useMemo(() => {
    return Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      name: config.label,
      count: complaints.filter(c => c.category === key).length,
      color: config.color,
    })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);
  }, [complaints]);

  // Trend (last 30 days)
  const trendData = useMemo(() => {
    const days = 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const filed = complaints.filter(c => format(startOfDay(new Date(c.createdAt)), 'yyyy-MM-dd') === dateStr).length;
      const resolved = complaints.filter(c => c.status === 'resolved' && c.resolvedAt && format(startOfDay(new Date(c.resolvedAt)), 'yyyy-MM-dd') === dateStr).length;
      data.push({
        date: format(date, 'MMM dd'),
        filed,
        resolved,
      });
    }
    return data;
  }, [complaints]);

  // Ward/Area heatmap
  const wardData = useMemo(() => {
    const map = new Map<string, number>();
    complaints.forEach(c => {
      map.set(c.area, (map.get(c.area) || 0) + 1);
    });
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  // SLA compliance
  const slaData = useMemo(() => {
    const withinSla = complaints.filter(c => !c.isOverdue || c.status === 'resolved').length;
    const overdue = complaints.filter(c => c.isOverdue && c.status !== 'resolved').length;
    return [
      { name: 'Within SLA', value: withinSla, color: '#22c55e' },
      { name: 'Overdue', value: overdue, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [complaints]);

  // Priority breakdown
  const priorityData = useMemo(() => {
    return Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
      name: config.label,
      count: complaints.filter(c => c.priority === key).length,
      color: config.color,
    })).filter(d => d.count > 0);
  }, [complaints]);

  // Summary stats
  const summary = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const resolvedWithDays = complaints.filter(c => c.status === 'resolved').map(c =>
      differenceInDays(new Date(c.resolvedAt || new Date()), new Date(c.createdAt))
    );
    const avgDays = resolvedWithDays.length > 0
      ? Math.round(resolvedWithDays.reduce((a, b) => a + b, 0) / resolvedWithDays.length)
      : 0;

    const topCategory = Object.entries(CATEGORY_CONFIG)
      .map(([key, config]) => ({ key, label: config.label, count: complaints.filter(c => c.category === key).length }))
      .sort((a, b) => b.count - a.count)[0];

    const topArea = wardData[0];

    return { total, resolved, rate, avgDays, topCategory, topArea };
  }, [complaints, wardData]);

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        subtitle={`Comprehensive analytics across ${complaints.length} complaints`}
      />

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Complaints', value: summary.total, color: 'text-blue-600' },
          { label: 'Resolution Rate', value: `${summary.rate}%`, color: 'text-green-600' },
          { label: 'Avg Resolution', value: `${summary.avgDays}d`, color: 'text-purple-600' },
          { label: 'Top Category', value: summary.topCategory?.label || '-', color: 'text-orange-600' },
          { label: 'Top Area', value: summary.topArea?.name || '-', color: 'text-pink-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Distribution</h3>
          <StatusDistributionPie data={statusData} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">SLA Compliance</h3>
          <SLAComplianceChart data={slaData} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Complaints by Category</h3>
          <CategoryBarChart data={categoryData} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Complaints by Area</h3>
          <WardHeatmapBar data={wardData} />
        </div>
      </div>

      {/* Trend Chart (full width) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">30-Day Complaint Trend</h3>
        <ComplaintTrendLine data={trendData} />
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {priorityData.map((p) => (
            <div key={p.name} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${p.color}10` }}>
              <p className="text-2xl font-bold" style={{ color: p.color }}>{p.count}</p>
              <p className="text-xs text-gray-500 mt-1">{p.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
