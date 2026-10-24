import Link from 'next/link';
import { ArrowLeft, Compass, Home, Mail } from 'lucide-react';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 50% 60% at 50% 40%, hsl(var(--primary) / 0.12), transparent 70%)',
        }}
      />

      <div className="max-w-lg text-center">
        <p className="font-display text-7xl font-bold tracking-tight text-gradient sm:text-8xl">
          404
        </p>

        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          This page took a detour
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The page you are looking for does not exist, was moved, or has not been built yet.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Home size={15} />
            Back home
          </Link>
          <Link
            href="/projects"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
          >
            <Compass size={15} />
            Browse projects
          </Link>
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail size={14} />
          Think something is broken?{' '}
          <Link href="/contact" className="font-medium text-primary hover:underline">
            Let me know
          </Link>
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={13} />
          Return to the homepage
        </Link>
      </div>
    </div>
  );
}
