'use client';

import { Share2, Mail, Link as LinkIcon, Copy } from 'lucide-react';
import { useCallback } from 'react';

interface SocialShareProps {
  title: string;
  url: string;
}

export function SocialShare({ title, url }: SocialShareProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, [url]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Share
      </span>
      {[
        { key: 'twitter', label: 'X', icon: <Share2 size={14} />, href: shareUrls.twitter },
        { key: 'linkedin', label: 'LinkedIn', icon: <Share2 size={14} />, href: shareUrls.linkedin },
        { key: 'facebook', label: 'Facebook', icon: <Share2 size={14} />, href: shareUrls.facebook },
        { key: 'email', label: 'Email', icon: <Mail size={14} />, href: shareUrls.email },
        { key: 'copy', label: 'Copy link', icon: <Copy size={14} />, onClick: copyToClipboard },
      ].map((item) => (
        <a
          key={item.key}
          href={item.href}
          target={item.key === 'copy' ? '_self' : '_blank'}
          rel={item.key === 'copy' ? undefined : 'noopener noreferrer'}
          onClick={item.key === 'copy' ? (event) => { event.preventDefault(); item.onClick?.(); } : undefined}
          className="h-8 w-8 rounded-md border border-border/80 bg-background flex items-center justify-center text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
          aria-label={`Share on ${item.label}`}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}
