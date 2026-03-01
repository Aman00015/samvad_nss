'use client';

import { useEffect } from 'react';
import { useComplaintStore } from '@/lib/complaint-store';
import { useAuthStore } from '@/lib/auth-store';
import ComplaintCard from '@/components/ComplaintCard';
import { PageHeader, EmptyState } from '@/components/ui';
import { ClipboardCheck } from 'lucide-react';

export default function VolunteerTasks() {
  const { user } = useAuthStore();
  const { initialize, getComplaintsByVolunteer, complaints } = useComplaintStore();

  useEffect(() => { initialize(); }, [initialize]);

  const myTasks = user ? getComplaintsByVolunteer(user.id) : [];
  const active = myTasks.filter((c) => c.status !== 'resolved');
  const completed = myTasks.filter((c) => c.status === 'resolved');

  return (
    <div>
      <PageHeader
        title="My Assigned Tasks"
        subtitle={`${active.length} active, ${completed.length} completed`}
        breadcrumb="Volunteer → Tasks"
      />

      {/* Active Tasks */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Active ({active.length})</h2>
        {active.length === 0 ? (
          <EmptyState
            title="No active tasks"
            description="All your assigned complaints have been resolved!"
            icon={<ClipboardCheck size={48} />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {active.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} linkPrefix="/volunteer/tasks" />
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Completed ({completed.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-75">
            {completed.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} linkPrefix="/volunteer/tasks" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
