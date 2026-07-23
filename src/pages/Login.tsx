import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '../components/common/ui';
import ErrorMessage from '../components/common/ErrorMessage';
import LegalModal, { type LegalKind } from '../components/common/LegalModal';
import GoogleIcon from '../components/common/icons/GoogleIcon';
import AuthBackground from '../components/auth/AuthBackground';
import AuthCard from '../components/auth/AuthCard';
import { login } from '../services/auth';
import { useAuthStore } from '../hooks/useAuthStore';

const HAS_LOGGED_IN_BEFORE_KEY = 'hasLoggedInBefore';
const SLIDE_DURATION_MS = 4000;

export default function Login() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReturning] = useState(() => localStorage.getItem(HAS_LOGGED_IN_BEFORE_KEY) === 'true');

  // 슬라이드 2,3은 아직 이미지 파일이 없음 — src가 null이면 그 슬라이드로 자동 전환하지 않음.
  // 나중에 경로만 채우면 3장 순환이 자동으로 동작함.
  const slides = useMemo(
    () => [
      {
        label: 'GPT Image 2.0',
        src: isReturning ? '/assets/auth/after.png' : '/assets/auth/hero.png',
        alt: isReturning ? '다시 오신 것을 환영합니다' : '생성 레퍼런스',
      },
      { label: 'Seedance 2.0', src: null, alt: '' }, // TODO: 슬라이드 2 이미지 경로
      { label: 'GPT Image 2.0', src: null, alt: '' }, // TODO: 슬라이드 3 이미지 경로
    ],
    [isReturning]
  );
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => {
        const next = (current + 1) % slides.length;
        return slides[next].src ? next : current;
      });
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [slides]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      localStorage.setItem(HAS_LOGGED_IN_BEFORE_KEY, 'true');
      setAuthenticated(true);
      navigate('/home');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // slide 1 — first-visit: hero.png offset 430.2px in from the card's left edge (119 + 430.2 = 549.2px),
  // underlapping the translucent card by ~130px. Returning-visit: after.png, full-bleed cover. Slides 2/3
  // fall back to a plain full-bleed <img> once their src is filled in.
  const heroSrc =
    activeSlide === 0
      ? isReturning
        ? '/assets/auth/after.png'
        : '/assets/auth/hero.png'
      : slides[activeSlide].src;
  const heroAlt =
    activeSlide === 0
      ? isReturning
        ? '다시 오신 것을 환영합니다'
        : '생성 레퍼런스'
      : slides[activeSlide].alt;
  const heroIsOffset = activeSlide === 0 && !isReturning;

  return (
    <>
      <AuthBackground
        heroSrc={heroSrc}
        heroAlt={heroAlt}
        heroClassName={
          heroIsOffset
            ? 'absolute top-0 h-full w-auto object-cover'
            : 'absolute inset-0 h-full w-full object-cover'
        }
        heroStyle={heroIsOffset ? { left: 549.2 } : undefined}
        slideIndicator={
          // slide indicators — label + 150x4 progress track, aligned to hero's left edge (549.2px);
          // stays fixed even in returning-visit mode where the photo goes full-bleed
          <div className="absolute bottom-24 z-10 flex gap-6" style={{ left: 549.2 }}>
            {slides.map((slide, i) => (
              <div key={i} className="flex w-37.5 flex-col gap-2">
                <span
                  style={{
                    fontFamily: '"Noto Sans KR", var(--font-sans)',
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: '24px',
                    color: i === activeSlide ? '#F5C0FF' : '#757575',
                  }}
                >
                  {slide.label}
                </span>
                <div
                  className="h-1 w-full overflow-hidden"
                  style={{ borderRadius: 5, background: 'rgba(135, 114, 139, 0.50)' }}
                >
                  {i < activeSlide && (
                    <div className="h-full w-full" style={{ background: 'var(--primary-200)' }} />
                  )}
                  {i === activeSlide && (
                    <div
                      key={activeSlide}
                      className="h-full"
                      style={{
                        background: 'var(--primary-200)',
                        animation: `slideFill ${SLIDE_DURATION_MS}ms linear infinite`,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        }
        footer={
          <div className="flex w-140 items-center justify-center gap-4">
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
        }
      >
        <AuthCard>
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
            {isReturning ? '다시 오신 걸 환영해요' : '만나서 반가워요'}
          </h1>

          <Button
            type="button"
            variant="secondary"
            block
            leftIcon={<GoogleIcon width={20} height={20} />}
            className="h-14"
            style={{
              borderRadius: 12,
              background: 'rgba(238, 238, 238, 0.10)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#F5F5F5',
            }}
            onClick={() =>
              (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`)
            }
          >
            구글 계정으로 시작하기
          </Button>

          <div className="flex w-full items-center gap-3">
            <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className="text-caption text-content-muted">또는</span>
            <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>

          <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
            <TextField
              label="아이디(이메일)"
              type="email"
              placeholder="example@kx.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg"
              style={{
                background: 'rgba(29, 26, 33, 0.80)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            />
            <TextField
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg"
              style={{
                background: 'rgba(29, 26, 33, 0.80)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            />
            {error && <ErrorMessage message={error} />}
            <Button
              type="submit"
              block
              className="mt-1"
              style={{ borderRadius: 999, background: 'var(--primary-200)' }}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="flex w-full items-center justify-between text-caption text-content-muted">
            <span className="inline-flex items-center gap-3">
              아직 회원이 아니라면
              <button type="button" className="text-brand" onClick={() => navigate('/signup')}>
                회원가입
              </button>
            </span>
            {/* TODO: 비밀번호 찾기 플로우 미구현 — 화면만 반영, 클릭 동작 없음 */}
            <button type="button" className="hover:text-content-secondary">
              비밀번호 찾기
            </button>
          </div>
        </AuthCard>
      </AuthBackground>

      <LegalModal kind={legal} onClose={() => setLegal(null)} />
    </>
  );
}
