import axiosInstance from './axiosInstance';
import type { ApiResponse, Task, TaskRequest, TaskStatus } from '@/types';

export const tasksApi = {
  get: (id: number) =>
    axiosInstance.get<ApiResponse<Task>>(`/tasks/${id}`),

  create: (data: TaskRequest) =>
    axiosInstance.post<ApiResponse<Task>>('/tasks', data),

  update: (id: number, data: TaskRequest) =>
    axiosInstance.put<ApiResponse<Task>>(`/tasks/${id}`, data),

  updateStatus: (id: number, status: TaskStatus) =>
    axiosInstance.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status }),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/tasks/${id}`),
};
