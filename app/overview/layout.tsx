'use client';

import { getCurrentUser } from '@/lib/auth';
import Login from '../login/page';

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getCurrentUser();

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}
