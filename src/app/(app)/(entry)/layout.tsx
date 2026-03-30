import type { ReactNode } from 'react';

import { EntryFlowShell } from '@/components/app/entry-flow-shell';

export default function EntryLayout({ children }: { children: ReactNode }) {
  return <EntryFlowShell>{children}</EntryFlowShell>;
}
