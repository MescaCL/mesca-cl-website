import { Hero } from '@/components/sections/hero';
import { FeaturedWork } from '@/components/sections/featured-work';
import { NowBuilding } from '@/components/sections/now-building';
import { Stats } from '@/components/sections/stats';
import { JourneyPreview } from '@/components/sections/journey-preview';
import { LatestWriting } from '@/components/sections/latest-writing';
import { CtaBand } from '@/components/sections/cta-band';
import { getProfile, getSocialLinks } from '@/lib/data';
import { getSiteSettingsMap } from '@/lib/data';
import { getProjects, getPosts, getMilestones, getNowItems } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const profile = await getProfile();
  const socialLinks = await getSocialLinks(true);
  const settings = await getSiteSettingsMap();
  const projects = await getProjects({ publishedOnly: true });
  const featuredProjects = await getProjects({ publishedOnly: true, featuredOnly: true });
  const posts = await getPosts({ publishedOnly: true, limit: 3 });
  const milestones = await getMilestones();
  const nowItems = await getNowItems();

  const yearsActive = Math.max(
    1,
    new Date().getFullYear() - (profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear() - 1)
  );

  return (
    <>
      <Hero profile={profile} socialLinks={socialLinks} settings={settings} />
      <Stats
        projects={projects.length}
        posts={(await getPosts({ publishedOnly: true })).length}
        milestones={milestones.length}
        yearsActive={yearsActive}
      />
      <FeaturedWork
        projects={featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 6)}
      />
      <NowBuilding items={nowItems} />
      <JourneyPreview milestones={milestones} />
      <LatestWriting posts={posts} />
      <CtaBand profile={profile} settings={settings} />
    </>
  );
}