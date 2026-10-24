import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { getProjectBySlug, getProjects } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) {
    return { title: 'Project not found' };
  }

  return {
    title: project.seo_title ?? project.title,
    description: project.seo_description ?? project.summary ?? undefined,
    openGraph: {
      title: project.seo_title ?? project.title,
      description: project.seo_description ?? project.summary ?? undefined,
      type: 'article',
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const related = (await getProjects({ publishedOnly: true, category: project.category ?? undefined }))
    .filter((p) => p.id !== project.id)
    .slice(0, 3);

  const technologies = (project.technologies ?? '')
    .split(',')
    .map((tech) => tech.trim())
    .filter(Boolean);

  return (
    <>
      <article className="container py-12 md:py-16">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} />
          All projects
        </Link>

        <header className="mt-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            {project.category && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {project.category}
              </span>
            )}
          </div>

          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {project.title}
          </h1>

          {project.summary && (
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {project.summary}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5"
              >
                <ExternalLink size={15} />
                Visit live site
              </a>
            )}
            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
              >
                <Github size={15} />
                View source
              </a>
            )}
          </div>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {project.description ? (
              <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground">
                {project.description.split('\n').filter(Boolean).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Detailed notes for this project are still being written.
              </p>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              {project.start_date && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <Calendar size={13} />
                    Started
                  </p>
                  <p className="mt-1.5 text-sm font-medium">{project.start_date}</p>
                </div>
              )}

              {project.last_updated && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <Calendar size={13} />
                    Last updated
                  </p>
                  <p className="mt-1.5 text-sm font-medium">{project.last_updated}</p>
                </div>
              )}

              {technologies.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <Tag size={13} />
                    Stack
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-border/80 bg-muted/50 px-2 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border/70 bg-muted/25">
          <div className="container py-16 md:py-20">
            <h2 className="font-display text-2xl font-bold tracking-tight">Related projects</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/projects/${item.slug}`}
                  className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <StatusBadge status={item.status} />
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
