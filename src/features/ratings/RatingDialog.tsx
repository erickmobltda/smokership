import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StarInput } from '@/components/Stars';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/utils';
import { deleteRating, FLAVORS, myDisplayName, saveRating, type Flavor, type Rating } from './useRatings';

export function RatingDialog({ open, onOpenChange, cigarId, cigarName, existing }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cigarId: string;
  cigarName: string;
  existing?: Rating;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stars, setStars] = React.useState(existing?.stars ?? 0);
  const [flavors, setFlavors] = React.useState<Flavor[]>(existing?.flavors ?? []);
  const [notes, setNotes] = React.useState(existing?.notes ?? '');
  const [smokedOn, setSmokedOn] = React.useState(existing?.smokedOn ?? new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setStars(existing?.stars ?? 0);
    setFlavors(existing?.flavors ?? []);
    setNotes(existing?.notes ?? '');
    setSmokedOn(existing?.smokedOn ?? new Date().toISOString().slice(0, 10));
  }, [open, existing]);

  const toggle = (f: Flavor) => setFlavors((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : cur.length >= 6 ? cur : [...cur, f]));

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const name = await myDisplayName(user.email?.split('@')[0] ?? 'Smoker');
      await saveRating({ cigarId, stars, flavors, notes: notes.trim(), smokedOn }, user.uid, name, existing?.createdAt);
      toast.success(t('rate.saved'));
      onOpenChange(false);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      await deleteRating(cigarId);
      onOpenChange(false);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t('rate.title')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{cigarName}</p>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-1">
            <StarInput value={stars} onChange={setStars} />
            <span className="text-xs text-muted-foreground">{stars ? `${stars} / 5` : t('rate.tapStars')}</span>
          </div>
          <div className="space-y-2">
            <Label>{t('rate.flavors')}</Label>
            <div className="flex flex-wrap gap-2">
              {FLAVORS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggle(f)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors',
                    flavors.includes(f) ? 'border-primary bg-primary/15 text-primary' : 'text-muted-foreground',
                  )}
                >
                  {t(`flavor.${f}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smokedOn">{t('rate.smokedOn')}</Label>
            <Input id="smokedOn" type="date" value={smokedOn} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setSmokedOn(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t('rate.notes')}</Label>
            <textarea
              id="notes"
              value={notes}
              maxLength={1000}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={t('rate.notesPlaceholder')}
              className="w-full rounded-md border bg-background p-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            {existing ? (
              <Button variant="outline" onClick={remove} disabled={saving}>
                {t('common.delete')}
              </Button>
            ) : null}
            <Button className="flex-1" onClick={save} disabled={saving || !stars || !smokedOn}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
