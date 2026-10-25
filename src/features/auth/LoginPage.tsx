import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ui/toast';
import { Logo } from '@/components/Logo';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-10">
      <Logo className="mb-2 size-14" />
      <h1 className="mb-1 text-3xl font-semibold">Smokership</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">{t('app.tagline')}</p>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('auth.signIn')}</CardTitle>
          <CardDescription>{t('auth.inviteOnly')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !email || !password}>
              {loading ? t('common.loading') : t('auth.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
