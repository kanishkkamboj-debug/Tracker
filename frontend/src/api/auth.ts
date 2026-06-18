import axiosInstance from './axiosInstance';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: LoginRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data),
};
