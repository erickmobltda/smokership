import * as React from 'react';
import { imageUrl, type Cigar } from '@/lib/catalog';
import { cn } from '@/lib/utils';

/** The band photos are 990x200; without one, draw a plain cigar so the layout stays put. */
export function CigarImage({ cigar, className }: { cigar: Pick<Cigar, 'image' | 'name'>; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  const src = imageUrl(cigar);
  return (
    <div className={cn('flex aspect-[99/20] w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-muted/60 to-muted/20', className)}>
      {src && !failed ? (
        <img src={src} alt={cigar.name} loading="lazy" decoding="async" className="h-full w-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <svg viewBox="0 0 200 40" className="h-1/2 opacity-40" aria-hidden>
          <rect x="4" y="12" width="160" height="16" rx="8" fill="hsl(var(--secondary))" />
          <rect x="120" y="12" width="22" height="16" fill="hsl(var(--primary))" />
          <rect x="164" y="12" width="20" height="16" rx="4" fill="hsl(var(--muted-foreground))" />
        </svg>
      )}
    </div>
  );
}
