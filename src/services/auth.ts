export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loginMock(
  _email: string,
  password: string
): Promise<{ success: true }> {
  await delay(800);

  if (!password) {
    throw new Error('비밀번호를 입력해 주세요.');
  }

  return { success: true };
}

export async function signupEmailMock(_email: string): Promise<{ success: true }> {
  await delay(600);

  return { success: true };
}

export async function signupPasswordMock(
  _email: string,
  password: string
): Promise<{ success: true }> {
  await delay(800);

  if (!password || password.length < 8) {
    throw new Error('비밀번호는 8자 이상이어야 합니다.');
  }

  return { success: true };
}
