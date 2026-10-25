import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';

const KEY = 'smokership.adult';

function confirmed(): boolean {
  try {
    return localStorage.getItem(KEY) === 'yes';
  } catch {
    return false;
  }
}

export function AgeGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [ok, setOk] = React.useState(confirmed);
  const [refused, setRefused] = React.useState(false);

  if (ok) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo className="size-16" />
      <h1 className="text-3xl font-semibold">Smokership</h1>
      {refused ? (
        <p className="max-w-xs text-muted-foreground">{t('age.refused')}</p>
      ) : (
        <>
          <p className="max-w-xs text-muted-foreground">{t('age.question')}</p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                try {
                  localStorage.setItem(KEY, 'yes');
                } catch {
                  /* private mode: ask again next visit */
                }
                setOk(true);
              }}
            >
              {t('age.yes')}
            </Button>
            <Button variant="outline" onClick={() => setRefused(true)}>
              {t('age.no')}
            </Button>
          </div>
          <p className="max-w-xs text-xs text-muted-foreground">{t('age.warning')}</p>
        </>
      )}
    </div>
  );
}
