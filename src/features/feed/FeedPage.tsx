import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCatalog } from '@/lib/catalog';
import { CigarImage } from '@/components/CigarImage';
import { Stars } from '@/components/Stars';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeed } from '@/features/ratings/useRatings';

export function FeedPage() {
  const { t } = useTranslation();
  const { data: catalog } = useCatalog();
  const feed = useFeed();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{t('feed.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('feed.subtitle')}</p>
      </div>
      {feed.loading || !catalog ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : feed.data.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{t('feed.empty')}</div>
      ) : (
        feed.data.map((r) => {
          const c = catalog.get(r.cigarId);
          if (!c) return null;
          return (
            <article key={r.id} className="rounded-xl border bg-card p-4 animate-fade-in">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 font-display font-semibold text-primary">
                  {r.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{r.displayName}</span> <span className="text-muted-foreground">{t('feed.smoked')}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{r.smokedOn}</div>
                </div>
                <Stars value={r.stars} />
              </div>
              <Link to={`/cigar/${c.id}`} className="block rounded-lg bg-muted/30 p-3 hover:bg-muted/50">
                <CigarImage cigar={c} className="bg-none" />
                <div className="mt-2 font-medium">{c.name}</div>
              </Link>
              {r.flavors.length ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.flavors.map((f) => (
                    <span key={f} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {t(`flavor.${f}`)}
                    </span>
                  ))}
                </div>
              ) : null}
              {r.notes ? <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{r.notes}</p> : null}
            </article>
          );
        })
      )}
    </div>
  );
}
