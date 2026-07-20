import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { Button, TextField } from '../components/common/ui';
import ImageWithFallback from '../components/common/ImageWithFallback';
import ErrorMessage from '../components/common/ErrorMessage';
import LegalModal, { type LegalKind } from '../components/common/LegalModal';
import GoogleIcon from '../components/common/icons/GoogleIcon';
import { login } from '../services/auth';
import { useAuthStore } from '../hooks/useAuthStore';

const HERO =
  'https://images.unsplash.com/photo-1779399153789-74d266fda6a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400';

export default function Login() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      setAuthenticated(true);
      navigate('/home');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full">
      {/* left form */}
      <div className="relative z-10 flex w-full flex-col justify-between p-10 lg:w-[400px] lg:shrink-0">
        <Logo />

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1 text-content">다시 오신 걸 환영해요</h1>
            <p className="text-body text-content-secondary">상상하는 모든 것을 이미지와 영상으로.</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            block
            leftIcon={<GoogleIcon width={20} height={20} />}
            className="rounded-full"
            style={{
              borderRadius: '9999px',
              background: 'var(--md-surface-container-high)',
              borderColor: 'var(--md-outline-variant)',
              color: '#ffffff',
            }}
            onClick={() =>
              (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`)
            }
          >
            구글 계정으로 시작하기
          </Button>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <TextField
              label="아이디 (이메일)"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <ErrorMessage message={error} />}
            <Button type="submit" size="lg" block className="mt-1" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2">
            <span className="text-caption text-content-muted">아직 회원이 아니신가요?</span>
            <Button variant="tertiary" size="sm" onClick={() => navigate('/signup')}>
              회원가입
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="text-caption text-content-muted hover:text-content-secondary"
            onClick={() => setLegal('terms')}
          >
            이용약관
          </button>
          <span className="h-3 w-px" style={{ background: 'var(--stroke-strong)' }} />
          <button
            className="text-caption text-content-muted hover:text-content-secondary"
            onClick={() => setLegal('privacy')}
          >
            개인정보 처리방침
          </button>
        </div>
      </div>

      {/* right full-bleed reference */}
      <div className="relative z-10 hidden flex-1 overflow-hidden lg:block">
        <ImageWithFallback src={HERO} alt="생성 레퍼런스" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, var(--canvas) 0%, transparent 40%)' }}
        />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-h2 text-white drop-shadow">"한 줄의 프롬프트가 한 편의 작품이 됩니다."</p>
          <p className="mt-2 font-num text-caption text-white/70">Generated with 제미나이</p>
        </div>
      </div>

      <LegalModal kind={legal} onClose={() => setLegal(null)} />
    </div>
  );
}
