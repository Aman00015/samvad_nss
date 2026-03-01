import { create } from 'zustand';
import type { Complaint, ComplaintStatus, ComplaintCategory, DashboardFilters, FollowUp } from '@/types';
import { getSeedComplaints } from './seed-data';
import { v4 as uuidv4 } from 'uuid';

interface ComplaintState {
  complaints: Complaint[];
  filters: DashboardFilters;
  selectedComplaintId: string | null;
  isLoading: boolean;

  // Actions
  initialize: () => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'ticketNumber'>) => Complaint;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  assignVolunteer: (complaintId: string, volunteerId: string, volunteerName: string) => void;
  addFollowUp: (complaintId: string, followUp: Omit<FollowUp, 'id'>) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  clearFilters: () => void;
  selectComplaint: (id: string | null) => void;

  // Computed
  getFilteredComplaints: () => Complaint[];
  getComplaintById: (id: string) => Complaint | undefined;
  getComplaintsByStatus: (status: ComplaintStatus) => Complaint[];
  getComplaintsByCategory: (category: ComplaintCategory) => Complaint[];
  getComplaintsByCitizen: (citizenId: string) => Complaint[];
  getComplaintsByVolunteer: (volunteerId: string) => Complaint[];
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  filters: {},
  selectedComplaintId: null,
  isLoading: false,

  initialize: () => {
    const existing = get().complaints;
    if (existing.length === 0) {
      set({ complaints: getSeedComplaints() });
    }
  },

  addComplaint: (complaintData) => {
    const count = get().complaints.length;
    const newComplaint: Complaint = {
      ...complaintData,
      id: uuidv4(),
      ticketNumber: `SMV-2026-${String(count + 1).padStart(5, '0')}`,
    };
    set((state) => ({
      complaints: [newComplaint, ...state.complaints],
    }));
    return newComplaint;
  },

  updateComplaintStatus: (id, status) => {
    set((state) => ({
      complaints: state.complaints.map((c) => {
        if (c.id !== id) return c;
        const updates: Partial<Complaint> = {
          status,
          updatedAt: new Date().toISOString(),
        };
        if (status === 'resolved') updates.resolvedAt = new Date().toISOString();
        if (status === 'escalated') updates.escalatedAt = new Date().toISOString();
        if (status === 'verified') updates.verifiedAt = new Date().toISOString();
        return { ...c, ...updates };
      }),
    }));
  },

  assignVolunteer: (complaintId, volunteerId, volunteerName) => {
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? { ...c, assignedVolunteerId: volunteerId, assignedVolunteerName: volunteerName, updatedAt: new Date().toISOString() }
          : c
      ),
    }));
  },

  addFollowUp: (complaintId, followUpData) => {
    const followUp: FollowUp = {
      ...followUpData,
      id: uuidv4(),
    };
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.id === complaintId
          ? { ...c, followUps: [...c.followUps, followUp], updatedAt: new Date().toISOString() }
          : c
      ),
    }));
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  selectComplaint: (id) => {
    set({ selectedComplaintId: id });
  },

  getFilteredComplaints: () => {
    const { complaints, filters } = get();
    let result = [...complaints];

    if (filters.ward) {
      result = result.filter((c) => c.ward === filters.ward);
    }
    if (filters.category) {
      result = result.filter((c) => c.category === filters.category);
    }
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((c) => c.priority === filters.priority);
    }
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      result = result.filter((c) => {
        const created = new Date(c.createdAt);
        return created >= start && created <= end;
      });
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getComplaintById: (id) => {
    return get().complaints.find((c) => c.id === id);
  },

  getComplaintsByStatus: (status) => {
    return get().complaints.filter((c) => c.status === status);
  },

  getComplaintsByCategory: (category) => {
    return get().complaints.filter((c) => c.category === category);
  },

  getComplaintsByCitizen: (citizenId) => {
    return get().complaints.filter((c) => c.citizenId === citizenId);
  },

  getComplaintsByVolunteer: (volunteerId) => {
    return get().complaints.filter((c) => c.assignedVolunteerId === volunteerId);
  },
}));
