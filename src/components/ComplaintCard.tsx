'use client';

import type { Complaint } from '@/types';
import { CATEGORY_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { format, formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, AlertTriangle, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ComplaintCardProps {
  complaint: Complaint;
  showActions?: boolean;
  linkPrefix?: string;
}

export default function ComplaintCard({ complaint, linkPrefix = '/citizen/complaints' }: ComplaintCardProps) {
  const category = CATEGORY_CONFIG[complaint.category];
  const status = STATUS_CONFIG[complaint.status];
  const priority = PRIORITY_CONFIG[complaint.priority];

  return (
    <Link
      href={`${linkPrefix}/${complaint.id}`}
      className="block bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">{complaint.ticketNumber}</span>
              {complaint.isOverdue && complaint.status !== 'resolved' && (
                <span className="flex items-center gap-0.5 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                  <AlertTriangle size={10} />
                  Overdue
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{complaint.title}</h3>
          </div>
          <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{complaint.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: status.bgColor, color: status.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
            {status.label}
          </span>
          <span
            className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100"
            style={{ color: category.color }}
          >
            {category.label}
          </span>
          <span
            className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-50"
            style={{ color: priority.color }}
          >
            {priority.label}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {complaint.area}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
            </span>
          </div>
          {complaint.assignedVolunteerName && (
            <span className="flex items-center gap-1 text-blue-600">
              <User size={11} />
              {complaint.assignedVolunteerName.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Compact version for lists
 */
export function ComplaintCardCompact({ complaint, linkPrefix = '/citizen/complaints' }: ComplaintCardProps) {
  const category = CATEGORY_CONFIG[complaint.category];
  const status = STATUS_CONFIG[complaint.status];

  return (
    <Link
      href={`${linkPrefix}/${complaint.id}`}
      className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all"
    >
      <div
        className="w-2 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: status.color }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{complaint.title}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span>{complaint.ticketNumber}</span>
          <span>·</span>
          <span style={{ color: category.color }}>{category.label}</span>
          <span>·</span>
          <span>{complaint.area}</span>
        </div>
      </div>
      {complaint.isOverdue && complaint.status !== 'resolved' && (
        <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
      )}
      <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
    </Link>
  );
}
