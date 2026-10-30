/** Shown when a cigar has no band photo: a plain cigar, so the layout stays put. */
export function Placeholder() {
  return (
    <svg viewBox="0 0 200 40" className="h-1/2 opacity-40" aria-hidden>
      <rect x="4" y="12" width="160" height="16" rx="8" fill="hsl(var(--secondary))" />
      <rect x="120" y="12" width="22" height="16" fill="hsl(var(--primary))" />
      <rect x="164" y="12" width="20" height="16" rx="4" fill="hsl(var(--muted-foreground))" />
    </svg>
  );
}
