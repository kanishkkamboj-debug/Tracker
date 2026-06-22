import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types';

export interface UserSettings {
  id?: number;
  theme: string;
  language: string;
  timezone: string;
  currentFocus: string;
  notifTaskAssignments: boolean;
  notifMentions: boolean;
  notifProjectUpdates: boolean;
  notifMarketing: boolean;
  jobTitle: string;
  bio: string;
  location: string;
  githubUrl: string;
  avatarUrl: string;
  name?: string;
  email?: string;
}

export const settingsApi = {
  get: () =>
    axiosInstance.get<ApiResponse<UserSettings>>('/settings'),

  update: (data: Partial<UserSettings>) =>
    axiosInstance.put<ApiResponse<UserSettings>>('/settings', data),
};
