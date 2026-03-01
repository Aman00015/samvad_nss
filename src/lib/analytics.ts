import type { Complaint, WardStats, VolunteerStats, ComplaintCategory } from '@/types';
import { CATEGORY_CONFIG } from './constants';
import { differenceInDays, differenceInHours } from 'date-fns';

/**
 * Generate ward-level statistics from complaint data.
 */
export function calculateWardStats(complaints: Complaint[]): WardStats[] {
  const wardMap = new Map<string, Complaint[]>();

  complaints.forEach((c) => {
    const existing = wardMap.get(c.ward) || [];
    existing.push(c);
    wardMap.set(c.ward, existing);
  });

  return Array.from(wardMap.entries()).map(([ward, items]) => {
    const pending = items.filter((c) => c.status === 'pending').length;
    const inProgress = items.filter((c) => c.status === 'in-progress' || c.status === 'verified').length;
    const resolved = items.filter((c) => c.status === 'resolved').length;
    const escalated = items.filter((c) => c.status === 'escalated').length;

    // Calculate average resolution time
    const resolvedItems = items.filter((c) => c.resolvedAt);
    const avgDays = resolvedItems.length > 0
      ? resolvedItems.reduce((sum, c) => {
          return sum + differenceInDays(new Date(c.resolvedAt!), new Date(c.createdAt));
        }, 0) / resolvedItems.length
      : 0;

    // Top categories
    const categoryCount = new Map<ComplaintCategory, number>();
    items.forEach((c) => {
      categoryCount.set(c.category, (categoryCount.get(c.category) || 0) + 1);
    });
    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const overdueCount = items.filter((c) => c.isOverdue && c.status !== 'resolved').length;

    return {
      ward,
      totalComplaints: items.length,
      pending,
      inProgress,
      resolved,
      escalated,
      averageResolutionDays: Math.round(avgDays * 10) / 10,
      topCategories,
      overdueCount,
    };
  });
}

/**
 * Generate volunteer performance statistics.
 */
export function calculateVolunteerStats(complaints: Complaint[], volunteerId: string): VolunteerStats {
  const assigned = complaints.filter((c) => c.assignedVolunteerId === volunteerId);
  const verified = assigned.filter((c) => c.verifiedAt);
  const resolved = assigned.filter((c) => c.status === 'resolved');
  const escalated = assigned.filter((c) => c.status === 'escalated');
  const active = assigned.filter((c) => c.status !== 'resolved' && c.status !== 'escalated');

  // Average response time (time from assignment to first follow-up)
  const responseTimes = assigned
    .filter((c) => c.followUps.length > 0)
    .map((c) => differenceInHours(new Date(c.followUps[0].createdAt), new Date(c.createdAt)));
  
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  // Simple rating based on resolution rate
  const resolutionRate = assigned.length > 0 ? resolved.length / assigned.length : 0;
  const rating = Math.min(5, Math.max(1, Math.round(resolutionRate * 5 * 10) / 10));

  return {
    volunteerId,
    totalAssigned: assigned.length,
    totalVerified: verified.length,
    totalResolved: resolved.length,
    totalEscalated: escalated.length,
    averageResponseTime: Math.round(avgResponseTime),
    rating: rating || 3,
    activeComplaints: active.length,
  };
}

/**
 * Check if a complaint has exceeded its SLA deadline.
 */
export function checkSLAStatus(complaint: Complaint): {
  isOverdue: boolean;
  daysRemaining: number;
  percentUsed: number;
} {
  if (complaint.status === 'resolved') {
    return { isOverdue: false, daysRemaining: 0, percentUsed: 100 };
  }

  const slaDays = CATEGORY_CONFIG[complaint.category]?.slaDays || 7;
  const created = new Date(complaint.createdAt);
  const now = new Date();
  const daysPassed = differenceInDays(now, created);
  const daysRemaining = Math.max(0, slaDays - daysPassed);
  const percentUsed = Math.min(100, (daysPassed / slaDays) * 100);

  return {
    isOverdue: daysPassed > slaDays,
    daysRemaining,
    percentUsed: Math.round(percentUsed),
  };
}

/**
 * Generate summary statistics for the dashboard header.
 */
export function getDashboardSummary(complaints: Complaint[]) {
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'pending').length;
  const inProgress = complaints.filter((c) => c.status === 'in-progress' || c.status === 'verified').length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const escalated = complaints.filter((c) => c.status === 'escalated').length;
  const overdue = complaints.filter((c) => c.isOverdue && c.status !== 'resolved').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Average resolution time
  const resolvedComplaints = complaints.filter((c) => c.resolvedAt);
  const avgResolutionDays = resolvedComplaints.length > 0
    ? Math.round(
        resolvedComplaints.reduce((sum, c) => {
          return sum + differenceInDays(new Date(c.resolvedAt!), new Date(c.createdAt));
        }, 0) / resolvedComplaints.length
      )
    : 0;

  return {
    total,
    pending,
    inProgress,
    resolved,
    escalated,
    overdue,
    resolutionRate,
    avgResolutionDays,
  };
}
