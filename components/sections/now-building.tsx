import Link from 'next/link';
import { ArrowRight, Radio } from 'lucide-react';
import { SectionHeading } from '@/components/sections/section-heading';
import { StatusBadge } from '@/components/shared/status-badge';
import type { NowItem } from '@/types';

interface NowBuildingProps {
  items: NowItem[];
}

export function NowBuilding({ items }: NowBuildingProps) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-border/70 bg-muted/25">
      <div className="container py-20 md:py-24">
        <SectionHeading
          eyebrow="Now"
          title="What I'm building right now"
          description="A live snapshot of my current focus, updated as things progress."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                  In progress
                </span>
                {item.status && <StatusBadge status={item.status} className="ml-auto" />}
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{item.title}</h3>

              {item.description && (
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {item.category && (
                  <span className="rounded-md bg-muted px-2 py-1 font-medium">{item.category}</span>
                )}
                {item.next_milestone && (
                  <span className="flex items-center gap-1.5">
                    <Radio size={12} className="text-primary" />
                    Next: {item.next_milestone}
                  </span>
                )}
                {item.link_url && (
                  <Link
                    href={item.link_url}
                    className="ml-auto inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Follow along
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}