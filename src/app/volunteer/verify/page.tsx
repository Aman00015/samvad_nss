'use client';

import { useEffect, useState } from 'react';
import { useComplaintStore } from '@/lib/complaint-store';
import { useAuthStore } from '@/lib/auth-store';
import { PageHeader, Button, Textarea, StatusBadge } from '@/components/ui';
import { CATEGORY_CONFIG, STATUS_CONFIG } from '@/lib/constants';
import { format } from 'date-fns';
import { CheckCircle, MapPin, Camera, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

export default function VolunteerVerifyPage() {
  const { initialize, complaints, updateComplaintStatus, addFollowUp } = useComplaintStore();
  const { user } = useAuthStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState('');

  useEffect(() => { initialize(); }, [initialize]);

  const pendingVerification = complaints.filter(
    (c) => c.status === 'pending' || (c.status === 'in-progress' && !c.assignedVolunteerId)
  );

  const handleVerify = (complaintId: string) => {
    if (!user) return;
    updateComplaintStatus(complaintId, 'verified');
    addFollowUp(complaintId, {
      complaintId,
      authorId: user.id,
      authorName: user.name,
      authorRole: 'volunteer',
      content: verifyNote.trim() || 'Verified on-site. Issue confirmed as reported.',
      createdAt: new Date().toISOString(),
      type: 'verification',
    });
    setActiveId(null);
    setVerifyNote('');
  };

  const handleReject = (complaintId: string) => {
    if (!user) return;
    addFollowUp(complaintId, {
      complaintId,
      authorId: user.id,
      authorName: user.name,
      authorRole: 'volunteer',
      content: verifyNote.trim() || 'Verification failed. Issue could not be confirmed on-site.',
      createdAt: new Date().toISOString(),
      type: 'note',
    });
    setActiveId(null);
    setVerifyNote('');
  };

  return (
    <div>
      <PageHeader
        title="Field Verification"
        subtitle={`${pendingVerification.length} complaint(s) awaiting verification`}
      />

      {pendingVerification.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <CheckCircle className="mx-auto mb-3 text-green-400" size={40} />
          <p className="text-gray-500">All complaints have been verified!</p>
          <Link href="/volunteer" className="text-blue-600 text-sm mt-2 inline-block">← Back to dashboard</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingVerification.map((complaint) => {
            const cat = CATEGORY_CONFIG[complaint.category];
            const st = STATUS_CONFIG[complaint.status];
            const isActive = activeId === complaint.id;

            return (
              <div key={complaint.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{complaint.ticketNumber}</span>
                        <StatusBadge status={st.label} color={st.color} bgColor={st.bgColor} />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{complaint.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{complaint.description}</p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin size={12} />{complaint.area}</span>
                        <span style={{ color: cat.color }}>{cat.label}</span>
                        <span>Filed {format(new Date(complaint.createdAt), 'MMM dd')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-3">
                      <Link href={`/volunteer/tasks/${complaint.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />}>View</Button>
                      </Link>
                      <Button
                        variant={isActive ? 'secondary' : 'primary'}
                        size="sm"
                        icon={isActive ? <ArrowRight size={14} /> : <Camera size={14} />}
                        onClick={() => {
                          setActiveId(isActive ? null : complaint.id);
                          setVerifyNote('');
                        }}
                      >
                        {isActive ? 'Cancel' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                </div>

                {isActive && (
                  <div className="border-t border-gray-100 bg-blue-50/50 p-4 space-y-3">
                    <p className="text-xs font-medium text-gray-700">
                      🔍 Field Verification — Visit the complaint location and confirm or reject the report.
                    </p>

                    <Textarea
                      placeholder="Add verification notes (condition observed, photo taken, etc.)..."
                      value={verifyNote}
                      onChange={setVerifyNote}
                      rows={2}
                    />

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        icon={<CheckCircle size={14} />}
                        onClick={() => handleVerify(complaint.id)}
                      >
                        Confirm &amp; Verify
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(complaint.id)}
                      >
                        Cannot Verify
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
