import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Checkbox, TextField } from '../components/common/ui';
import ErrorMessage from '../components/common/ErrorMessage';
import AuthBackground from '../components/auth/AuthBackground';
import AuthCard from '../components/auth/AuthCard';
import AuthEmailChip from '../components/auth/AuthEmailChip';
import AuthStepLabel from '../components/auth/AuthStepLabel';
import { signup, SignupApiError } from '../services/auth';
import { useAuthStore } from '../hooks/useAuthStore';

export default function SignupPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const state = location.state as { email?: string; nickname?: string } | null;
  const email = state?.email || 'you@example.com';
  const nickname = state?.nickname || '';
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, nickname);
      setAuthenticated(true);
      navigate('/home');
    } catch (err) {
      if (err instanceof SignupApiError && err.status === 409) {
        navigate('/signup', { state: { email, error: '이미 가입된 이메일입니다.' } });
        return;
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <AuthCard style={{ gap: 64 }}>
        <div className="flex w-full flex-col gap-8">
          <h1
            className="self-stretch"
            style={{
              color: '#F5F5F5',
              fontFamily: '"Noto Sans KR", var(--font-sans)',
              fontSize: 32,
              fontWeight: 700,
              lineHeight: '40px',
              letterSpacing: '-0.16px',
              textAlign: 'center',
            }}
          >
            비밀번호 설정
          </h1>
          <AuthEmailChip email={email} />
        </div>

        <form className="flex w-full flex-col gap-10" onSubmit={handleSubmit}>
          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col gap-1.5">
              <AuthStepLabel text="안전한 비밀번호로 계정을 완성해 주세요." step={3} />
              <TextField
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg"
                style={{
                  background: 'rgba(29, 26, 33, 0.80)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
            </div>
            <TextField
              type="password"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="rounded-lg"
              style={{
                background: 'rgba(29, 26, 33, 0.80)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
            <Checkbox checked={agree} onChange={setAgree}>
              Genstudio의 이용약관과 개인정보 활용에 동의합니다
            </Checkbox>
            {error && <ErrorMessage message={error} />}
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              type="submit"
              block
              style={{ borderRadius: 999, background: 'var(--primary-200)', color: '#4d0071' }}
              disabled={!agree || loading}
            >
              {loading ? '가입 처리 중...' : '확인'}
            </Button>

            <div
              className="flex w-full items-center justify-between px-2 text-caption"
              style={{ color: '#988e99' }}
            >
              <span className="inline-flex items-center gap-3">
                이미 계정이 있으시다면
                <button type="button" className="text-brand" onClick={() => navigate('/login')}>
                  로그인
                </button>
              </span>
              {/* TODO: 비밀번호 찾기 플로우 미구현 — 화면만 반영, 클릭 동작 없음 */}
              <button type="button" className="hover:text-content-secondary">
                비밀번호 찾기
              </button>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthBackground>
  );
}
