import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ContactForm } from '@/components/contact/contact-form';
import { SocialIcon } from '@/components/shared/social-icon';
import { getProfile, getSocialLinks } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Mesca CL about collaborations, mentorship, hiring, or just to say hello.',
};

export default async function ContactPage() {
  const profile = await getProfile();
  const socialLinks = await getSocialLinks(true);

  const whatsappNumber = (profile?.whatsapp_number ?? '').replace(/[^\d]/g, '');

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Reach Out to ME"
        description="If it's for Collaborations, mentorship, freelance work, or just a conversation about what we can or will do. Be it ANYTHING — my inbox is open."
      />

      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-semibold tracking-tight">Send a message</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fields marked with an asterisk are required. I usually reply within a few days.
              </p>
              <div className="mt-7">
                <ContactForm />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="space-y-5">
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em]">
                  Direct
                </h2>
                <ul className="mt-5 space-y-4 text-sm">
                  {profile?.email && (
                    <li className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Mail size={15} />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${profile.email}`}
                          className="font-medium transition-colors hover:text-primary"
                        >
                          {profile.email}
                        </a>
                      </div>
                    </li>
                  )}


                  {profile?.phone_number && (
                    <li className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Phone size={15} />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${profile.phone_number.replace(/\s+/g, '')}`}
                          className="font-medium transition-colors hover:text-primary"
                        >
                          {profile.phone_number}
                        </a>
                      </div>
                    </li>
                  )}

                  {whatsappNumber && (
                    <li className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#25D366]/12 text-[#25D366]">
                        <MessageCircle size={15} />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">WhatsApp</p>
                        <a
                          href={`https://wa.me/${whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium transition-colors hover:text-primary"
                        >
                          {profile?.whatsapp_number}
                        </a>
                      </div>
                    </li>
                  )}

                  {profile?.location && (
                    <li className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <MapPin size={15} />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">Based in</p>
                        <p className="font-medium">{profile.location}</p>
                      </div>
                    </li>
                  )}

                  <li className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Clock size={15} />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Response time</p>
                      <p className="font-medium">Usually within 2–3 days</p>
                    </div>
                  </li>
                </ul>
              </div>

              {socialLinks.length > 0 && (
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em]">
                    Socials
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