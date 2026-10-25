import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AgeGate } from '@/components/AgeGate';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { DiscoverPage } from '@/features/discover/DiscoverPage';
import { CigarPage } from '@/features/cigar/CigarPage';
import { HumidorPage } from '@/features/collection/HumidorPage';
import { FeedPage } from '@/features/feed/FeedPage';
import { ProfilePage } from '@/features/profile/ProfilePage';

export default function App() {
  return (
    <AgeGate>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DiscoverPage />} />
          <Route path="cigar/:id" element={<CigarPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="humidor" element={<HumidorPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AgeGate>
  );
}
