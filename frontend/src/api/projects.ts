import axiosInstance from './axiosInstance';
import type { ApiResponse, PagedResponse, Project, ProjectRequest, Task } from '@/types';

export const projectsApi = {
  list: (page = 0, size = 20) =>
    axiosInstance.get<ApiResponse<PagedResponse<Project>>>('/projects', { params: { page, size } }),

  // alias used by old code
  getAll: () =>
    axiosInstance.get<ApiResponse<PagedResponse<Project>>>('/projects', { params: { page: 0, size: 100 } }),

  get: (id: number) =>
    axiosInstance.get<ApiResponse<Project>>(`/projects/${id}`),

  create: (data: ProjectRequest) =>
    axiosInstance.post<ApiResponse<Project>>('/projects', data),

  update: (id: number, data: ProjectRequest) =>
    axiosInstance.put<ApiResponse<Project>>(`/projects/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/projects/${id}`),

  getTasks: (id: number) =>
    axiosInstance.get<ApiResponse<Task[]>>(`/projects/${id}/tasks`),

  getMembers: (id: number) =>
    axiosInstance.get<ApiResponse<any[]>>(`/projects/${id}/members`),

  addMember: (id: number, userId: number) =>
    axiosInstance.post<ApiResponse<void>>(`/projects/${id}/members?userId=${userId}`),

  removeMember: (id: number, userId: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/projects/${id}/members/${userId}`),
};
