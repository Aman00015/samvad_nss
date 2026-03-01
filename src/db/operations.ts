import { getDB } from './schema';
import type { Complaint, User, FollowUp, SyncQueueItem, AppNotification, SocialMediaIngestion, ComplaintStatus, ComplaintCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ==================== COMPLAINTS ====================

export async function createComplaint(complaint: Omit<Complaint, 'id' | 'ticketNumber'>): Promise<Complaint> {
  const db = await getDB();
  const id = uuidv4();
  const count = await db.count('complaints');
  const ticketNumber = `SMV-2026-${String(count + 1).padStart(5, '0')}`;
  
  const newComplaint: Complaint = {
    ...complaint,
    id,
    ticketNumber,
  };
  
  await db.put('complaints', newComplaint);
  return newComplaint;
}

export async function getComplaint(id: string): Promise<Complaint | undefined> {
  const db = await getDB();
  return db.get('complaints', id);
}

export async function getAllComplaints(): Promise<Complaint[]> {
  const db = await getDB();
  return db.getAll('complaints');
}

export async function getComplaintsByStatus(status: ComplaintStatus): Promise<Complaint[]> {
  const db = await getDB();
  return db.getAllFromIndex('complaints', 'by-status', status);
}

export async function getComplaintsByWard(ward: string): Promise<Complaint[]> {
  const db = await getDB();
  return db.getAllFromIndex('complaints', 'by-ward', ward);
}

export async function getComplaintsByCategory(category: ComplaintCategory): Promise<Complaint[]> {
  const db = await getDB();
  return db.getAllFromIndex('complaints', 'by-category', category);
}

export async function getComplaintsByCitizen(citizenId: string): Promise<Complaint[]> {
  const db = await getDB();
  return db.getAllFromIndex('complaints', 'by-citizen', citizenId);
}

export async function getComplaintsByVolunteer(volunteerId: string): Promise<Complaint[]> {
  const db = await getDB();
  return db.getAllFromIndex('complaints', 'by-volunteer', volunteerId);
}

export async function updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> {
  const db = await getDB();
  const existing = await db.get('complaints', id);
  if (!existing) return undefined;
  
  const updated: Complaint = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await db.put('complaints', updated);
  return updated;
}

export async function getPendingSyncComplaints(): Promise<Complaint[]> {
  const db = await getDB();
  return db.getAllFromIndex('complaints', 'by-sync', 'pending');
}

// ==================== FOLLOW-UPS ====================

export async function addFollowUp(followUp: Omit<FollowUp, 'id'>): Promise<FollowUp> {
  const db = await getDB();
  const id = uuidv4();
  const newFollowUp: FollowUp = { ...followUp, id };
  
  await db.put('followUps', newFollowUp);
  
  // Also update the complaint's followUps array
  const complaint = await db.get('complaints', followUp.complaintId);
  if (complaint) {
    complaint.followUps.push(newFollowUp);
    complaint.updatedAt = new Date().toISOString();
    await db.put('complaints', complaint);
  }
  
  return newFollowUp;
}

export async function getFollowUpsByComplaint(complaintId: string): Promise<FollowUp[]> {
  const db = await getDB();
  return db.getAllFromIndex('followUps', 'by-complaint', complaintId);
}

// ==================== USERS ====================

export async function createUser(user: User): Promise<void> {
  const db = await getDB();
  await db.put('users', user);
}

export async function getUser(id: string): Promise<User | undefined> {
  const db = await getDB();
  return db.get('users', id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDB();
  return db.getFromIndex('users', 'by-email', email);
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const db = await getDB();
  return db.getAllFromIndex('users', 'by-role', role);
}

// ==================== SYNC QUEUE ====================

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
  const db = await getDB();
  const id = uuidv4();
  await db.put('syncQueue', { ...item, id });
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('syncQueue', 'by-status', 'queued');
}

export async function updateSyncItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('syncQueue', id);
  if (existing) {
    await db.put('syncQueue', { ...existing, ...updates });
  }
}

export async function removeSyncItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

// ==================== NOTIFICATIONS ====================

export async function addNotification(notification: Omit<AppNotification, 'id'>): Promise<void> {
  const db = await getDB();
  const id = uuidv4();
  await db.put('notifications', { ...notification, id });
}

export async function getNotificationsByUser(userId: string): Promise<AppNotification[]> {
  const db = await getDB();
  return db.getAllFromIndex('notifications', 'by-user', userId);
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = await getDB();
  const notif = await db.get('notifications', id);
  if (notif) {
    await db.put('notifications', { ...notif, isRead: true });
  }
}

// ==================== SOCIAL MEDIA ====================

export async function addSocialIngestion(item: Omit<SocialMediaIngestion, 'id'>): Promise<void> {
  const db = await getDB();
  const id = uuidv4();
  await db.put('socialIngestion', { ...item, id });
}

export async function getSocialIngestionByStatus(status: string): Promise<SocialMediaIngestion[]> {
  const db = await getDB();
  return db.getAllFromIndex('socialIngestion', 'by-status', status);
}

export async function updateSocialIngestion(id: string, updates: Partial<SocialMediaIngestion>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('socialIngestion', id);
  if (existing) {
    await db.put('socialIngestion', { ...existing, ...updates });
  }
}
