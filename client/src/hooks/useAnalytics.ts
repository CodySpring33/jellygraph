import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  DashboardOverview,
  UserStats,
  ContentStats,
  ActivityTimelinePoint,
  JellyfinSession,
  ApiError
} from '../types/jellyfin';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// API functions
const fetchDashboardOverview = async (): Promise<DashboardOverview> => {
  const { data } = await api.get('/dashboard/overview');
  return data;
};

const fetchUserStats = async (): Promise<UserStats> => {
  const { data } = await api.get('/users/stats');
  return data;
};

const fetchContentStats = async (): Promise<ContentStats> => {
  const { data } = await api.get('/content/stats');
  return data;
};

const fetchActivityTimeline = async (days: number = 7): Promise<ActivityTimelinePoint[]> => {
  const { data } = await api.get(`/activities/timeline?days=${days}`);
  return data;
};

const fetchActiveSessions = async (): Promise<JellyfinSession[]> => {
  const { data } = await api.get('/sessions/active');
  return data;
};

const syncData = async (): Promise<{ message: string }> => {
  const { data } = await api.post('/sync');
  return data;
};

// Custom hooks
export const useDashboardOverview = () => {
  return useQuery<DashboardOverview, ApiError>({
    queryKey: ['dashboard-overview'],
    queryFn: fetchDashboardOverview,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useUserStats = () => {
  return useQuery<UserStats, ApiError>({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  });
};

export const useContentStats = () => {
  return useQuery<ContentStats, ApiError>({
    queryKey: ['content-stats'],
    queryFn: fetchContentStats,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  });
};

export const useActivityTimeline = (days: number = 7) => {
  return useQuery<ActivityTimelinePoint[], ApiError>({
    queryKey: ['activity-timeline', days],
    queryFn: () => fetchActivityTimeline(days),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  });
};

export const useActiveSessions = () => {
  return useQuery<JellyfinSession[], ApiError>({
    queryKey: ['active-sessions'],
    queryFn: fetchActiveSessions,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for live data
    staleTime: 15 * 1000,
    retry: 3,
  });
};

export const useSyncData = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError>({
    mutationFn: syncData,
    onSuccess: () => {
      // Invalidate and refetch all queries after successful sync
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['content-stats'] });
      queryClient.invalidateQueries({ queryKey: ['activity-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
  });
};

// Utility hook for checking connection health
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      const { data } = await axios.get('/health');
      return data;
    },
    refetchInterval: 60 * 1000, // Check every minute
    retry: 1,
    staleTime: 30 * 1000,
  });
};

// Helper function to format runtime
export const formatRuntime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Helper function to format large numbers
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to get relative time
export const getRelativeTime = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes}m ago`;
  }
  
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  }
  
  if (diffInDays < 30) {
    return `${Math.floor(diffInDays)}d ago`;
  }
  
  return date.toLocaleDateString();
};
