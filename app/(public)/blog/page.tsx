import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, PenLine } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/page-header';
import { PostTypeBadge } from '@/components/shared/post-type-badge';
import { getPosts } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Articles, gists and field notes on software, AI, entrepreneurship and building in public by Mesca CL.',
};

export default async function BlogPage() {
  const posts = await getPosts({ publishedOnly: true });

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="Blog & field notes"
        description="Long-form articles, quick gists, and honest notes from the build. New posts when there is something worth saying."
      />

      <section className="container pb-20 md:pb-28">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
            <PenLine className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h2 className="mt-4 font-display text-xl font-semibold">No posts published yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              The first articles are being written now. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
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
                  {post.reading_time ? (
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground/70">
                      {post.reading_time} min
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight">
                  <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-primary">
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt ?? 'Read the full article.'}
                </p>

                {post.tags && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}

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
        )}
      </section>
    </>
  );
}