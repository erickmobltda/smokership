import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCatalog, type Cigar } from '@/lib/catalog';
import { CigarCard } from '@/components/CigarCard';
import { Stars } from '@/components/Stars';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyRatings } from '@/features/ratings/useRatings';
import { useHumidor, useWishlist } from './useCollection';

function Empty({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {text}{' '}
      <Link to="/" className="text-primary underline">
        {t('nav.discover')}
      </Link>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function HumidorPage() {
  const { t } = useTranslation();
  const { data: catalog } = useCatalog();
  const humidor = useHumidor();
  const wishlist = useWishlist();
  const tasted = useMyRatings();
  const get = (id: string): Cigar | undefined => catalog?.get(id);
  const total = humidor.data.reduce((s, h) => s + h.quantity, 0);
  const loading = !catalog || humidor.loading || wishlist.loading || tasted.loading;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{t('humidor.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('humidor.summary', { count: total, kinds: humidor.data.length })}</p>
      </div>
      {loading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <Tabs defaultValue="humidor">
          <TabsList className="w-full">
            <TabsTrigger value="humidor" className="flex-1">{t('humidor.tabHumidor')} ({humidor.data.length})</TabsTrigger>
            <TabsTrigger value="wish" className="flex-1">{t('humidor.tabWish')} ({wishlist.data.length})</TabsTrigger>
            <TabsTrigger value="tasted" className="flex-1">{t('humidor.tabTasted')} ({tasted.data.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="humidor" className="mt-4">
            {humidor.data.length === 0 ? (
              <Empty text={t('humidor.emptyHumidor')} />
            ) : (
              <Grid>
                {[...humidor.data]
                  .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
                  .map((h) => {
                    const c = get(h.cigarId);
                    return c ? (
                      <CigarCard
                        key={h.id}
                        cigar={c}
                        extra={
                          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span className="text-primary">{t('cigar.inHumidor', { count: h.quantity })}</span>
                            <span>{t('humidor.since', { date: h.addedAt.slice(0, 10) })}</span>
                          </div>
                        }
                      />
                    ) : null;
                  })}
              </Grid>
            )}
          </TabsContent>
          <TabsContent value="wish" className="mt-4">
            {wishlist.data.length === 0 ? (
              <Empty text={t('humidor.emptyWish')} />
            ) : (
              <Grid>
                {wishlist.data.map((w) => {
                  const c = get(w.cigarId);
                  return c ? <CigarCard key={w.id} cigar={c} /> : null;
                })}
              </Grid>
            )}
          </TabsContent>
          <TabsContent value="tasted" className="mt-4">
            {tasted.data.length === 0 ? (
              <Empty text={t('humidor.emptyTasted')} />
            ) : (
              <Grid>
                {tasted.data.map((r) => {
                  const c = get(r.cigarId);
                  return c ? (
                    <CigarCard
                      key={r.id}
                      cigar={c}
                      extra={
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <Stars value={r.stars} />
                          <span>{r.smokedOn}</span>
                        </div>
                      }
                    />
                  ) : null;
                })}
              </Grid>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
