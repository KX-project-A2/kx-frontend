import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';

export interface VideoWithFallbackHandle {
  togglePlay: () => void;
}

interface VideoWithFallbackProps {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onPlayingChange?: (playing: boolean) => void;
  disableClickToggle?: boolean;
}

const VideoWithFallback = forwardRef<VideoWithFallbackHandle, VideoWithFallbackProps>(
  function VideoWithFallback(
    { src, poster, alt, className = '', style, onPlayingChange, disableClickToggle },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [failed, setFailed] = useState(false);

    useImperativeHandle(ref, () => ({
      togglePlay: () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) video.play();
        else video.pause();
      },
    }));

    if (failed) {
      return (
        <div className={`flex items-center justify-center bg-surface-3 ${className}`} style={style}>
          <VideoOff className="h-6 w-6 text-content-muted" />
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={alt}
        className={className}
        style={style}
        playsInline
        preload="metadata"
        onClick={(e) => {
          if (disableClickToggle) return;
          e.stopPropagation();
          const video = videoRef.current;
          if (!video) return;
          if (video.paused) video.play();
          else video.pause();
        }}
        onPlay={() => onPlayingChange?.(true)}
        onPause={() => onPlayingChange?.(false)}
        onEnded={() => onPlayingChange?.(false)}
        onError={() => setFailed(true)}
      />
    );
  }
);

export default VideoWithFallback;
