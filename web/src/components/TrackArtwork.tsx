import type { CSSProperties } from 'react';

type Props = { src?: string; alt: string; size?: 'sm' | 'md' | 'lg' | 'hero'; className?: string };

export function TrackArtwork({ src, alt, size = 'md', className = '' }: Props) {
  const style = src ? ({ '--art': `url(${src})` } as CSSProperties) : undefined;
  return <div className={`artwork artwork-${size} ${className}`} style={style} aria-label={alt} role="img">{src ? <img src={src} alt="" loading="lazy" /> : <span>SONORA</span>}</div>;
}
