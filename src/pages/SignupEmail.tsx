import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { Button, TextField } from '../components/common/ui';
import ErrorMessage from '../components/common/ErrorMessage';
import { signupEmailMock } from '../services/auth';

export default function SignupEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signupEmailMock(email);
      navigate('/signup/password', { state: { email } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-screen w-full items-center justify-center p-6"
      style={{ background: 'var(--canvas)' }}
    >
      <div className="app-backdrop" />
      <div className="glass-2 relative z-10 flex w-full max-w-[400px] flex-col gap-8 rounded-card p-8">
        <Logo />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-caption text-content-muted">
            <span className="text-brand-light">1</span>
            <span>/ 2 단계</span>
          </div>
          <h1 className="text-h1 text-content">이메일로 시작하기</h1>
          <p className="text-body text-content-secondary">가입에 사용할 이메일 주소를 입력해 주세요.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            label="이메일"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <ErrorMessage message={error} />}
          <Button type="submit" size="lg" block disabled={loading}>
            {loading ? '확인 중...' : '확인'}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2">
          <span className="text-caption text-content-muted">이미 계정이 있으신가요?</span>
          <Button variant="tertiary" size="sm" onClick={() => navigate('/login')}>
            로그인하기
          </Button>
        </div>
      </div>
    </div>
  );
}
