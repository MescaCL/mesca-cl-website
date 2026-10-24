import type { Metadata } from 'next';
import { Mail, MapPin, Phone, Sparkles, Target, Zap } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SocialIcon } from '@/components/shared/social-icon';
import { getProfile, getSocialLinks } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Mesca CL (Chineke Olisadubem Louis) — builder, AI tinkerer and entrepreneur documenting the journey in public.',
};

export default async function AboutPage() {
  const profile = await getProfile();
  const socialLinks = await getSocialLinks(true);

  const fullBio = (profile?.full_bio ?? profile?.short_bio ?? '').split('\n').filter(Boolean);
  const principles = [
    {
      icon: Zap,
      title: 'Ship, then polish',
      body: 'A shipped rough draft beats a perfect plan. I build to learn, then refine what people actually use.',
    },
    {
      icon: Target,
      title: 'Build in public',
      body: 'Documenting progress keeps me honest and turns my journey into something genuinely useful to others.',
    },
    {
      icon: Sparkles,
      title: 'Make it feel premium',
      body: 'Details are the difference between a tool people tolerate and one they recommend to a friend.',
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={profile?.full_name ?? 'Chineke Olisadubem Louis'}
        description={
          profile?.headline ??
          'Builder, AI tinkerer and entrepreneur — turning ideas into working software, in public.'
        }
      />

      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-bold tracking-tight">My story</h2>
            <div className="mt-6 space-y-5 text-[15px] leading-[1.75] text-muted-foreground">
              {fullBio.length > 0 ? (
                fullBio.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <p>
                  I&apos;m Chineke Olisadubem Louis, the founder behind Mesca CL. I build software,
                  explore what AI can genuinely do, and write about the process along the way.
                </p>
              )}
            </div>

            <h2 className="mt-14 font-display text-2xl font-bold tracking-tight">How I work</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {principles.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <principle.icon size={17} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {principle.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em]">
                  Details
                </h2>
                <ul className="mt-5 space-y-4 text-sm">
                  {profile?.location && (
                    <li className="flex items-start gap-3">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{profile.location}</span>
                    </li>
                  )}
                  {profile?.email && (
                    <li className="flex items-start gap-3">
                      <Mail size={15} className="mt-0.5 shrink-0 text-primary" />
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {profile.email}
                      </a>
                    </li>
                  )}
                  {profile?.phone_number && (
                    <li className="flex items-start gap-3">
                      <Phone size={15} className="mt-0.5 shrink-0 text-primary" />
                      <a
                        href={`tel:${profile.phone_number.replace(/\s+/g, '')}`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {profile.phone_number}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {socialLinks.length > 0 && (
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em]">
                    Find me online
                  </h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
                      >
                        <SocialIcon platform={link.icon || link.platform} className="h-3.5 w-3.5" />
                        {link.label || link.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
