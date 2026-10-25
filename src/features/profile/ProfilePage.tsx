import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';
import { LogOut } from 'lucide-react';
import { auth, userDoc } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth/useAuth';
import { useHumidor, useWishlist } from '@/features/collection/useCollection';
import { useMyRatings } from '@/features/ratings/useRatings';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <div className="font-display text-3xl font-semibold text-primary">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const humidor = useHumidor();
  const wishlist = useWishlist();
  const tasted = useMyRatings();
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    void getDoc(userDoc('profile', 'main')).then((s) => setName((s.data()?.displayName as string) ?? ''));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(userDoc('profile', 'main'), { displayName: name.trim().slice(0, 40) });
      toast.success(t('profile.saved'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat value={humidor.data.reduce((s, h) => s + h.quantity, 0)} label={t('profile.inHumidor')} />
        <Stat value={tasted.data.length} label={t('profile.tasted')} />
        <Stat value={wishlist.data.length} label={t('profile.wished')} />
      </div>
      <form onSubmit={save} className="space-y-2 rounded-xl border bg-card p-4">
        <Label htmlFor="displayName">{t('profile.displayName')}</Label>
        <div className="flex gap-2">
          <Input id="displayName" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder={user?.email?.split('@')[0]} />
          <Button type="submit" disabled={saving || !name.trim()}>
            {t('common.save')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('profile.displayNameHint')}</p>
      </form>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => i18n.changeLanguage(i18n.language.startsWith('pt') ? 'en' : 'pt-BR')}>
          {i18n.language.startsWith('pt') ? 'English' : 'Português'}
        </Button>
        <Button variant="outline" onClick={() => void signOut(auth)}>
          <LogOut /> {t('auth.signOut')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t('profile.credits')}</p>
    </div>
  );
}
