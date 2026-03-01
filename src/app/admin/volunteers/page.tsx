'use client';

import { useEffect, useMemo, useState } from 'react';
import { useComplaintStore } from '@/lib/complaint-store';
import { PageHeader, StatusBadge, Button } from '@/components/ui';
import { CATEGORY_CONFIG } from '@/lib/constants';
import { Users, Award, MapPin, CheckCircle, Clock, TrendingUp, UserPlus } from 'lucide-react';

interface VolunteerSummary {
  id: string;
  name: string;
  totalAssigned: number;
  resolved: number;
  pending: number;
  inProgress: number;
  areas: string[];
  categories: string[];
  score: number;
}

export default function AdminVolunteersPage() {
  const { initialize, complaints, assignVolunteer } = useComplaintStore();

  useEffect(() => { initialize(); }, [initialize]);

  const volunteers = useMemo(() => {
    const map = new Map<string, VolunteerSummary>();

    complaints.forEach((c) => {
      if (!c.assignedVolunteerId || !c.assignedVolunteerName) return;
      const id = c.assignedVolunteerId;

      if (!map.has(id)) {
        map.set(id, {
          id,
          name: c.assignedVolunteerName,
          totalAssigned: 0,
          resolved: 0,
          pending: 0,
          inProgress: 0,
          areas: [],
          categories: [],
          score: 0,
        });
      }

      const v = map.get(id)!;
      v.totalAssigned++;
      if (c.status === 'resolved') v.resolved++;
      else if (c.status === 'pending') v.pending++;
      else v.inProgress++;

      if (!v.areas.includes(c.area)) v.areas.push(c.area);
      if (!v.categories.includes(c.category)) v.categories.push(c.category);
    });

    map.forEach((v) => {
      v.score = v.totalAssigned > 0 ? Math.round((v.resolved / v.totalAssigned) * 100) : 0;
    });

    return [...map.values()].sort((a, b) => b.score - a.score);
  }, [complaints]);

  const unassigned = useMemo(
    () => complaints.filter(c => !c.assignedVolunteerId && c.status !== 'resolved'),
    [complaints]
  );

  const handleQuickAssign = (complaintId: string) => {
    if (volunteers.length === 0) return;
    // Simple round-robin: assign to volunteer with least active tasks
    const sorted = [...volunteers].sort((a, b) => (a.totalAssigned - a.resolved) - (b.totalAssigned - b.resolved));
    const best = sorted[0];
    assignVolunteer(complaintId, best.id, best.name);
  };

  return (
    <div>
      <PageHeader
        title="Volunteer Management"
        subtitle={`${volunteers.length} active volunteers, ${unassigned.length} unassigned complaints`}
      />

      {/* Volunteer Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {volunteers.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-white rounded-xl border border-gray-200">
            <Users className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500 text-sm">No volunteers have been assigned yet</p>
          </div>
        ) : (
          volunteers.map((v) => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">{v.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{v.name}</h3>
                  <p className="text-xs text-gray-500">{v.totalAssigned} assigned tasks</p>
                </div>
                <div className="ml-auto">
                  <div className={`text-lg font-bold ${v.score >= 70 ? 'text-green-600' : v.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {v.score}%
                  </div>
                  <p className="text-xs text-gray-400 text-right">score</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{v.resolved}</p>
                  <p className="text-xs text-green-700">Resolved</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{v.inProgress}</p>
                  <p className="text-xs text-blue-700">Active</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">{v.pending}</p>
                  <p className="text-xs text-yellow-700">Pending</p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin size={10} />
                  <span>{v.areas.slice(0, 3).join(', ')}{v.areas.length > 3 ? ` +${v.areas.length - 3}` : ''}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {v.categories.slice(0, 4).map(cat => (
                    <span key={cat} className="px-2 py-0.5 bg-gray-100 rounded text-xs" style={{ color: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.color }}>
                      {CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label || cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Unassigned Complaints */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus size={16} />
          Unassigned Complaints ({unassigned.length})
        </h2>

        {unassigned.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">All complaints are assigned!</p>
        ) : (
          <div className="space-y-2">
            {unassigned.map((c) => {
              const cat = CATEGORY_CONFIG[c.category];
              return (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="font-mono">{c.ticketNumber}</span>
                      <span style={{ color: cat.color }}>{cat.label}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} />{c.area}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<UserPlus size={14} />}
                    onClick={() => handleQuickAssign(c.id)}
                    disabled={volunteers.length === 0}
                  >
                    Auto-Assign
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
