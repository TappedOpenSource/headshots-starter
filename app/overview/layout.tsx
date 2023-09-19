'use client';

import { useAuthContext } from '@/context/AuthProvider';
import Login from '../login/page';

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}
