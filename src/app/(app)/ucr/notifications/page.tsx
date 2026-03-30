'use client';

import { useT } from '@/lib/app/i18n/context';
import { AppEmptyState } from '@/components/app/empty-state';

export default function UcrNotificationsPage() {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <h1 className="text-2xl font-bold text-[var(--app-ink)] mb-8">{t.notificationsTitle}</h1>
      <AppEmptyState
        icon="🔔"
        title={t.notificationsEmpty}
        description={t.notificationsComingSoon}
      />
    </div>
  );
}
