import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { PostTypeBadge } from '@/components/shared/post-type-badge';
import { ContentRenderer } from '@/components/public/content-renderer';
import { getPostBySlug, getPosts } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: 'Post not found' };
  }

  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const related = (await getPosts({ publishedOnly: true, category: post.category ?? undefined }))
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const tags = (post.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <>
      <article className="container max-w-3xl py-12 md:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} />
          All articles
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <PostTypeBadge type={post.post_type} />
            {post.category && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {post.category}
              </span>
            )}
          </div>

          <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {post.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {post.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} />
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), 'd MMMM yyyy')}
                </time>
              </span>
            )}
            {post.reading_time ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />
                {post.reading_time} min read
              </span>
            ) : null}
          </div>
        </header>

        <div className="mt-12 space-y-5 border-t border-border/70 pt-10">
          <ContentRenderer content={post.content} />
        </div>

        {tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border/70 pt-8">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Tags
            </span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border/80 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-border/70 bg-muted/25">
          <div className="container max-w-5xl py-16 md:py-20">
            <h2 className="font-display text-2xl font-bold tracking-tight">Keep reading</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <PostTypeBadge type={item.post_type} />
                  <h3 className="mt-4 font-display text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
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
