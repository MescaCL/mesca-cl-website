import Link from 'next/link';
import { ArrowUpRight, PenLine } from 'lucide-react';
import { format } from 'date-fns';
import { SectionHeading } from '@/components/sections/section-heading';
import { PostTypeBadge } from '@/components/shared/post-type-badge';
import type { Post } from '@/types';

interface LatestWritingProps {
  posts: Post[];
}

export function LatestWriting({ posts }: LatestWritingProps) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border/70">
      <div className="container py-20 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Writing"
            title="Latest from the blog"
            description="Notes on building, learning, and the lessons nobody tells you about starting out."
          />
          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            All articles
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <PostTypeBadge type={post.post_type} />
                {post.published_at && (
                  <time
                    dateTime={post.published_at}
                    className="font-mono text-[11px] text-muted-foreground"
                  >
                    {format(new Date(post.published_at), 'd MMM yyyy')}
                  </time>
                )}
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight">
                <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-primary">
                  {post.title}
                </Link>
              </h3>

              <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt ?? 'Read the full article.'}
              </p>

              <Link
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Read article
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmptyWriting() {
  return (
    <section className="container py-20">
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
        <PenLine className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h2 className="mt-4 font-display text-xl font-semibold">Writing is on the way</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The first articles are being written now. Get in touch if you want to hear when they drop.
        </p>
      </div>
    </section>
  );
}