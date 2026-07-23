import Logo from '../common/Logo';

interface AuthBackgroundProps {
  heroSrc?: string | null;
  heroAlt?: string;
  heroClassName?: string;
  heroStyle?: React.CSSProperties;
  slideIndicator?: React.ReactNode;
  footer?: React.ReactNode;
  tagline?: React.ReactNode;
  children: React.ReactNode;
}

// Background (Background.png + glow layers + vignette) + hero image + card slot,
// extracted from Login.tsx so signup steps can reuse the identical visual shell.
export default function AuthBackground({
  heroSrc = '/assets/auth/hero.png',
  heroAlt = '',
  heroClassName = 'absolute top-0 h-full w-auto object-cover',
  heroStyle = { left: 549.2 },
  slideIndicator,
  footer,
  tagline = '한계없는 상상을, 현실로',
  children,
}: AuthBackgroundProps) {
  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={
        {
          '--glow-purple-color': '#6C48C0',
          '--glow-purple-x': '30%',
          '--glow-purple-y': '40%',
          '--glow-purple-radius': '65vmax',
          '--glow-pink-color': '#F644CC',
          '--glow-pink-x': '25%',
          '--glow-pink-y': '52%',
          '--glow-pink-radius': '32vmax',
          '--vignette-opacity': '1',
        } as React.CSSProperties
      }
    >
      {/* base background layer — Background.png + hard-light gradient, spans full viewport */}
      <img
        src="/assets/auth/Background.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(108, 72, 192, 0.45) 0%, rgba(89, 69, 137, 0) 100%)',
          mixBlendMode: 'hard-light',
        }}
      />

      {/* card-centered radial glow — purple hard-light, then a smaller pink hue layer closer to the card */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle var(--glow-purple-radius) at var(--glow-purple-x) var(--glow-purple-y), var(--glow-purple-color) 0%, transparent 100%)',
          mixBlendMode: 'hard-light',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle var(--glow-pink-radius) at var(--glow-pink-x) var(--glow-pink-y), var(--glow-pink-color) 0%, transparent 100%)',
          mixBlendMode: 'hue',
        }}
      />

      {/* bottom vignette — top stays transparent (navy shows through), fades to near-black at the bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, var(--vignette-opacity)) 100%)',
          mixBlendMode: 'normal',
        }}
      />

      {heroSrc && <img src={heroSrc} alt={heroAlt} className={heroClassName} style={heroStyle} />}

      {slideIndicator}

      {/* card + footer, absolutely positioned so it can float over the hero underlap zone */}
      <div
        className="absolute z-10 flex flex-col items-start justify-center gap-6"
        style={{ left: 119, top: 0, bottom: 0 }}
      >
        {children}
        {footer}
      </div>

      <div className="absolute right-16 top-16 z-10">
        <Logo />
      </div>

      {tagline && (
        <div
          className="absolute bottom-26.25 right-30.25 z-10 w-max text-right"
          style={{
            color: '#F5F5F5',
            fontFamily: '"Noto Sans KR", var(--font-sans)',
            fontSize: 48,
            fontWeight: 700,
            lineHeight: '56px',
            letterSpacing: '-0.48px',
            wordBreak: 'keep-all',
          }}
        >
          {tagline}
        </div>
      )}
    </div>
  );
}
