import { cn } from '@/lib/utils';

/** Smokership mark: a lit cigar. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-7', className)} aria-hidden>
      <rect width="64" height="64" rx="14" fill="hsl(var(--card))" />
      <rect x="10" y="28" width="38" height="10" rx="5" fill="hsl(var(--secondary))" />
      <rect x="40" y="28" width="8" height="10" fill="hsl(var(--primary))" />
      <rect x="48" y="28" width="6" height="10" rx="2" fill="hsl(var(--foreground))" />
      <path d="M52 24c-2-3 2-5 0-9" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
