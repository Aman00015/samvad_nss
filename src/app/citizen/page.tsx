'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useComplaintStore } from '@/lib/complaint-store';
import ComplaintCard from '@/components/ComplaintCard';
import { PageHeader, StatCard, EmptyState, Button } from '@/components/ui';
import { Plus, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CitizenDashboard() {
  const { user } = useAuthStore();
  const { complaints, initialize, getComplaintsByCitizen } = useComplaintStore();

  useEffect(() => { initialize(); }, [initialize]);

  const myComplaints = user ? getComplaintsByCitizen(user.id) : [];
  const pending = myComplaints.filter((c) => c.status === 'pending').length;
  const inProgress = myComplaints.filter((c) => ['verified', 'in-progress'].includes(c.status)).length;
  const resolved = myComplaints.filter((c) => c.status === 'resolved').length;
  const overdue = myComplaints.filter((c) => c.isOverdue && c.status !== 'resolved').length;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Citizen'}`}
        subtitle="Track your civic complaints and file new issues"
        action={
          <Link href="/citizen/new-complaint">
            <Button icon={<Plus size={16} />}>File Complaint</Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard title="Total Filed" value={myComplaints.length} icon={<FileText size={20} />} color="blue" />
        <StatCard title="Pending" value={pending} icon={<Clock size={20} />} color="amber" />
        <StatCard title="In Progress" value={inProgress} icon={<Clock size={20} />} color="purple" />
        <StatCard title="Resolved" value={resolved} icon={<CheckCircle size={20} />} color="green" />
      </div>

      {overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 mb-6">
          <AlertTriangle size={18} className="text-red-600" />
          <p className="text-sm text-red-800">
            <strong>{overdue}</strong> complaint{overdue > 1 ? 's are' : ' is'} overdue. Authorities have exceeded SLA deadlines.
          </p>
        </div>
      )}

      {/* Recent Complaints */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">My Recent Complaints</h2>
      {myComplaints.length === 0 ? (
        <EmptyState
          title="No complaints yet"
          description="File your first civic complaint to get started. Your voice matters!"
          icon={<FileText size={48} />}
          action={
            <Link href="/citizen/new-complaint">
              <Button icon={<Plus size={16} />}>File First Complaint</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myComplaints.slice(0, 6).map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} linkPrefix="/citizen/complaints" />
          ))}
        </div>
      )}
    </div>
  );
}
