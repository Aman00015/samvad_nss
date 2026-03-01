// Role-Based Access Control types
export type UserRole = 'citizen' | 'volunteer' | 'admin';

export type ComplaintStatus = 'pending' | 'verified' | 'in-progress' | 'resolved' | 'escalated';
export type ComplaintCategory = 
  | 'garbage' 
  | 'water-supply' 
  | 'road-conditions' 
  | 'street-lighting' 
  | 'drainage' 
  | 'pollution' 
  | 'other';

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Ward = string;

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video';
  uri: string; // blob URL or base64 for offline
  thumbnail?: string;
  geoLocation: GeoLocation;
  capturedAt: string; // ISO timestamp
  deviceInfo: string;
  exifData?: Record<string, unknown>;
  syncStatus: 'pending' | 'uploaded' | 'failed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  ward?: string;
  city: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string; // e.g., SMV-2026-00001
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: Priority;
  
  // Location
  ward: string;
  city: string;
  area: string;
  address: string;
  geoLocation: GeoLocation;
  
  // Media
  media: MediaAttachment[];
  
  // People
  citizenId: string;
  citizenName: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  resolvedAt?: string;
  escalatedAt?: string;
  
  // SLA tracking
  slaDeadline?: string;
  slaDays: number;
  isOverdue: boolean;
  
  // Follow-ups
  followUps: FollowUp[];
  
  // Social media source
  socialMediaSource?: {
    platform: 'twitter' | 'instagram' | 'whatsapp';
    postUrl?: string;
    hashtags?: string[];
  };
  
  // Sync
  syncStatus: 'synced' | 'pending' | 'conflict';
  offlineCreated: boolean;
}

export interface FollowUp {
  id: string;
  complaintId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  media?: MediaAttachment[];
  createdAt: string;
  type: 'note' | 'verification' | 'escalation' | 'resolution' | 'status-update';
}

export interface VolunteerStats {
  volunteerId: string;
  totalAssigned: number;
  totalVerified: number;
  totalResolved: number;
  totalEscalated: number;
  averageResponseTime: number; // hours
  rating: number; // 1-5
  activeComplaints: number;
}

export interface WardStats {
  ward: string;
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  averageResolutionDays: number;
  topCategories: { category: ComplaintCategory; count: number }[];
  overdueCount: number;
}

export interface DashboardFilters {
  ward?: string;
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  dateRange?: { start: string; end: string };
  priority?: Priority;
}

export interface SocialMediaIngestion {
  id: string;
  platform: 'twitter' | 'instagram';
  postUrl: string;
  authorHandle: string;
  content: string;
  hashtags: string[];
  mediaUrls: string[];
  detectedLocation?: GeoLocation;
  detectedCategory?: ComplaintCategory;
  status: 'queued' | 'verified' | 'linked' | 'rejected';
  linkedComplaintId?: string;
  moderatedBy?: string;
  createdAt: string;
}

// Notification types
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status-update' | 'assignment' | 'escalation' | 'resolution' | 'reminder';
  complaintId?: string;
  isRead: boolean;
  createdAt: string;
}

// Offline queue
export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'upload-media';
  entityType: 'complaint' | 'follow-up' | 'media';
  payload: unknown;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttemptAt?: string;
  status: 'queued' | 'in-progress' | 'completed' | 'failed';
}
