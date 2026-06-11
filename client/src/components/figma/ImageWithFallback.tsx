import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

type ImageWithFallbackProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function ImageWithFallback({
  alt,
  fallbackSrc,
  src,
  className = '',
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  if (failed && !fallbackSrc) {
    return (
      <div
        aria-label={alt}
        className={`flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-400 ${className}`}
      >
        IMG
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      src={currentSrc}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          return;
        }
        setFailed(true);
      }}
      {...props}
    />
  );
}
