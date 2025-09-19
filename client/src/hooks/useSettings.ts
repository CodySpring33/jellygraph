import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Setting {
  key: string;
  value: string | null;
  description: string;
  type: string;
  required: boolean;
  isEncrypted: boolean;
}

export interface SettingsCategory {
  category: string;
  settings: Setting[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface JellyfinTestResult {
  success: boolean;
  connected: boolean;
  message: string;
  userCount?: number;
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// API functions
const fetchAllSettings = async (): Promise<SettingsCategory[]> => {
  const { data } = await api.get('/settings');
  return data;
};

const fetchSettingsByCategory = async (category: string): Promise<Setting[]> => {
  const { data } = await api.get(`/settings/${category}`);
  return data;
};

const updateSetting = async ({
  key,
  value,
}: {
  key: string;
  value: string;
}): Promise<{ message: string }> => {
  const { data } = await api.put(`/settings/${key}`, { value });
  return data;
};

const validateSettings = async (): Promise<ValidationResult> => {
  const { data } = await api.post('/settings/validate');
  return data;
};

const testJellyfinConnection = async ({
  url,
  apiKey,
}: {
  url: string;
  apiKey: string;
}): Promise<JellyfinTestResult> => {
  const { data } = await api.post('/settings/test-jellyfin', { url, apiKey });
  return data;
};

// Custom hooks
export const useAllSettings = () => {
  return useQuery<SettingsCategory[], Error>({
    queryKey: ['settings'],
    queryFn: fetchAllSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useSettingsByCategory = (category: string) => {
  return useQuery<Setting[], Error>({
    queryKey: ['settings', category],
    queryFn: () => fetchSettingsByCategory(category),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { key: string; value: string }>({
    mutationFn: updateSetting,
    onSuccess: () => {
      // Invalidate settings queries
      queryClient.invalidateQueries({ queryKey: ['settings'] });

      // Also invalidate dashboard data since settings might affect it
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
};

export const useValidateSettings = () => {
  return useQuery<ValidationResult, Error>({
    queryKey: ['settings-validation'],
    queryFn: validateSettings,
    enabled: false, // Only run when explicitly called
    retry: 1,
  });
};

export const useTestJellyfinConnection = () => {
  return useMutation<JellyfinTestResult, Error, { url: string; apiKey: string }>({
    mutationFn: testJellyfinConnection,
    retry: 1,
  });
};

// Helper functions
export const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'jellyfin':
      return 'Jellyfin Server';
    case 'general':
      return 'General';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
};

export const getSettingDisplayName = (key: string): string => {
  const parts = key.split('.');
  const settingName = parts[parts.length - 1];

  return settingName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/url/gi, 'URL')
    .replace(/api/gi, 'API');
};

export const getInputType = (setting: Setting): string => {
  if (setting.isEncrypted || setting.type === 'password') {
    return 'password';
  }

  switch (setting.type) {
    case 'number':
      return 'number';
    case 'url':
      return 'url';
    case 'boolean':
      return 'checkbox';
    default:
      return 'text';
  }
};

export const formatSettingValue = (setting: Setting): string => {
  if (setting.isEncrypted && setting.value) {
    return '••••••••';
  }

  return setting.value || '';
};
