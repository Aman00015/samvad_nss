'use client';

import { use, useEffect } from 'react';
import { useComplaintStore } from '@/lib/complaint-store';
import { useAuthStore } from '@/lib/auth-store';
import { PageHeader, StatusBadge, Button } from '@/components/ui';
import { MediaPreview } from '@/components/MediaCapture';
import { CATEGORY_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { format, formatDistanceToNow } from 'date-fns';
import {
  MapPin, Clock, User, AlertTriangle, ArrowLeft,
  MessageSquare, CheckCircle, ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

export default function ComplaintDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { initialize, getComplaintById } = useComplaintStore();
  const { user } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  const complaint = getComplaintById(id);

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Complaint not found</p>
        <Link href="/citizen/complaints" className="text-blue-600 text-sm mt-2 inline-block">
          ← Back to complaints
        </Link>
      </div>
    );
  }

  const category = CATEGORY_CONFIG[complaint.category];
  const status = STATUS_CONFIG[complaint.status];
  const priority = PRIORITY_CONFIG[complaint.priority];

  return (
    <div>
      <Link href="/citizen/complaints" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={14} />
        Back to complaints
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono text-gray-400 mb-1">{complaint.ticketNumber}</p>
                <h1 className="text-xl font-bold text-gray-900">{complaint.title}</h1>
              </div>
              {complaint.isOverdue && complaint.status !== 'resolved' && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <AlertTriangle size={12} />
                  Overdue
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <StatusBadge status={status.label} color={status.color} bgColor={status.bgColor} size="md" />
              <span className="inline-flex items-center text-sm px-3 py-1 rounded-full bg-gray-100" style={{ color: category.color }}>
                {category.label}
              </span>
              <span className="inline-flex items-center text-sm px-3 py-1 rounded-full bg-gray-50" style={{ color: priority.color }}>
                {priority.label} Priority
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
          </div>

          {/* Media */}
          {complaint.media.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Evidence ({complaint.media.length})</h2>
              <MediaPreview media={complaint.media} readOnly />
            </div>
          )}

          {/* Timeline / Follow-ups */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Activity Timeline ({complaint.followUps.length})
            </h2>

            {complaint.followUps.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No follow-ups yet</p>
            ) : (
              <div className="space-y-4">
                {complaint.followUps.map((followUp, index) => (
                  <div key={followUp.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                        followUp.type === 'verification' ? 'bg-blue-500' :
                        followUp.type === 'resolution' ? 'bg-green-500' :
                        followUp.type === 'escalation' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}>
                        {followUp.type === 'verification' ? <CheckCircle size={14} /> :
                         followUp.type === 'resolution' ? <CheckCircle size={14} /> :
                         followUp.type === 'escalation' ? <ChevronUp size={14} /> :
                         <MessageSquare size={14} />}
                      </div>
                      {index < complaint.followUps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{followUp.authorName}</span>
                        <span className="text-xs text-gray-400 capitalize">({followUp.authorRole})</span>
                      </div>
                      <p className="text-sm text-gray-700">{followUp.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(followUp.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Location Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-700">{complaint.address}</p>
                  <p className="text-xs text-gray-400">{complaint.area}, {complaint.ward}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                {complaint.geoLocation.latitude.toFixed(6)}, {complaint.geoLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Filed</span>
                <span className="text-gray-700">{format(new Date(complaint.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              {complaint.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified</span>
                  <span className="text-gray-700">{format(new Date(complaint.verifiedAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
              {complaint.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Resolved</span>
                  <span className="text-green-600">{format(new Date(complaint.resolvedAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
              {complaint.escalatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Escalated</span>
                  <span className="text-red-600">{format(new Date(complaint.escalatedAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">SLA</span>
                <span className="text-gray-700">{complaint.slaDays} days</span>
              </div>
            </div>
          </div>

          {/* Assigned Volunteer */}
          {complaint.assignedVolunteerName && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Assigned Volunteer</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                  {complaint.assignedVolunteerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{complaint.assignedVolunteerName}</p>
                  <p className="text-xs text-gray-500">Youth Volunteer</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
