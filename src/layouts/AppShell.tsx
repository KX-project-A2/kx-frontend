import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-canvas">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(60% 50% at 15% 0%, rgba(194, 85, 255, 0.12) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
