import Link from 'next/link';
import { ArrowUpRight, FolderGit2 } from 'lucide-react';
import { SectionHeading } from '@/components/sections/section-heading';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Project } from '@/types';

interface FeaturedWorkProps {
  projects: Project[];
}

export function FeaturedWork({ projects }: FeaturedWorkProps) {
  if (projects.length === 0) {
    return (
      <section className="container py-20">
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <FolderGit2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="mt-4 font-display text-xl font-semibold">Projects coming soon</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            New work is being published. Check back shortly or get in touch to hear about it first.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-20 md:py-24">
      <SectionHeading
        eyebrow="Featured work"
        title="Projects I'm proud of"
        description="A selection of things I've designed, built, and shipped — from idea to production."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            <div className="flex items-start justify-between gap-3">
              <StatusBadge status={project.status} />
              {project.category && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {project.category}
                </span>
              )}
            </div>

            <h3 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight">
              {project.title}
            </h3>

            <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {project.summary ?? project.description ?? 'A project in the works.'}
            </p>

            {project.technologies && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.technologies
                  .split(',')
                  .map((tech) => tech.trim())
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-border/80 bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
              </div>
            )}

            <Link
              href={`/projects/${project.slug}`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View project
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/projects"
          className="group inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
        >
          All projects
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </section>
  );
}