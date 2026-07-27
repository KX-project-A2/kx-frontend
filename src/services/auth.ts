import axios from 'axios';
import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';
import type { AuthProfile } from '../hooks/useAuthStore';

export class SignupApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'SignupApiError';
    this.status = status;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function login(email: string, password: string): Promise<void> {
  try {
    await axiosInstance.post('/api/auth/login', { email, password });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    throw new Error('로그인에 실패했습니다. 다시 시도해주세요.', { cause: error });
  }
}

export async function logout(): Promise<void> {
  try {
    await axiosInstance.post('/api/auth/logout');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    throw new Error('로그아웃에 실패했습니다.', { cause: error });
  }
}

export async function fetchMe(): Promise<AuthProfile> {
  const response = await axiosInstance.get<ApiResponse<AuthProfile>>('/api/me/profile');
  return response.data.data;
}

export interface EmailDuplicateCheck {
  email: string;
  duplicated: boolean;
  available: boolean;
}

export async function checkEmailDuplicate(email: string): Promise<EmailDuplicateCheck> {
  try {
    const response = await axiosInstance.get<ApiResponse<EmailDuplicateCheck>>(
      '/api/auth/email/check',
      {
        params: { email },
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message, { cause: error });
    }
    throw new Error('이메일 확인에 실패했습니다. 다시 시도해주세요.', { cause: error });
  }
}

export async function signup(
  email: string,
  password: string,
  nickname: string
): Promise<{ success: true }> {
  try {
    const response = await axiosInstance.post('/api/auth/signup', { email, password, nickname });

    // TODO: 실제 응답 필드명 확인 필요 - 현재는 요청 성공 시 무조건 success: true로 처리
    console.log('[signup] response', response.data);

    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new SignupApiError(error.response.data.message, error.response.status);
    }
    throw new SignupApiError(
      '회원가입에 실패했습니다. 다시 시도해주세요.',
      axios.isAxiosError(error) ? error.response?.status : undefined
    );
  }
}
