import { cn } from '@/lib/utils/cn';
import type { ReservationStatus } from '@/lib/app/models/reservation';

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
  CANCELLED_BY_CUSTOMER: 'bg-slate-100 text-slate-600',
  CANCELLED_BY_OWNER: 'bg-slate-100 text-slate-600',
  CHANGE_REQUESTED_BY_CUSTOMER: 'bg-blue-100 text-blue-700',
  CHANGE_REQUESTED_BY_OWNER: 'bg-violet-100 text-violet-700',
  COMPLETED: 'bg-emerald-50 text-emerald-600',
  NO_SHOW: 'bg-orange-100 text-orange-700',
  EXPIRED: 'bg-slate-100 text-slate-500',
};

type Props = {
  status: ReservationStatus;
  label: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
