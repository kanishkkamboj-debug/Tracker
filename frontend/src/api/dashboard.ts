import axiosInstance from './axiosInstance';
import type { ApiResponse, DashboardSummary } from '@/types';

export const dashboardApi = {
  getSummary: (projectId?: number) =>
    axiosInstance.get<ApiResponse<DashboardSummary>>('/dashboard/summary', { params: { projectId } }),
};
