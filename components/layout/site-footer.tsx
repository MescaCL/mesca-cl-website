import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import { SocialIcon } from '@/components/shared/social-icon';
import type { Profile, SocialLink } from '@/types';

interface SiteFooterProps {
  profile: Profile | null;
  socialLinks: SocialLink[];
}

export function SiteFooter({ profile, socialLinks }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const brand = profile?.brand_name ?? 'Mesca CL';

  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
                MC
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">{brand}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {profile?.short_bio ??
                'Building in technology, AI and entrepreneurship — and documenting the journey publicly.'}
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
                    aria-label={link.label || link.platform}
                    title={link.label || link.platform}
                  >
                    <SocialIcon platform={link.icon || link.platform} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: '/projects', label: 'Projects' },
                { href: '/journey', label: 'Journey' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
              Get in touch
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {profile?.email && (
                <li>
                  <a
                    href={`mailto:${profile.email}`}
                    className="group flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail size={15} className="text-muted-foreground/70 group-hover:text-primary" />
                    {profile.email}
                  </a>
                </li>
              )}
              {profile?.phone_number && (
                <li>
                  <a
                    href={`tel:${profile.phone_number.replace(/\s+/g, '')}`}
                    className="group flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Phone size={15} className="text-muted-foreground/70 group-hover:text-primary" />
                    {profile.phone_number}
                  </a>
                </li>
              )}
              {profile?.location && (
                <li className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin size={15} className="text-muted-foreground/70" />
                  {profile.location}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] tracking-wide">
            Crafted in Enugu, Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}