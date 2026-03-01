'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useComplaintStore } from '@/lib/complaint-store';
import ComplaintCard from '@/components/ComplaintCard';
import { PageHeader, StatCard, EmptyState } from '@/components/ui';
import { calculateVolunteerStats } from '@/lib/analytics';
import { ClipboardCheck, Clock, CheckCircle, AlertTriangle, Star, Zap } from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuthStore();
  const { complaints, initialize, getComplaintsByVolunteer } = useComplaintStore();

  useEffect(() => { initialize(); }, [initialize]);

  const myTasks = user ? getComplaintsByVolunteer(user.id) : [];
  const stats = user ? calculateVolunteerStats(complaints, user.id) : null;

  const pendingVerification = complaints.filter(
    (c) => c.status === 'pending' && !c.assignedVolunteerId
  );

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Volunteer'}`}
        subtitle="Your field assignments and verification tasks"
      />

      {/* Performance Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            title="Assigned"
            value={stats.totalAssigned}
            icon={<ClipboardCheck size={20} />}
            color="blue"
          />
          <StatCard
            title="Verified"
            value={stats.totalVerified}
            icon={<CheckCircle size={20} />}
            color="green"
          />
          <StatCard
            title="Active"
            value={stats.activeComplaints}
            icon={<Clock size={20} />}
            color="amber"
          />
          <StatCard
            title="Rating"
            value={`${stats.rating}/5`}
            icon={<Star size={20} />}
            color="purple"
            subtitle={`${stats.averageResponseTime}h avg response`}
          />
        </div>
      )}

      {/* Pending Verification */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          Available for Verification ({pendingVerification.length})
        </h2>
        {pendingVerification.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-800">All complaints are assigned! Great team effort.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingVerification.slice(0, 4).map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} linkPrefix="/volunteer/tasks" />
            ))}
          </div>
        )}
      </div>

      {/* My Active Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          My Active Tasks ({myTasks.filter((c) => c.status !== 'resolved').length})
        </h2>
        {myTasks.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            description="Pick up unassigned complaints from the list above to start verifying."
            icon={<ClipboardCheck size={48} />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myTasks
              .filter((c) => c.status !== 'resolved')
              .map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} linkPrefix="/volunteer/tasks" />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
