'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '@/types';
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/lib/constants';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

// ==================== STATUS DISTRIBUTION PIE ====================
interface StatusPieProps {
  complaints?: Complaint[];
  data?: { name: string; value: number; color: string }[];
}

export function StatusDistributionPie({ complaints, data: externalData }: StatusPieProps) {
  const data = externalData ?? Object.entries(STATUS_CONFIG).map(([status, config]) => ({
    name: config.label,
    value: (complaints ?? []).filter((c) => c.status === status).length,
    color: config.color,
  })).filter((d) => d.value > 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==================== CATEGORY BAR CHART ====================
interface CategoryBarProps {
  complaints?: Complaint[];
  data?: { name: string; count: number; color: string }[];
}

export function CategoryBarChart({ complaints, data: externalData }: CategoryBarProps) {
  const data = externalData?.map(d => ({
    ...d,
    fullName: d.name,
    name: d.name.length > 12 ? d.name.substring(0, 12) + '…' : d.name,
  })) ?? Object.entries(CATEGORY_CONFIG).map(([category, config]) => ({
    name: config.label.length > 12 ? config.label.substring(0, 12) + '…' : config.label,
    fullName: config.label,
    count: (complaints ?? []).filter((c) => c.category === category).length,
    color: config.color,
  })).filter((d) => d.count > 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                const d = payload[0].payload;
                return (
                  <div className="bg-white shadow-lg rounded-lg border px-3 py-2 text-sm">
                    <p className="font-medium">{d.fullName}</p>
                    <p className="text-gray-600">{d.count} complaints</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==================== COMPLAINT TREND LINE ====================
interface TrendLineProps {
  complaints?: Complaint[];
  data?: { date: string; filed: number; resolved: number }[];
  days?: number;
}

export function ComplaintTrendLine({ complaints, data: externalData, days = 14 }: TrendLineProps) {
  const data = externalData ?? (() => {
    const interval = eachDayOfInterval({
      start: subDays(new Date(), days),
      end: new Date(),
    });
    return interval.map((date) => {
      const dayStart = startOfDay(date);
      const dayComplaints = (complaints ?? []).filter((c) => {
        const created = startOfDay(new Date(c.createdAt));
        return created.getTime() === dayStart.getTime();
      });
      const resolved = (complaints ?? []).filter((c) => {
        if (!c.resolvedAt) return false;
        const resolvedDate = startOfDay(new Date(c.resolvedAt));
        return resolvedDate.getTime() === dayStart.getTime();
      });
      return {
        date: format(date, 'MMM dd'),
        filed: dayComplaints.length,
        resolved: resolved.length,
      };
    });
  })();

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="filed" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} name="Filed" />
          <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} name="Resolved" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==================== WARD HEATMAP BAR ====================
interface WardHeatmapProps {
  complaints?: Complaint[];
  data?: { name: string; count: number }[];
}

export function WardHeatmapBar({ complaints, data: externalData }: WardHeatmapProps) {
  const data = externalData ?? (() => {
    const wardCounts = new Map<string, number>();
    (complaints ?? []).forEach((c) => {
      wardCounts.set(c.area, (wardCounts.get(c.area) || 0) + 1);
    });
    return Array.from(wardCounts.entries())
      .map(([area, count]) => ({ name: area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  })();

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-24 text-right truncate">{item.name}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-8">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== SLA COMPLIANCE ====================
interface SLAChartProps {
  complaints?: Complaint[];
  data?: { name: string; value: number; color: string }[];
}

export function SLAComplianceChart({ complaints, data: externalData }: SLAChartProps) {
  const data = externalData ?? (() => {
    const onTime = (complaints ?? []).filter((c) => c.status === 'resolved' && !c.isOverdue).length;
    const overdue = (complaints ?? []).filter((c) => c.isOverdue).length;
    const within = (complaints ?? []).filter((c) => !c.isOverdue && c.status !== 'resolved').length;
    return [
      { name: 'On Time', value: onTime, color: '#22c55e' },
      { name: 'Overdue', value: overdue, color: '#ef4444' },
      { name: 'Within SLA', value: within, color: '#3b82f6' },
    ].filter((d) => d.value > 0);
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">SLA Compliance</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={70}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
