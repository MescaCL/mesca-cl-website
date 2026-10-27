import Link from 'next/link';
import { ArrowRight, CalendarClock } from 'lucide-react';
import type { Profile } from '@/types';

interface CtaBandProps {
  profile: Profile | null;
  settings?: Record<string, string | null>;
}

export function CtaBand({ profile, settings }: CtaBandProps) {
  const get = (key: string): string | null => settings?.[key] ?? null;
  const eyebrow = get('hero_eyebrow') ?? profile?.hero_eyebrow ?? 'Open to conversations';
  const heading = get('hero_primary_cta_label') ?? profile?.hero_primary_cta_label ?? 'Have an idea worth building?';
  const secondaryLabel = get('hero_secondary_cta_label') ?? profile?.hero_secondary_cta_label ?? "Let's talk";
  const secondaryUrl = get('hero_secondary_cta_url') ?? profile?.hero_secondary_cta_url ?? '/contact';
  const email = get('contact_email') ?? profile?.email ?? null;
  const description =
    secondaryLabel && !secondaryUrl
      ? "I'm always up for collaborating on meaningful products, mentoring early builders, or simply talking about what it takes to ship."
      : null;
  const buttonLabel = secondaryLabel;
  const buttonUrl = secondaryUrl;

  return (
    <section className="container pb-20 pt-4 md:pb-28">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-14 text-center md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-primary backdrop-blur">
            <CalendarClock size={13} /> {eyebrow}
          </span>

          <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {heading}
          </h2>

          {description && (
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-8 flex justify-center gap-3 sm:flex-row">
            <Link
              href={buttonUrl}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              {buttonLabel}
              <ArrowRight size={16} />
            </Link>
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background/70 px-7 text-sm font-semibold text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
              >
                {email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}