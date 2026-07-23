import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, TextField } from '../components/common/ui';
import ErrorMessage from '../components/common/ErrorMessage';
import AuthBackground from '../components/auth/AuthBackground';
import AuthCard from '../components/auth/AuthCard';
import AuthEmailChip from '../components/auth/AuthEmailChip';
import AuthStepLabel from '../components/auth/AuthStepLabel';

export default function SignupNickname() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email || 'you@example.com';
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요.');
      return;
    }

    navigate('/signup/password', { state: { email, nickname } });
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
            닉네임 설정
          </h1>
          <AuthEmailChip email={email} />
        </div>

        <form className="flex w-full flex-col gap-10" onSubmit={handleSubmit}>
          <div className="flex w-full flex-col gap-1.5">
            <AuthStepLabel text="사용할 닉네임을 알려주세요." step={2} />
            <TextField
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
              disabled={!nickname.trim()}
            >
              확인
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
