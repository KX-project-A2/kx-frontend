import { Home, Image as ImageIcon, Library, Video, Zap } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '@/components/common/Logo';

const NAV = [
  { to: '/home', label: '홈', icon: Home },
  { to: '/image', label: '이미지', icon: ImageIcon },
  { to: '/video', label: '영상', icon: Video },
  { to: '/library', label: '라이브러리', icon: Library },
];

const ME = {
  handle: '@lumina_studio',
  avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=lumina',
};

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col justify-between border-r border-stroke-soft bg-surface-1 px-4 py-6">
      <div className="flex flex-col gap-8">
        <div className="px-1.5">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-[var(--radius-btn)] border px-3 text-body-medium transition-colors ${
                  isActive
                    ? 'border-[var(--selected-border)] bg-[var(--selected-bg)] text-content'
                    : 'border-transparent text-content-secondary hover:bg-surface-2 hover:text-content'
                }`
              }
            >
              <Icon size={20} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-[var(--radius-btn)] border border-stroke-soft bg-surface-2 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500/15">
              <Zap size={13} strokeWidth={2.5} className="fill-accent-500 text-accent-500" />
            </span>
            <span className="text-caption text-content-secondary">크레딧</span>
          </div>
          <span className="font-num text-body-medium text-accent-500">320</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/library')}
          className="flex items-center gap-3 rounded-[var(--radius-btn)] p-2 text-left transition-colors hover:bg-surface-2"
        >
          <img src={ME.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0">
            <div className="truncate text-body-medium text-content">내 스튜디오</div>
            <div className="truncate font-num text-caption text-content-muted">{ME.handle}</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
