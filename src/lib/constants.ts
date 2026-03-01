import type { ComplaintCategory, ComplaintStatus, Priority } from '@/types';

// ==================== WARD DATA ====================
export const MMR_WARDS: string[] = [
  'Palghar Ward 1', 'Palghar Ward 2', 'Palghar Ward 3', 'Palghar Ward 4', 'Palghar Ward 5',
  'Vasai Ward 1', 'Vasai Ward 2', 'Vasai Ward 3',
  'Virar Ward 1', 'Virar Ward 2',
  'Boisar Ward 1', 'Boisar Ward 2',
  'Kelve Ward 1',
  'Mira Road Ward 1', 'Mira Road Ward 2',
  'Bhayandar Ward 1', 'Bhayandar Ward 2',
  'Dahisar Ward 1', 'Dahisar Ward 2',
  'Borivali Ward 1', 'Borivali Ward 2',
  'Kandivali Ward 1',
  'Malad Ward 1',
  'Andheri Ward 1', 'Andheri Ward 2',
];

export const MMR_AREAS: string[] = [
  'Palghar', 'Vasai', 'Virar', 'Boisar', 'Kelve',
  'Mira Road', 'Bhayandar', 'Dahisar', 'Borivali',
  'Kandivali', 'Malad', 'Andheri',
  'Kothrud', 'Shivajinagar', 'Hinjewadi', 'Viman Nagar',
];

// ==================== CATEGORY METADATA ====================
export const CATEGORY_CONFIG: Record<ComplaintCategory, { label: string; icon: string; color: string; slaDays: number }> = {
  'garbage': { label: 'Garbage Collection', icon: 'Trash2', color: '#ef4444', slaDays: 3 },
  'water-supply': { label: 'Water Supply', icon: 'Droplets', color: '#3b82f6', slaDays: 2 },
  'road-conditions': { label: 'Bad Road Conditions', icon: 'Construction', color: '#f97316', slaDays: 7 },
  'street-lighting': { label: 'Street Lighting', icon: 'Lightbulb', color: '#eab308', slaDays: 5 },
  'drainage': { label: 'Drainage / Sewage', icon: 'Waves', color: '#8b5cf6', slaDays: 4 },
  'pollution': { label: 'Pollution', icon: 'CloudFog', color: '#6b7280', slaDays: 10 },
  'other': { label: 'Other', icon: 'MoreHorizontal', color: '#14b8a6', slaDays: 7 },
};

export const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bgColor: string }> = {
  'pending': { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' },
  'verified': { label: 'Verified', color: '#3b82f6', bgColor: '#dbeafe' },
  'in-progress': { label: 'In Progress', color: '#8b5cf6', bgColor: '#ede9fe' },
  'resolved': { label: 'Resolved', color: '#22c55e', bgColor: '#dcfce7' },
  'escalated': { label: 'Escalated', color: '#ef4444', bgColor: '#fee2e2' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  'low': { label: 'Low', color: '#6b7280' },
  'medium': { label: 'Medium', color: '#f59e0b' },
  'high': { label: 'High', color: '#f97316' },
  'critical': { label: 'Critical', color: '#ef4444' },
};

// ==================== APP CONFIG ====================
export const APP_CONFIG = {
  name: 'Project Samvaad',
  tagline: 'Connecting Citizens, Youth & Administration',
  organization: 'Blue Ribbon Movement (BRM)',
  version: '1.0.0',
  defaultCity: 'Mumbai Metropolitan Region',
  maxMediaPerComplaint: 5,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  supportedVideoTypes: ['video/mp4', 'video/webm'],
  slaWarningThreshold: 0.75, // Warn at 75% of SLA time
  socialHashtags: ['#ProjectSamvaad', '#MMRissue', '#FixMyCity', '#BRMCivic'],
};
