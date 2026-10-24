import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/sections/section-heading';
import type { JourneyMilestone } from '@/types';

interface JourneyPreviewProps {
  milestones: JourneyMilestone[];
}

export function JourneyPreview({ milestones }: JourneyPreviewProps) {
  if (milestones.length === 0) return null;

  const preview = milestones.slice(0, 4);

  return (
    <section className="container py-20 md:py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Journey"
          title="The path so far"
          description="Every project, every setback, every leap forward — documented in public."
        />
        <Link
          href="/journey"
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Full journey
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>

      <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {preview.map((milestone, index) => (
          <li key={milestone.id} className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/8 font-mono text-xs font-semibold text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              {index < preview.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent sm:block"
                />
              )}
            </div>

            {milestone.milestone_date && (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {milestone.milestone_date}
              </p>
            )}

            <h3 className="mt-1.5 font-display text-base font-semibold leading-snug tracking-tight">
              {milestone.title}
            </h3>

            {milestone.description && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {milestone.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}