import Link from 'next/link';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Project } from '@/types';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
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

      <h2 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight">
        <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-primary">
          {project.title}
        </Link>
      </h2>

      <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {project.summary ?? project.description ?? 'Details coming soon.'}
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

      <div className="mt-5 flex items-center gap-4">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View project
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>

        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Open ${project.title} live site`}
          >
            <ExternalLink size={14} />
            Live
          </a>
        )}

        {project.repository_url && (
          <a
            href={project.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Open ${project.title} repository`}
          >
            <Github size={14} />
            Code
          </a>
        )}
      </div>
    </article>
  );
}