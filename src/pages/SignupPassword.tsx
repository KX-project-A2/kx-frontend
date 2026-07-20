import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { Button, Checkbox, TextField } from '../components/common/ui';
import ErrorMessage from '../components/common/ErrorMessage';
import { signup } from '../services/auth';
import { useAuthStore } from '../hooks/useAuthStore';

export default function SignupPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const email = (location.state as { email?: string } | null)?.email || 'you@example.com';
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

    setLoading(true);

    try {
      await signup(email, password);
      setAuthenticated(true);
      navigate('/home');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center p-6">
      <div className="glass-2 relative z-10 flex w-full max-w-[400px] flex-col gap-8 rounded-card p-8">
        <Logo />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-caption text-content-muted">
            <span className="text-brand-light">2</span>
            <span>/ 2 단계</span>
          </div>
          <h1 className="text-h1 text-content">비밀번호 설정</h1>
          <p className="text-body text-content-secondary">안전한 비밀번호로 계정을 완성하세요.</p>
        </div>

        {/* confirmed email */}
        <div
          className="flex items-center gap-3 rounded-field px-3.5 h-11"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--stroke-strong)' }}
        >
          <Mail size={16} className="text-brand-light" />
          <span className="font-num text-body text-content">{email}</span>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            label="비밀번호"
            type="password"
            placeholder="8자 이상 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
          <div className="py-1">
            <Checkbox checked={agree} onChange={setAgree}>
              이용약관 및 개인정보 활용에 동의합니다
            </Checkbox>
          </div>
          {error && <ErrorMessage message={error} />}
          <Button type="submit" size="lg" block disabled={!agree || loading}>
            {loading ? '가입 처리 중...' : '가입 완료'}
          </Button>
        </form>
      </div>
    </div>
  );
}
