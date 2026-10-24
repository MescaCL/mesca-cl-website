'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app] unhandled error', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle size={26} />
        </span>

        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          An unexpected error occurred while loading this page. Trying again usually fixes it.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-muted-foreground/70">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5"
          >
            <RotateCcw size={15} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
          >
            <Home size={15} />
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
