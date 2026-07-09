import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Heart, Minus, Plus } from 'lucide-react';

/* ---------------------------------------------------------------- utils */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/* ---------------------------------------------------------------- Button */
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-caption',
  md: 'h-10 px-4 text-body-medium',
  lg: 'h-12 px-6 text-title',
};

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  leftIcon,
  rightIcon,
  className,
  children,
  style,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-btn transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap';

  // M3 button types: primary=Filled · secondary=Outlined · tertiary/ghost=Text
  const variants: Record<ButtonVariant, string> = {
    primary: 'hover:brightness-95',
    secondary: 'border hover:bg-surface-3',
    tertiary: 'hover:bg-surface-2',
    ghost: 'hover:bg-surface-2 hover:text-content',
  };

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: 'var(--brand)', color: 'var(--brand-on)' }
      : variant === 'secondary'
        ? { borderColor: 'var(--md-outline)', color: 'var(--md-primary)', background: 'transparent' }
        : variant === 'tertiary'
          ? { color: 'var(--md-primary)' }
          : { color: 'var(--content-secondary)' };

  return (
    <button
      className={cn(base, SIZES[size], variants[variant], block && 'w-full', className)}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

/* ---------------------------------------------------------------- IconButton */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  active?: boolean;
  tone?: 'default' | 'danger';
}

export function IconButton({ size = 28, active, tone = 'default', className, children, style, ...props }: IconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full backdrop-blur transition-colors',
        active ? 'text-white' : tone === 'danger' ? 'text-content-secondary hover:text-danger' : 'text-content-secondary hover:text-content',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: active ? 'var(--brand)' : 'rgba(11, 9, 18, 0.6)',
        border: '1px solid var(--stroke-strong)',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- TextField */
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  numeric?: boolean;
}

export function TextField({ label, hint, numeric, className, id, ...props }: TextFieldProps) {
  const fid = id || label;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={fid} className="text-label text-content-secondary">
          {label}
        </label>
      )}
      <input
        id={fid}
        className={cn(
          'h-11 w-full rounded-field px-3.5 text-body text-content placeholder:text-content-muted outline-none transition-colors',
          'focus:border-selected-border',
          numeric && 'font-num',
          className,
        )}
        style={{ background: 'var(--surface-2)', border: '1px solid var(--stroke-strong)' }}
        {...props}
      />
      {hint && <span className="text-caption text-content-muted">{hint}</span>}
    </div>
  );
}

/* ---------------------------------------------------------------- Panel / Card */
interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  bordered?: boolean;
}

export function Panel({ level = 2, bordered = true, className, style, children, ...props }: SurfaceProps) {
  const glass = level === 1 ? 'glass-1' : level === 3 ? 'glass-3' : 'glass-2';
  return (
    <div
      className={cn('rounded-card', glass, !bordered && 'border-transparent', className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- Chip */
interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  as?: 'button' | 'span';
}

export function Chip({ selected, className, children, style, as = 'button', ...props }: ChipProps) {
  const cls = cn(
    'inline-flex items-center gap-1.5 rounded-chip px-3 h-8 text-caption transition-colors',
    as === 'button' && 'hover:border-selected-border cursor-pointer',
    className,
  );
  const st: React.CSSProperties = {
    background: selected ? 'var(--selected-bg)' : 'var(--surface-3)',
    border: `1px solid ${selected ? 'var(--selected-border)' : 'var(--stroke-strong)'}`,
    color: selected ? 'var(--content)' : 'var(--content-secondary)',
    ...style,
  };
  if (as === 'span') {
    return (
      <span className={cls} style={st}>
        {children}
      </span>
    );
  }
  return (
    <button className={cls} style={st} {...props}>
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- Badge */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'yellow' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  const map: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: 'var(--surface-3)', fg: 'var(--content-secondary)' },
    brand: { bg: 'var(--selected-bg)', fg: 'var(--brand-light)' },
    yellow: { bg: 'rgba(234, 251, 47, 0.16)', fg: 'var(--accent-yellow)' },
    success: { bg: 'rgba(52, 211, 153, 0.16)', fg: 'var(--success)' },
    warning: { bg: 'rgba(251, 191, 36, 0.16)', fg: 'var(--warning)' },
    danger: { bg: 'rgba(248, 113, 113, 0.16)', fg: 'var(--danger)' },
    info: { bg: 'rgba(96, 165, 250, 0.16)', fg: 'var(--info)' },
  };
  const c = map[tone];
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-chip px-2 h-6 text-label font-num', className)}
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Avatar */
export function Avatar({ src, size = 28, alt = '' }: { src: string; size?: number; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="rounded-full object-cover"
      style={{ width: size, height: size, border: '1px solid var(--stroke-strong)' }}
    />
  );
}

/* ---------------------------------------------------------------- LikePill */
export function LikePill({
  count,
  liked,
  onToggle,
  size = 'md',
}: {
  count: number;
  liked: boolean;
  onToggle?: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 rounded-chip backdrop-blur transition-colors',
        size === 'sm' ? 'h-6 px-2' : 'h-7 px-2.5',
      )}
      style={{ background: 'rgba(11, 9, 18, 0.6)', border: '1px solid var(--stroke-strong)' }}
    >
      <Heart
        size={size === 'sm' ? 13 : 15}
        strokeWidth={2}
        style={{
          color: liked ? 'var(--danger)' : 'var(--content-secondary)',
          fill: liked ? 'var(--danger)' : 'transparent',
        }}
      />
      <span className="text-label font-num" style={{ color: liked ? 'var(--content)' : 'var(--content-secondary)' }}>
        {count.toLocaleString()}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------- Select (dropdown) */
export function Select({
  value,
  options,
  onChange,
  label,
  disabled,
  className,
}: {
  value: string;
  options: string[];
  onChange?: (v: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="text-label text-content-secondary">{label}</span>}
      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-field px-3 text-body text-content transition-colors',
            !disabled && 'hover:border-selected-border',
            disabled && 'opacity-60 cursor-not-allowed',
          )}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--stroke-strong)' }}
        >
          <span className="truncate">{value}</span>
          {!disabled && <ChevronDown size={16} strokeWidth={2} className="text-content-muted shrink-0" />}
        </button>
        {open && (
          <div
            className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-field p-1 shadow-xl"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--stroke-strong)' }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange?.(opt);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-body text-content-secondary hover:bg-surface-2 hover:text-content"
              >
                <span className="truncate text-left">{opt}</span>
                {opt === value && <Check size={15} strokeWidth={2} style={{ color: 'var(--brand-light)' }} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Stepper */
export function Stepper({
  value,
  min = 1,
  max = 4,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange?: (v: number) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-label text-content-secondary">{label}</span>}
      <div
        className="flex h-10 items-center justify-between rounded-field px-1.5"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--stroke-strong)' }}
      >
        <button
          type="button"
          onClick={() => onChange?.(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-3 hover:text-content disabled:opacity-30"
        >
          <Minus size={16} strokeWidth={2} />
        </button>
        <span className="font-num text-body-medium text-content">{value}</span>
        <button
          type="button"
          onClick={() => onChange?.(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-3 hover:text-content disabled:opacity-30"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Toggle */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
        style={{
          background: checked ? 'var(--brand)' : 'var(--surface-3)',
          border: '1px solid var(--stroke-strong)',
        }}
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(3px)' }}
        />
      </span>
      {label && <span className="text-caption text-content-secondary">{label}</span>}
    </button>
  );
}

/* ---------------------------------------------------------------- Checkbox */
export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={() => onChange?.(!checked)} className="inline-flex items-center gap-2.5 text-left">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors"
        style={{
          background: checked ? 'var(--brand)' : 'var(--surface-2)',
          border: `1px solid ${checked ? 'var(--brand)' : 'var(--stroke-strong)'}`,
        }}
      >
        {checked && <Check size={13} strokeWidth={3} className="text-white" />}
      </span>
      {children && <span className="text-caption text-content-secondary">{children}</span>}
    </button>
  );
}

/* ---------------------------------------------------------------- Tabs */
export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange?: (id: string) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-chip p-1"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--stroke-soft)' }}
    >
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange?.(t.id)}
            className={cn('rounded-chip px-4 h-8 text-caption transition-colors', active ? 'text-white' : 'text-content-secondary hover:text-content')}
            style={active ? { background: 'var(--brand)' } : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
