import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/page-header';
import { PostTypeBadge } from '@/components/shared/post-type-badge';
import { getCategories, getPosts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.category);
  if (!category) {
    return { title: 'Category not found' };
  }
  return {
    title: `Category: ${category.name}`,
    description: `Articles in the ${category.name} category.`,
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.category);
  if (!category) notFound();

  const posts = await getPosts({ publishedOnly: true, category: category.name });

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title={category.name}
        description={`Articles in the ${category.name} category.`}
      />

      <section className="container pb-20 md:pb-28">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
            <h2 className="mt-4 font-display text-xl font-semibold">No posts in this category yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Check back soon for new articles in {category.name}.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-medium text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
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
      </section>
    </>
  );
}
