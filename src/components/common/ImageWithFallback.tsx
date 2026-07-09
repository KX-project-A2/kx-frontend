import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  style,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-surface-3 ${className}`} style={style}>
        <ImageOff className="h-6 w-6 text-content-muted" />
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} />
  );
}
