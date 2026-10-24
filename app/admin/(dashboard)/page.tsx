import { Metadata } from 'next';
import Link from 'next/link';
import { LayoutDashboard, FolderKanban, FileText, Settings, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Overview' };

const QUICK_LINKS = [
  { href: '/admin/settings', label: 'Profile & settings', desc: 'Upload your portrait, edit bio, social links', icon: Settings },
  { href: '/admin/projects', label: 'Projects', desc: 'Manage your project portfolio', icon: FolderKanban },
  { href: '/admin/posts', label: 'Posts', desc: 'Manage blog posts and content', icon: FileText },
];

export default async function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Mesca CL website content from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-border/80 bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <link.icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{link.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{link.desc}</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Quick start</h2>
        <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>1. Go to <strong>Profile &amp; settings</strong> to upload your portrait photograph.</li>
          <li>2. Add your projects under <strong>Projects</strong>.</li>
          <li>3. Write your first post under <strong>Posts</strong>.</li>
          <li>4. Review messages under <strong>Messages</strong>.</li>
        </ol>
      </div>
    </div>
  );
}
