import { getProfile, getSocialLinks } from '@/lib/data';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { FloatingContact } from '@/components/layout/floating-contact';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const socialLinks = await getSocialLinks(true);

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader profile={profile} socialLinks={socialLinks} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter profile={profile} socialLinks={socialLinks} />
      <FloatingContact profile={profile} />
    </div>
  );
}
