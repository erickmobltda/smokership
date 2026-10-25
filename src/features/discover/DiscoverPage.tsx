import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { facet, search, STRENGTHS, useCatalog, type Filters, type Strength } from '@/lib/catalog';
import { CigarCard } from '@/components/CigarCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PAGE = 48;
const SCORES = [85, 90, 93];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active ? 'border-primary bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function Select({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={cn('h-9 rounded-full border bg-card px-3 text-xs', value ? 'border-primary text-primary' : 'text-muted-foreground')}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function DiscoverPage() {
  const { t } = useTranslation();
  const { data: catalog, isLoading, error } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [shown, setShown] = React.useState(PAGE);
  const [showFilters, setShowFilters] = React.useState(false);

  const filters: Filters = {
    text: params.get('q') ?? '',
    strength: (params.get('strength') ?? '') as Strength | '',
    country: params.get('country') ?? '',
    size: params.get('size') ?? '',
    minScore: Number(params.get('score') ?? 0),
  };
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setShown(PAGE);
  };

  const all = React.useMemo(() => (catalog ? [...catalog.values()] : []), [catalog]);
  const countries = React.useMemo(() => facet(all, 'country'), [all]);
  const sizes = React.useMemo(() => facet(all, 'size'), [all]);
  const results = React.useMemo(() => {
    const found = search(all, filters);
    // Rated cigars with photos first, so the first screen looks alive.
    return found.sort((a, b) => (b.bestScore ?? 0) - (a.bestScore ?? 0) || Number(!!b.image) - Number(!!a.image));
  }, [all, params]);
  const activeFilters = [filters.strength, filters.country, filters.size, filters.minScore].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{t('discover.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('discover.subtitle', { count: all.length })}</p>
      </div>

      <div className="sticky top-14 z-20 -mx-4 space-y-3 bg-background/85 px-4 py-2 backdrop-blur-xl md:-mx-8 md:top-0 md:px-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filters.text}
              onChange={(e) => set('q', e.target.value)}
              placeholder={t('discover.placeholder')}
              className="h-11 w-full rounded-xl border bg-card pl-9 pr-9 text-sm outline-none focus:border-primary"
              type="text"
              enterKeyHint="search"
            />
            {filters.text ? (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => set('q', '')} aria-label={t('common.clear')}>
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters((v) => !v)} aria-label={t('discover.filters')} className="relative">
            <SlidersHorizontal />
            {activeFilters ? (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {activeFilters}
              </span>
            ) : null}
          </Button>
        </div>

        {showFilters ? (
          <div className="space-y-2 animate-fade-in">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {STRENGTHS.map((s) => (
                <Chip key={s} active={filters.strength === s} onClick={() => set('strength', filters.strength === s ? '' : s)}>
                  {t(`strength.${s}`)}
                </Chip>
              ))}
            </div>
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
              {SCORES.map((s) => (
                <Chip key={s} active={filters.minScore === s} onClick={() => set('score', filters.minScore === s ? '' : String(s))}>
                  CA {s}+
                </Chip>
              ))}
              <Select value={filters.country} onChange={(v) => set('country', v)} label={t('cigar.country')} options={countries} />
              <Select value={filters.size} onChange={(v) => set('size', v)} label={t('cigar.size')} options={sizes} />
              {activeFilters ? (
                <button className="shrink-0 text-xs text-muted-foreground underline" onClick={() => setParams(filters.text ? { q: filters.text } : {}, { replace: true })}>
                  {t('discover.clearFilters')}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{t('common.error')}</p> : null}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{t('discover.empty')}</div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{t('discover.results', { count: results.length })}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, shown).map((c) => (
              <CigarCard key={c.id} cigar={c} />
            ))}
          </div>
          {shown < results.length ? (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
                {t('discover.more')}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
