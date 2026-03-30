type Props = {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AppEmptyState({ icon = '📭', title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-base font-semibold text-[var(--app-ink)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--app-ink-muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
