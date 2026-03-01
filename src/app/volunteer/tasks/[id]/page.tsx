'use client';

import { use, useEffect, useState } from 'react';
import { useComplaintStore } from '@/lib/complaint-store';
import { useAuthStore } from '@/lib/auth-store';
import { PageHeader, StatusBadge, Button, Textarea } from '@/components/ui';
import { CATEGORY_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { format } from 'date-fns';
import {
  MapPin, ArrowLeft, CheckCircle, AlertTriangle, ChevronUp,
  MessageSquare, UserPlus, Send,
} from 'lucide-react';
import Link from 'next/link';
import type { ComplaintStatus } from '@/types';

export default function VolunteerTaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { initialize, getComplaintById, updateComplaintStatus, assignVolunteer, addFollowUp } = useComplaintStore();
  const { user } = useAuthStore();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { initialize(); }, [initialize]);

  const complaint = getComplaintById(id);

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <Link href="/volunteer" className="text-blue-600 text-sm mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  const category = CATEGORY_CONFIG[complaint.category];
  const status = STATUS_CONFIG[complaint.status];
  const priority = PRIORITY_CONFIG[complaint.priority];
  const isAssignedToMe = complaint.assignedVolunteerId === user?.id;
  const canSelfAssign = !complaint.assignedVolunteerId && complaint.status === 'pending';

  const handleSelfAssign = () => {
    if (!user) return;
    assignVolunteer(complaint.id, user.id, user.name);
  };

  const handleStatusChange = (newStatus: ComplaintStatus) => {
    updateComplaintStatus(complaint.id, newStatus);
  };

  const handleAddNote = async () => {
    if (!note.trim() || !user) return;
    setSubmitting(true);

    addFollowUp(complaint.id, {
      complaintId: complaint.id,
      authorId: user.id,
      authorName: user.name,
      authorRole: 'volunteer',
      content: note.trim(),
      createdAt: new Date().toISOString(),
      type: 'note',
    });

    setNote('');
    setSubmitting(false);
  };

  const handleVerify = async () => {
    if (!user) return;
    updateComplaintStatus(complaint.id, 'verified');
    addFollowUp(complaint.id, {
      complaintId: complaint.id,
      authorId: user.id,
      authorName: user.name,
      authorRole: 'volunteer',
      content: note.trim() || 'Issue verified on-site by volunteer.',
      createdAt: new Date().toISOString(),
      type: 'verification',
    });
    setNote('');
  };

  const handleEscalate = async () => {
    if (!user) return;
    updateComplaintStatus(complaint.id, 'escalated');
    addFollowUp(complaint.id, {
      complaintId: complaint.id,
      authorId: user.id,
      authorName: user.name,
      authorRole: 'volunteer',
      content: note.trim() || 'Issue escalated due to no resolution within SLA.',
      createdAt: new Date().toISOString(),
      type: 'escalation',
    });
    setNote('');
  };

  const handleResolve = async () => {
    if (!user) return;
    updateComplaintStatus(complaint.id, 'resolved');
    addFollowUp(complaint.id, {
      complaintId: complaint.id,
      authorId: user.id,
      authorName: user.name,
      authorRole: 'volunteer',
      content: note.trim() || 'Issue has been resolved. Verified on-site.',
      createdAt: new Date().toISOString(),
      type: 'resolution',
    });
    setNote('');
  };

  return (
    <div>
      <Link href="/volunteer/tasks" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={14} />
        Back to tasks
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-mono text-gray-400 mb-1">{complaint.ticketNumber}</p>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{complaint.title}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <StatusBadge status={status.label} color={status.color} bgColor={status.bgColor} size="md" />
              <span className="text-sm px-3 py-1 rounded-full bg-gray-100" style={{ color: category.color }}>
                {category.label}
              </span>
              <span className="text-sm px-3 py-1 rounded-full bg-gray-50" style={{ color: priority.color }}>
                {priority.label}
              </span>
              {complaint.isOverdue && complaint.status !== 'resolved' && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <AlertTriangle size={12} /> Overdue
                </span>
              )}
            </div>

            <p className="text-sm text-gray-700">{complaint.description}</p>

            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={12} />{complaint.address}</span>
              <span>{complaint.area}, {complaint.ward}</span>
            </div>
          </div>

          {/* Volunteer Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Volunteer Actions</h2>

            {canSelfAssign && (
              <Button
                icon={<UserPlus size={16} />}
                onClick={handleSelfAssign}
                fullWidth
                size="lg"
              >
                Self-Assign This Task
              </Button>
            )}

            {isAssignedToMe && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Add field notes, observations, or follow-up details..."
                  value={note}
                  onChange={setNote}
                  rows={3}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Send size={14} />}
                    onClick={handleAddNote}
                    disabled={!note.trim()}
                    loading={submitting}
                  >
                    Add Note
                  </Button>
                  {complaint.status === 'pending' && (
                    <Button
                      size="sm"
                      icon={<CheckCircle size={14} />}
                      onClick={handleVerify}
                    >
                      Verify
                    </Button>
                  )}
                  {['verified', 'in-progress'].includes(complaint.status) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<CheckCircle size={14} />}
                      onClick={handleResolve}
                    >
                      Resolve
                    </Button>
                  )}
                  {complaint.status !== 'resolved' && complaint.status !== 'escalated' && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<ChevronUp size={14} />}
                      onClick={handleEscalate}
                    >
                      Escalate
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!canSelfAssign && !isAssignedToMe && (
              <p className="text-sm text-gray-500">
                This task is assigned to {complaint.assignedVolunteerName || 'another volunteer'}.
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity</h2>
            {complaint.followUps.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {complaint.followUps.map((fu) => (
                  <div key={fu.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${
                      fu.type === 'verification' ? 'bg-blue-500' :
                      fu.type === 'resolution' ? 'bg-green-500' :
                      fu.type === 'escalation' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}>
                      {fu.type === 'verification' ? <CheckCircle size={14} /> :
                       fu.type === 'resolution' ? <CheckCircle size={14} /> :
                       fu.type === 'escalation' ? <ChevronUp size={14} /> :
                       <MessageSquare size={14} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-gray-900">{fu.authorName}</span>
                        <span className="text-gray-400 capitalize">({fu.type})</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5">{fu.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{format(new Date(fu.createdAt), 'MMM dd, h:mm a')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>{complaint.address}</p>
              <p className="text-xs text-gray-500">{complaint.area}, {complaint.ward}</p>
              <p className="text-xs font-mono text-gray-400 mt-2">
                {complaint.geoLocation.latitude.toFixed(6)}, {complaint.geoLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Reported By</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {complaint.citizenName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{complaint.citizenName}</p>
                <p className="text-xs text-gray-500">Citizen</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">SLA Info</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Deadline</span>
                <span className="text-gray-700">{complaint.slaDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Filed</span>
                <span className="text-gray-700">{format(new Date(complaint.createdAt), 'MMM dd')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={complaint.isOverdue ? 'text-red-600 font-medium' : 'text-green-600'}>
                  {complaint.isOverdue ? 'Overdue' : 'Within SLA'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
