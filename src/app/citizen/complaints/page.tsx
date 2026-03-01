'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useComplaintStore } from '@/lib/complaint-store';
import ComplaintCard from '@/components/ComplaintCard';
import { PageHeader, EmptyState, Button, Select } from '@/components/ui';
import { Plus, FileText, Filter } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/lib/constants';

export default function CitizenComplaints() {
  const { user } = useAuthStore();
  const { initialize, getComplaintsByCitizen, filters, setFilters, clearFilters } = useComplaintStore();

  useEffect(() => { initialize(); }, [initialize]);

  const allMyComplaints = user ? getComplaintsByCitizen(user.id) : [];
  
  // Apply filters
  let filtered = [...allMyComplaints];
  if (filters.status) filtered = filtered.filter(c => c.status === filters.status);
  if (filters.category) filtered = filtered.filter(c => c.category === filters.category);
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const categoryOptions = Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => ({ value: val, label: cfg.label }));
  const statusOptions = Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({ value: val, label: cfg.label }));

  return (
    <div>
      <PageHeader
        title="My Complaints"
        subtitle={`${allMyComplaints.length} total complaints filed`}
        breadcrumb="Citizen → My Complaints"
        action={
          <Link href="/citizen/new-complaint">
            <Button icon={<Plus size={16} />} size="sm">New Complaint</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {(filters.status || filters.category) && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-700 ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={filters.status || ''}
            onChange={(v) => setFilters({ status: v as any || undefined })}
            options={statusOptions}
            placeholder="All Statuses"
          />
          <Select
            value={filters.category || ''}
            onChange={(v) => setFilters({ category: v as any || undefined })}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={allMyComplaints.length > 0 ? "Try adjusting your filters" : "File your first complaint to get started"}
          icon={<FileText size={48} />}
          action={
            allMyComplaints.length === 0 ? (
              <Link href="/citizen/new-complaint">
                <Button icon={<Plus size={16} />}>File Complaint</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} linkPrefix="/citizen/complaints" />
          ))}
        </div>
      )}
    </div>
  );
}
