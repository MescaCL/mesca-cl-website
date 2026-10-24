import type { Metadata } from 'next';
import { Milestone, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { getMilestones, getNowItems } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Journey',
  description:
    'The build-up of Mesca CL — from first lines of code to shipped products, AI experiments and entrepreneurial moves.',
};

export default async function JourneyPage() {
  const milestones = await getMilestones();
  const nowItems = await getNowItems();

  return (
    <>
      <PageHeader
        eyebrow="Journey"
        title="The road so far"
        description="Not a highlight reel — the actual sequence of things built, learned, and occasionally broken along the way."
      />

      <section className="container py-16 md:py-24">
        {milestones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h2 className="mt-4 font-display text-xl font-semibold">The timeline is being mapped</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Milestones will appear here as the journey progresses.
            </p>
          </div>
        ) : (
          <ol className="relative mx-auto max-w-3xl">
            <span
              aria-hidden="true"
              className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary/40 via-border to-transparent"
            />

            {milestones.map((milestone, index) => (
              <li key={milestone.id} className="relative flex gap-6 pb-12 last:pb-0">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-background font-mono text-xs font-semibold text-primary shadow-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 pt-1">
                  {milestone.milestone_date && (
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                      {milestone.milestone_date}
                    </p>
                  )}

                  <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
                    {milestone.title}
                  </h2>

                  {milestone.category && (
                    <span className="mt-2.5 inline-block rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {milestone.category}
                    </span>
                  )}

                  {milestone.description && (
                    <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                      {milestone.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {nowItems.length > 0 && (
        <section className="border-t border-border/70 bg-muted/25">
          <div className="container py-16 md:py-20">
            <h2 className="font-display text-2xl font-bold tracking-tight">Chapter in progress</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The next part of the story is being written right now.
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {nowItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
                >
                  <h3 className="font-display text-lg font-semibold tracking-tight">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  {item.next_milestone && (
                    <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Milestone size={13} className="text-primary" />
                      Next: {item.next_milestone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}