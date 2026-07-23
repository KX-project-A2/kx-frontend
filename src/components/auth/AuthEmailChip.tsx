import { Mail } from 'lucide-react';

// Confirmed-email display chip shown on the nickname/password signup steps.
export default function AuthEmailChip({ email }: { email: string }) {
  return (
    <div
      className="flex w-full items-center gap-2 rounded-xl px-4.5 py-4"
      style={{
        background: 'rgba(238, 238, 238, 0.10)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <Mail size={20} style={{ color: '#d6d6d6' }} />
      <span className="text-lg" style={{ color: '#d6d6d6' }}>
        {email}
      </span>
    </div>
  );
}
