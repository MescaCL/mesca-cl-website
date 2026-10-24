import { classNames } from '@/components/ui/utils';

const POST_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  article: { label: 'Article', className: 'bg-primary/10 text-primary' },
  daily_gist: { label: 'Daily gist', className: 'bg-amber-500/12 text-amber-600 dark:text-amber-400' },
  weekly_gist: { label: 'Weekly gist', className: 'bg-sky-500/12 text-sky-600 dark:text-sky-400' },
  monthly_recap: { label: 'Monthly recap', className: 'bg-violet-500/12 text-violet-600 dark:text-violet-400' },
};

export function PostTypeBadge({ type, className }: { type: string; className?: string }) {
  const style = POST_TYPE_LABELS[type] ?? {
    label: type.replace(/_/g, ' '),
    className: 'bg-muted text-muted-foreground',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}