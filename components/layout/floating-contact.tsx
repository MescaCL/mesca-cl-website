'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { SocialIcon } from '@/components/shared/social-icon';
import { classNames } from '@/components/ui/utils';
import type { Profile } from '@/types';

interface FloatingContactProps {
  profile: Profile | null;
}

export function FloatingContact({ profile }: FloatingContactProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const callVisible = profile ? profile.call_button_visible === 1 : false;
  const whatsappVisible = profile ? profile.whatsapp_button_visible === 1 : false;

  useEffect(() => {
    if (!callVisible && !whatsappVisible) return;
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [callVisible, whatsappVisible]);

  if (!callVisible && !whatsappVisible) return null;

  const whatsappNumber = (profile?.whatsapp_number ?? '').replace(/[^\d]/g, '');
  const preset = profile?.whatsapp_preset_message ?? 'Hello Mesca CL!';
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(preset)}`
    : '#';

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-xl">
          {whatsappVisible && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                <SocialIcon platform="whatsapp" className="h-4 w-4" />
              </span>
              {profile?.whatsapp_button_label ?? 'Chat on WhatsApp'}
            </a>
          )}
          {callVisible && (
            <a
              href={`tel:${(profile?.phone_number ?? '').replace(/\s+/g, '')}`}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary">
                <Phone size={15} />
              </span>
              {profile?.call_button_label ?? 'Call Mesca'}
            </a>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close contact options' : 'Open contact options'}
        className={classNames(
          'grid h-13 w-13 place-items-center rounded-full bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300',
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        )}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}