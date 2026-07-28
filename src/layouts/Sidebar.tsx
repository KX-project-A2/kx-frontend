import { useState } from 'react';
import { Home, Image as ImageIcon, Library, LogIn, PenLine, Video } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/hooks/useAuthStore';
import { logout } from '@/services/auth';
import { confirmLogin } from '@/utils/confirmLogin';

const NAV = [
  { to: '/home', label: '홈', icon: Home },
  { to: '/image', label: '이미지', icon: ImageIcon },
  { to: '/video', label: '영상', icon: Video },
  { to: '/reverse-prompt', label: '역프롬프트', icon: PenLine },
  { to: '/library', label: '라이브러리', icon: Library, requiresAuth: true },
];

const DEFAULT_AVATAR = '/assets/profile/mock-avatar.png';

export default function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const status = useAuthStore((state) => state.status);
  const profile = useAuthStore((state) => state.profile);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);
  const isAuthenticated = status === 'authenticated';

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠어요?')) {
      return;
    }

    try {
      await logout();
    } catch {
      // 서버 호출이 실패해도 클라이언트 세션은 정리한다.
    } finally {
      setUnauthenticated();
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className={`relative h-screen shrink-0 transition-[width] ${
        collapsed
          ? 'w-[121px] duration-300 ease-out'
          : 'w-[332px] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
      }`}
    >
      <div
        className={`absolute flex flex-col justify-between rounded-[40px] border border-stroke-soft px-5 py-10 shadow-[0_2px_2px_0_rgba(255,255,255,0.15)_inset,0_2px_10px_0_rgba(0,0,0,0.25)] transition-all ${
          collapsed
            ? 'left-[25px] top-[45px] bottom-[45px] w-[96px] bg-black duration-300 ease-out'
            : 'left-[31px] top-[43px] bottom-[43px] w-[300px] bg-[rgba(1,1,1,0.5)] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* 로고 영역은 접힘/펼침에서 서로 다른 에셋(작은 아이콘 vs 워드마크)을 쓰지만,
              nav가 항상 같은 위치에서 시작하도록 두 상태 모두 h-[60px]로 높이를 맞춘다. */}
          {collapsed ? (
            <div className="flex h-[60px] items-center justify-center">
              <img src="/assets/logo/small.png" alt="GeNova" className="h-9 w-9" />
            </div>
          ) : (
            <div className="flex h-[60px] items-center px-1.5">
              <Logo />
            </div>
          )}
          {/* 접힘 상태의 nav 아이템(h-11)은 펼침 상태(h-[60px])보다 낮아 gap-1이 동일해도
              행 간 실제 간격(pitch)이 좁아 보인다. gap-[25px]는 펼침 상태 기준 pitch(63.5px)에
              맞춘 보정값. */}
          <nav className={`flex flex-col ${collapsed ? 'gap-[25px]' : 'gap-1'}`}>
            {NAV.map(({ to, label, icon: Icon, requiresAuth }) => (
              <NavLink
                key={to}
                to={to}
                onClick={(e) => {
                  if (requiresAuth && !isAuthenticated) {
                    e.preventDefault();
                    confirmLogin(navigate);
                  }
                }}
                className={({ isActive }) =>
                  collapsed
                    ? `flex h-11 items-center justify-center rounded-full border px-0 text-body-medium transition-colors ${
                        isActive
                          ? 'glass-1 border-[rgba(231,180,255,0.7)] bg-[var(--selected-bg)] text-content'
                          : 'border-transparent text-content-secondary hover:bg-surface-2 hover:text-content'
                      }`
                    : `flex h-[60px] items-center gap-4 border p-4 text-[18px] leading-[28px] transition-colors ${
                        isActive
                          ? 'rounded-[100px] border-[#f5c0ff] bg-[rgba(240,165,255,0.3)] text-[#f8d6ff]'
                          : 'rounded-[12px] border-transparent text-[#9e9e9e] hover:bg-surface-2 hover:text-content'
                      }`
                }
              >
                <Icon size={collapsed ? 20 : 24} strokeWidth={2} />
                {!collapsed && label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={`flex items-center text-left transition-colors hover:bg-surface-2 ${
                collapsed
                  ? 'justify-center rounded-[var(--radius-btn)] p-2'
                  : 'gap-[15px] rounded-[11px] p-[10px]'
              }`}
            >
              <img
                src={profile?.profileImageUrl || DEFAULT_AVATAR}
                alt=""
                className={
                  collapsed
                    ? 'h-9 w-9 shrink-0 rounded-full'
                    : 'h-[50px] w-[50px] shrink-0 rounded-full border border-[rgba(255,255,255,0.15)] object-cover'
                }
              />
              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate text-[16px] font-bold leading-[24px] text-[#e9e0e9]">
                    {profile?.nickname}
                  </div>
                  <div className="truncate font-num text-[12px] leading-[16px] text-[#988e99]">
                    {profile?.email}
                  </div>
                </div>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`flex items-center justify-center gap-2 rounded-full bg-brand font-medium text-white transition-colors hover:bg-brand-dark ${
                collapsed ? 'h-11' : 'h-12 text-[16px]'
              }`}
            >
              <LogIn size={collapsed ? 20 : 18} strokeWidth={2} />
              {!collapsed && '로그인하기'}
            </button>
          )}

          {!collapsed && isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white/4 px-4 py-3 text-[14px] font-medium text-[#d6d6d6] transition-colors hover:bg-surface-2"
            >
              로그아웃
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
