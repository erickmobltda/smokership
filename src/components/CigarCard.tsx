import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Cigar } from '@/lib/catalog';
import { CigarImage } from './CigarImage';

export function CigarCard({ cigar, extra }: { cigar: Cigar; extra?: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <Link
      to={`/cigar/${cigar.id}`}
      className="group block min-w-0 rounded-xl border bg-card p-3 transition-colors hover:border-primary/40 animate-fade-in"
    >
      <CigarImage cigar={cigar} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium group-hover:text-primary">{cigar.name}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {[cigar.country, cigar.size, cigar.strength && t(`strength.${cigar.strength}`)].filter(Boolean).join(' · ')}
          </div>
        </div>
        {cigar.bestScore ? (
          <div className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-center">
            <div className="font-display text-lg font-semibold leading-none text-primary">{cigar.bestScore}</div>
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">CA</div>
          </div>
        ) : null}
      </div>
      {extra}
    </Link>
  );
}
