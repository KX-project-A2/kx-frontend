import { cn } from '../common/ui';

type AuthCardProps = React.HTMLAttributes<HTMLDivElement>;

// Card shell (560px wide, 64px padding, 40px gap, 40px radius) extracted from Login.tsx.
export default function AuthCard({ className, style, children, ...props }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-140 shrink-0 flex flex-col items-start gap-10 rounded-[40px] p-16',
        className
      )}
      style={{
        background: 'rgba(1, 1, 1, 0.3)',
        boxShadow: '0 2px 4px 0 rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
