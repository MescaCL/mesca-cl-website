import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/page-header';
import { PostTypeBadge } from '@/components/shared/post-type-badge';
import { getPosts } from '@/lib/data/content';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search articles, gists, and notes on Mesca CL.',
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q ?? '';
  const results = query.trim() ? await getPosts({ search: query, publishedOnly: true }) : [];

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="Search"
        description="Find articles, gists, and notes across the site."
      />

      <section className="container pb-20 md:pb-28">
        <div className="max-w-2xl mx-auto">
          <form method="GET" action="/search" className="relative mb-10">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search articles, gists, notes…"
              className="w-full h-11 rounded-xl border border-input bg-background px-4 pl-10 pr-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </form>

          {results.length === 0 && query.trim() && (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
              <p className="text-sm text-muted-foreground">No results for “{query}”</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="mb-6 text-sm font-medium text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                  >
                    {post.cover_image_url && (
                      <Link href={`/blog/${post.slug}`} className="block aspect-video overflow-hidden bg-muted">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                    )}
                    <div className="flex flex-1 flex-col p-6">
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
                    </Link>
                    </div>

                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
