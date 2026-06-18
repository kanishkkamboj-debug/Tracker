import axiosInstance from './axiosInstance';
import type { ApiResponse, DashboardSummary } from '@/types';

export const dashboardApi = {
  getSummary: () =>
    axiosInstance.get<ApiResponse<DashboardSummary>>('/dashboard/summary'),
};
