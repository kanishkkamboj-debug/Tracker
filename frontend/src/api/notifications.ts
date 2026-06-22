import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface MemberItem {
  id: number;
  name: string;
  email: string;
  taskCount: number;
  completedTaskCount: number;
  projectCount: number;
  role: string;
  joinedAt: string;
}

export const notificationsApi = {
  getAll: () =>
    axiosInstance.get<ApiResponse<NotificationItem[]>>('/notifications'),

  getUnreadCount: () =>
    axiosInstance.get<ApiResponse<number>>('/notifications/unread-count'),

  markRead: (id: number) =>
    axiosInstance.patch<ApiResponse<void>>(`/notifications/${id}/read`),

  markAllRead: () =>
    axiosInstance.patch<ApiResponse<void>>('/notifications/read-all'),
};

export const membersApi = {
  getAll: () =>
    axiosInstance.get<ApiResponse<MemberItem[]>>('/members'),
};
