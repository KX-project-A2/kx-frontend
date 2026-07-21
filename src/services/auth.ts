import axios from 'axios';
import axiosInstance from './axiosInstance';

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function login(email: string, password: string): Promise<{ success: true }> {
  try {
    const response = await axiosInstance.post('/api/auth/login', { email, password });

    // TODO: 실제 응답 필드명 확인 필요 - 현재는 요청 성공 시 무조건 success: true로 처리
    console.log('[login] response', response.data);

    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('로그인에 실패했습니다. 다시 시도해주세요.');
  }
}

export async function signupEmailMock(email: string): Promise<{ success: true }> {
  if (!isValidEmail(email)) {
    throw new Error('올바른 이메일 형식이 아닙니다.');
  }

  return { success: true };
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
      throw new Error(error.response.data.message);
    }
    throw new Error('회원가입에 실패했습니다. 다시 시도해주세요.');
  }
}
