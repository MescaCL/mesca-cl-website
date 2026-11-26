import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock } from 'lucide-react';
import { getCtaBandConfig } from '@/lib/data';
import type { Profile } from '@/types';

interface CtaBandProps {
  profile: Profile | null;
}

export function CtaBand({ profile }: CtaBandProps) {
  const [ctaBand, setCtaBand] = useState({
    heading: 'Have an idea worth building?',
    description: 'I&apos;m always up for collaborating on meaningful products, mentoring early builders, or simply talking about what it takes to ship.',
  });

  useEffect(() => {
    (async () => {
      const config = await getCtaBandConfig();
      setCtaBand({
        heading: config.heading ?? 'Have an idea worth building?',
        description: config.description ?? 'I&apos;m always up for collaborating on meaningful products, mentoring early builders, or simply talking about what it takes to ship.',
      });
    })();
  }, []);

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
            <CalendarClock size={13} />{ctaBand.heading}
          </span>

          <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {ctaBand.heading}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {ctaBand.description}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Let&apos;s talk
              <ArrowRight size={16} />
            </Link>
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background/70 px-7 text-sm font-semibold text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
              >
                {profile.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}