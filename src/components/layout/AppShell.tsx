import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Archive, MessagesSquare, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

const links = [
  { to: '/', icon: Compass, key: 'nav.discover', end: true },
  { to: '/humidor', icon: Archive, key: 'nav.humidor' },
  { to: '/feed', icon: MessagesSquare, key: 'nav.feed' },
  { to: '/profile', icon: UserRound, key: 'nav.profile' },
];

export function AppShell() {
  const { t, i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language.startsWith('pt') ? 'en' : 'pt-BR');

  return (
    <div className="relative flex min-h-dvh flex-col md:flex-row">
      <div className="pointer-events-none fixed left-[-15%] top-[-15%] h-[45%] w-[55%] rounded-full bg-secondary/15 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] h-[45%] w-[50%] rounded-full bg-primary/10 blur-[140px]" />

      <aside className="z-20 hidden w-60 shrink-0 border-r bg-card/40 backdrop-blur-2xl md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 px-5 font-display text-xl font-semibold">
          <Logo />
          Smokership
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <l.icon className="size-4" />
              {t(l.key)}
            </NavLink>
          ))}
        </nav>
        <button className="p-5 text-left text-xs text-muted-foreground hover:text-foreground" onClick={toggleLang}>
          {i18n.language.startsWith('pt') ? 'Switch to English' : 'Mudar para Português'}
        </button>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/70 px-4 pb-2 pt-safe backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <Logo className="size-6" />
          Smokership
        </div>
        <button className="text-xs text-muted-foreground" onClick={toggleLang}>
          {i18n.language.startsWith('pt') ? 'EN' : 'PT'}
        </button>
      </header>

      <main className="relative z-10 flex-1 overflow-x-hidden pb-24 md:pb-8">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/80 pb-safe backdrop-blur-xl md:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              cn('flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')
            }
          >
            <l.icon className="size-5" />
            {t(l.key)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
