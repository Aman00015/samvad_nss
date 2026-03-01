import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Complaint, User, FollowUp, MediaAttachment, SyncQueueItem, AppNotification, SocialMediaIngestion } from '@/types';

interface SamvaadDB extends DBSchema {
  complaints: {
    key: string;
    value: Complaint;
    indexes: {
      'by-status': string;
      'by-ward': string;
      'by-category': string;
      'by-citizen': string;
      'by-volunteer': string;
      'by-sync': string;
      'by-created': string;
    };
  };
  users: {
    key: string;
    value: User;
    indexes: {
      'by-role': string;
      'by-email': string;
    };
  };
  followUps: {
    key: string;
    value: FollowUp;
    indexes: {
      'by-complaint': string;
      'by-author': string;
    };
  };
  media: {
    key: string;
    value: MediaAttachment & { blob?: ArrayBuffer };
    indexes: {
      'by-sync': string;
    };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-status': string;
      'by-created': string;
    };
  };
  notifications: {
    key: string;
    value: AppNotification;
    indexes: {
      'by-user': string;
      'by-read': string;
    };
  };
  socialIngestion: {
    key: string;
    value: SocialMediaIngestion;
    indexes: {
      'by-status': string;
      'by-platform': string;
    };
  };
}

const DB_NAME = 'samvaad-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SamvaadDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<SamvaadDB>> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only available in the browser');
  }
  
  if (!dbPromise) {
    dbPromise = openDB<SamvaadDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Complaints store
        const complaintStore = db.createObjectStore('complaints', { keyPath: 'id' });
        complaintStore.createIndex('by-status', 'status');
        complaintStore.createIndex('by-ward', 'ward');
        complaintStore.createIndex('by-category', 'category');
        complaintStore.createIndex('by-citizen', 'citizenId');
        complaintStore.createIndex('by-volunteer', 'assignedVolunteerId');
        complaintStore.createIndex('by-sync', 'syncStatus');
        complaintStore.createIndex('by-created', 'createdAt');

        // Users store
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-role', 'role');
        userStore.createIndex('by-email', 'email');

        // Follow-ups store
        const followUpStore = db.createObjectStore('followUps', { keyPath: 'id' });
        followUpStore.createIndex('by-complaint', 'complaintId');
        followUpStore.createIndex('by-author', 'authorId');

        // Media store
        const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
        mediaStore.createIndex('by-sync', 'syncStatus');

        // Sync queue store
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-status', 'status');
        syncStore.createIndex('by-created', 'createdAt');

        // Notifications store
        const notifStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notifStore.createIndex('by-user', 'userId');
        notifStore.createIndex('by-read', 'isRead');

        // Social media ingestion store
        const socialStore = db.createObjectStore('socialIngestion', { keyPath: 'id' });
        socialStore.createIndex('by-status', 'status');
        socialStore.createIndex('by-platform', 'platform');
      },
    });
  }
  
  return dbPromise;
}
