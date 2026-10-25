import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Minus, Plus, Archive, PenLine } from 'lucide-react';
import { useCatalog } from '@/lib/catalog';
import { CigarImage } from '@/components/CigarImage';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth/useAuth';
import { setHumidorQuantity, toggleWish, useHumidor, useWishlist } from '@/features/collection/useCollection';
import { useCigarRatings } from '@/features/ratings/useRatings';
import { RatingDialog } from '@/features/ratings/RatingDialog';
import { cn } from '@/lib/utils';

function Spec({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

export function CigarPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: catalog, isLoading } = useCatalog();
  const humidor = useHumidor();
  const wishlist = useWishlist();
  const ratings = useCigarRatings(id);
  const [rateOpen, setRateOpen] = React.useState(false);

  const cigar = catalog?.get(id);
  const inHumidor = humidor.data.find((h) => h.cigarId === id);
  const wished = wishlist.data.some((w) => w.cigarId === id);
  const mine = user ? ratings.data.find((r) => r.uid === user.uid) : undefined;
  const avg = ratings.data.length ? ratings.data.reduce((s, r) => s + r.stars, 0) / ratings.data.length : 0;

  const needLogin = () => navigate('/login', { state: { from: `/cigar/${id}` } });
  const guard = async (fn: () => Promise<unknown>) => {
    if (!user) return needLogin();
    try {
      await fn();
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!cigar) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        {t('cigar.notFound')}{' '}
        <Link to="/" className="text-primary underline">
          {t('nav.discover')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t('common.back')}
      </button>

      <div className="rounded-2xl border bg-card p-4 md:p-6">
        <CigarImage cigar={cigar} className="bg-gradient-to-r from-muted/40 to-transparent" />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">{cigar.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{[cigar.brand, cigar.country].filter(Boolean).join(' · ')}</p>
            {ratings.data.length ? (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Stars value={Math.round(avg * 2) / 2} />
                <span className="text-muted-foreground">{t('cigar.community', { avg: avg.toFixed(1), count: ratings.data.length })}</span>
              </div>
            ) : null}
          </div>
          {cigar.bestScore ? (
            <div className="shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-center">
              <div className="font-display text-3xl font-semibold leading-none text-primary">{cigar.bestScore}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{t('cigar.caScore')}</div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Button onClick={() => (user ? setRateOpen(true) : needLogin())} className="col-span-3 sm:col-span-1">
            <PenLine /> {mine ? t('cigar.editRating') : t('cigar.rate')}
          </Button>
          <Button variant="outline" className={cn('col-span-3 sm:col-span-1', wished && 'border-primary text-primary')} onClick={() => guard(() => toggleWish(id, !wished))}>
            <Heart className={cn(wished && 'fill-current')} /> {wished ? t('cigar.wished') : t('cigar.wish')}
          </Button>
          {inHumidor ? (
            <div className="col-span-3 flex items-center justify-between rounded-md border border-primary/40 px-2 sm:col-span-1">
              <button className="p-2" aria-label="-" onClick={() => guard(() => setHumidorQuantity(id, inHumidor.quantity - 1, inHumidor.addedAt))}>
                <Minus className="size-4" />
              </button>
              <span className="text-sm">
                <Archive className="mr-1 inline size-4 text-primary" />
                {t('cigar.inHumidor', { count: inHumidor.quantity })}
              </span>
              <button className="p-2" aria-label="+" onClick={() => guard(() => setHumidorQuantity(id, inHumidor.quantity + 1, inHumidor.addedAt))}>
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <Button variant="outline" className="col-span-3 sm:col-span-1" onClick={() => guard(() => setHumidorQuantity(id, 1))}>
              <Archive /> {t('cigar.addHumidor')}
            </Button>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t('cigar.specs')}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Spec label={t('cigar.size')} value={cigar.size} />
          <Spec label={t('cigar.length')} value={cigar.length} />
          <Spec label={t('cigar.gauge')} value={cigar.gauge} />
          <Spec label={t('cigar.strength')} value={cigar.strength ? t(`strength.${cigar.strength}`) : ''} />
          <Spec label={t('cigar.wrapper')} value={cigar.wrapper} />
          <Spec label={t('cigar.binder')} value={cigar.binder} />
          <Spec label={t('cigar.filler')} value={cigar.filler} />
          <Spec label={t('cigar.country')} value={cigar.country} />
        </div>
        {cigar.scores.length > 1 ? (
          <p className="mt-3 text-xs text-muted-foreground">{t('cigar.allScores', { scores: cigar.scores.join(', ') })}</p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t('cigar.tastings')}</h2>
        {!user ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/login" state={{ from: `/cigar/${id}` }} className="text-primary underline">
              {t('auth.signIn')}
            </Link>{' '}
            {t('cigar.signInToSee')}
          </p>
        ) : ratings.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('cigar.noTastings')}</p>
        ) : (
          <div className="space-y-3">
            {ratings.data.map((r) => (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.displayName}</span>
                  <Stars value={r.stars} />
                </div>
                {r.flavors.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.flavors.map((f) => (
                      <span key={f} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {t(`flavor.${f}`)}
                      </span>
                    ))}
                  </div>
                ) : null}
                {r.notes ? <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{r.notes}</p> : null}
                <div className="mt-2 text-[11px] text-muted-foreground">{r.smokedOn}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <RatingDialog open={rateOpen} onOpenChange={setRateOpen} cigarId={id} cigarName={cigar.name} existing={mine} />
    </div>
  );
}
