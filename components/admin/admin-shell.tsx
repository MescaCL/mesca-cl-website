'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  LayoutDashboard,
  Home,
  User,
  FolderKanban,
  FileText,
  Inbox,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

import { classNames } from '@/components/ui/utils';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/settings#hero', label: 'Edit Homepage', icon: Home },
  { href: '/admin/settings#profile-image', label: 'Profile & Photograph', icon: User },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/posts', label: 'Posts & Updates', icon: FileText },
  { href: '/admin/messages', label: 'Contact Messages', icon: Inbox },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/account', label: 'Account Security', icon: Shield },
];


export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState('');

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    const [path, targetHash] = href.split('#');
    if (targetHash) {
      return pathname === path && hash === `#${targetHash}`;
    }
    if (path === '/admin/settings') {
      return pathname === path && hash === '';
    }
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };


  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navContent = (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-border/70 px-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
          MC
        </span>
        <div className="flex flex-col leading-none">
          <span className="font-display text-sm font-semibold">Admin</span>
          <span className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Mesca CL
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground lg:hidden"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin navigation">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={classNames(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.href, item.exact)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border/70 p-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink size={16} />
          View website
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card lg:flex">
        {navContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-border/70 bg-card">
            {navContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground"
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>
          <span className="font-display text-sm font-semibold">Admin</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}