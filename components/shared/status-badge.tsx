import { classNames } from '@/components/ui/utils';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  idea: { label: 'Idea', className: 'bg-slate-500/12 text-slate-600 dark:text-slate-300' },
  in_progress: { label: 'In progress', className: 'bg-amber-500/12 text-amber-600 dark:text-amber-400' },
  prototype: { label: 'Prototype', className: 'bg-violet-500/12 text-violet-600 dark:text-violet-400' },
  live: { label: 'Live', className: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' },
  paused: { label: 'Paused', className: 'bg-orange-500/12 text-orange-600 dark:text-orange-400' },
  archived: { label: 'Archived', className: 'bg-zinc-500/12 text-zinc-600 dark:text-zinc-400' },
  draft: { label: 'Draft', className: 'bg-slate-500/12 text-slate-600 dark:text-slate-300' },
  published: { label: 'Published', className: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' },
  scheduled: { label: 'Scheduled', className: 'bg-sky-500/12 text-sky-600 dark:text-sky-400' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] ?? {
    label: status.replace(/_/g, ' '),
    className: 'bg-muted text-muted-foreground',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        style.className,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {style.label}
    </span>
  );
}