import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { ProjectCard } from '@/components/shared/project-card';
import { getCategories } from '@/lib/data';
import { getProjects } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A portfolio of products, experiments and systems built by Mesca CL across technology, AI and entrepreneurship.',
};

export default async function ProjectsPage() {
  const projects = await getProjects({ publishedOnly: true });
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects & builds"
        description="Everything I've designed, built, and shipped — plus the things still taking shape."
      />

      <section className="container pb-20 md:pb-28">
        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Filter
            </span>
            {categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {category.name}
                <span className="ml-1.5 text-muted-foreground/60">
                  {projects.filter((p) => p.category === category.name).length}
                </span>
              </span>
            ))}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
            <h2 className="font-display text-xl font-semibold">No projects published yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Work is in progress and will be published here shortly. In the meantime, feel free to reach
              out directly.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}