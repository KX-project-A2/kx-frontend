import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, TextField } from '../components/common/ui';
import ErrorMessage from '../components/common/ErrorMessage';
import AuthBackground from '../components/auth/AuthBackground';
import AuthCard from '../components/auth/AuthCard';
import AuthStepLabel from '../components/auth/AuthStepLabel';
import { signupEmailMock } from '../services/auth';

export default function SignupEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectState = location.state as { email?: string; error?: string } | null;
  const [email, setEmail] = useState(redirectState?.email ?? '');
  const [error, setError] = useState<string | null>(redirectState?.error ?? null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signupEmailMock(email);
      navigate('/signup/nickname', { state: { email } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <AuthCard style={{ gap: 64 }}>
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
          이메일 입력
        </h1>

        <form className="flex w-full flex-col gap-10" onSubmit={handleSubmit}>
          <div className="flex w-full flex-col gap-1.5">
            <AuthStepLabel text="가입할 이메일을 입력하세요." step={1} />
            <TextField
              type="email"
              placeholder="example@kx.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg"
              style={{
                background: 'rgba(29, 26, 33, 0.80)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
            {error && <ErrorMessage message={error} />}
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              type="submit"
              block
              style={{ borderRadius: 999, background: 'var(--primary-200)', color: '#4d0071' }}
              disabled={loading}
            >
              {loading ? '확인 중...' : '확인'}
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
