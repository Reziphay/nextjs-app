import type { ReactNode } from 'react';

import { AppProviders } from '@/components/app/providers';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
