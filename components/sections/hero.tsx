import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SocialIcon } from '@/components/shared/social-icon';
import { classNames } from '@/components/ui/utils';
import type { Profile, SocialLink } from '@/types';

interface HeroProps {
  profile: Profile | null;
  socialLinks: SocialLink[];
  settings?: Record<string, string | null>;
}

export function Hero({ profile, socialLinks, settings }: HeroProps) {
  const get = (key: string): string | null => settings?.[key] ?? null;
  const headline = profile?.headline ?? 'Building the future, one project at a time.';
  const supporting =
    profile?.supporting_statement ??
    'Documenting my journey in technology, AI, and entrepreneurship — one build at a time.';
  const eyebrow = get('hero_eyebrow') ?? profile?.hero_eyebrow ?? 'Builder · Engineer · Founder';
  const primaryLabel =
    get('hero_primary_cta_label') ?? profile?.hero_primary_cta_label ?? 'View my work';
  const primaryUrl = get('hero_primary_cta_url') ?? profile?.hero_primary_cta_url ?? '/projects';
  const secondaryLabel =
    get('hero_secondary_cta_label') ?? profile?.hero_secondary_cta_label ?? 'Start a conversation';
  const secondaryUrl =
    get('hero_secondary_cta_url') ?? profile?.hero_secondary_cta_url ?? '/contact';
  const portrait = profile?.profile_image_url ?? null;
  const portraitAlt = profile?.profile_image_alt ?? profile?.full_name ?? 'Portrait';

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-18rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute bottom-[-16rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.3] dark:opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 85% 65% at 50% 0%, black 35%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 65% at 50% 0%, black 35%, transparent 75%)',
          }}
        />
      </div>

      <div className="container grid gap-12 py-20 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:py-28">
        <div className="flex flex-col items-start text-left">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3.5 py-1.5 text-xs font-medium text-primary">
              <Sparkles size={13} />
              {eyebrow}
            </span>
          </div>

          <h1 className="mt-7 max-w-3xl animate-slide-up font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {headline.split(' ').map((word, index) => (
              <span
                key={`${word}-${index}`}
                className={classNames(
                  'inline-block',
                  index >= Math.max(1, Math.floor(headline.split(' ').length / 2)) && 'text-gradient'
                )}
              >
                {word}
                {index < headline.split(' ').length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-xl animate-slide-up text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            {supporting}
          </p>

          <div className="mt-9 flex animate-slide-up flex-col gap-3 sm:flex-row">
            <Link
              href={primaryUrl}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
            >
              {primaryLabel}
              <ArrowRight size={16} />
            </Link>
            <Link
              href={secondaryUrl}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background/60 px-7 text-sm font-semibold text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
            >
              {secondaryLabel}
            </Link>
          </div>
          {socialLinks.length > 0 && (
            <div className="mt-12 flex animate-fade-in items-center gap-2.5">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-background/70 text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                  aria-label={link.label || link.platform}
                  title={link.label || link.platform}
                >
                  <SocialIcon platform={link.icon || link.platform} className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-in">
          <div className="relative aspect-[4/5] w-full">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2.25rem] border border-primary/20" />
            <div aria-hidden="true" className="absolute -inset-6 rounded-[2.75rem] border border-border/40" />
            <div aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
            <div aria-hidden="true" className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-fuchsia-500/15 blur-3xl" />

            <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-2xl shadow-primary/10">
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-fuchsia-500/10" />
              {portrait ? (
                <img src={portrait} alt={portraitAlt} className="relative h-full w-full object-cover object-top" />
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-muted">
                  <span className="font-display text-7xl font-bold text-primary/40">
                    {profile?.full_name
                      ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'MC'}
                  </span>
                </div>
              )}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            <span aria-hidden="true" className="absolute -left-2 top-1/3 h-12 w-[2px] rounded-full bg-gradient-to-b from-primary to-transparent" />
            <span aria-hidden="true" className="absolute -right-2 bottom-1/3 h-12 w-[2px] rounded-full bg-gradient-to-t from-fuchsia-500 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

