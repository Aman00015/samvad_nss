'use client';

import { useEffect, useMemo, useState } from 'react';
import { useComplaintStore } from '@/lib/complaint-store';
import { PageHeader, StatusBadge, Button } from '@/components/ui';
import { CATEGORY_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG, MMR_AREAS } from '@/lib/constants';
import { format } from 'date-fns';
import { MapPin, Search, Filter, Eye, ChevronUp, CheckCircle, Trash2 } from 'lucide-react';
import type { ComplaintStatus, ComplaintCategory } from '@/types';

export default function AdminComplaintsPage() {
  const { initialize, complaints, updateComplaintStatus } = useComplaintStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');

  useEffect(() => { initialize(); }, [initialize]);

  const filtered = useMemo(() => {
    let list = [...complaints];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.ticketNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (categoryFilter !== 'all') list = list.filter(c => c.category === categoryFilter);
    if (areaFilter !== 'all') list = list.filter(c => c.area === areaFilter);

    list.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'priority') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return a.status.localeCompare(b.status);
    });

    return list;
  }, [complaints, search, statusFilter, categoryFilter, areaFilter, sortBy]);

  const uniqueAreas = useMemo(() => [...new Set(complaints.map(c => c.area))].sort(), [complaints]);

  return (
    <div>
      <PageHeader
        title="All Complaints"
        subtitle={`${filtered.length} of ${complaints.length} complaint(s)`}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by title, ticket, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="all">All Areas</option>
            {uniqueAreas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="date">Sort: Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500 text-sm">No complaints match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Volunteer</th>
                  <th className="px-4 py-3">Filed</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const cat = CATEGORY_CONFIG[c.category];
                  const st = STATUS_CONFIG[c.status];
                  const pri = PRIORITY_CONFIG[c.priority];
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.ticketNumber}</td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px]">
                          <p className="font-medium text-gray-900 truncate">{c.title}</p>
                          {c.isOverdue && c.status !== 'resolved' && (
                            <span className="text-xs text-red-600">⚠ Overdue</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-50 whitespace-nowrap" style={{ color: cat.color }}>{cat.label}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={st.label} color={st.color} bgColor={st.bgColor} /></td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium" style={{ color: pri.color }}>{pri.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1"><MapPin size={10} />{c.area}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.assignedVolunteerName || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{format(new Date(c.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {c.status !== 'resolved' && (
                            <button
                              onClick={() => updateComplaintStatus(c.id, 'resolved')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Mark Resolved"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {c.status !== 'escalated' && c.status !== 'resolved' && (
                            <button
                              onClick={() => updateComplaintStatus(c.id, 'escalated')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Escalate"
                            >
                              <ChevronUp size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
