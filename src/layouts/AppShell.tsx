import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
