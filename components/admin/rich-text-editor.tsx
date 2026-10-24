'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bold, Italic, Heading2, Heading3, List, Quote, Link as LinkIcon, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '@/components/admin/image-picker';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function insertHtmlAtCursor(html: string) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  range.insertNode(fragment);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  return true;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedError, setEmbedError] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    handleInput();
  }, [handleInput]);

  const handleBold = useCallback(() => execCommand('bold'), [execCommand]);
  const handleItalic = useCallback(() => execCommand('italic'), [execCommand]);
  const handleH2 = useCallback(() => execCommand('formatBlock', '<h2>'), [execCommand]);
  const handleH3 = useCallback(() => execCommand('formatBlock', '<h3>'), [execCommand]);
  const handleBulletList = useCallback(() => execCommand('insertUnorderedList'), [execCommand]);
  const handleQuote = useCallback(() => execCommand('formatBlock', '<blockquote>'), [execCommand]);
  const handleLink = useCallback(() => {
    const url = window.prompt('Enter URL');
    if (url) execCommand('createLink', url);
  }, [execCommand]);

  const handleInsertImage = useCallback((url: string) => {
    if (!url) return;
    const alt = window.prompt('Alt text (describe the image)') || '';
    const caption = window.prompt('Caption (optional)') || '';
    const html = `<figure class="my-6"><img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" class="w-full rounded-lg" loading="lazy" />${caption ? `<figcaption class="mt-2 text-center text-sm text-muted-foreground">${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
    if (!insertHtmlAtCursor(html)) {
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
      }
    }
    handleInput();
    setShowImagePicker(false);
  }, [handleInput]);

  const handleEmbed = useCallback(() => {
    const url = embedUrl.trim();
    if (!url) return;
    const embed = buildEmbedHtml(url);
    if (!embed) {
      setEmbedError('Unsupported or invalid URL. Supported: YouTube, TikTok, Instagram, Facebook, X (Twitter), Vimeo.');
      return;
    }
    const withFallback = embed.html + `<p class="my-2 text-xs text-muted-foreground"><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" class="text-primary underline">View original post on platform</a></p>`;
    if (!insertHtmlAtCursor(withFallback)) {
      if (editorRef.current) {
        editorRef.current.innerHTML += withFallback;
      }
    }
    handleInput();
    setShowEmbedDialog(false);
    setEmbedUrl('');
    setEmbedError('');
  }, [embedUrl, handleInput]);

  const toolbarButtons = [
    { icon: Bold, action: handleBold, label: 'Bold' },
    { icon: Italic, action: handleItalic, label: 'Italic' },
    { icon: Heading2, action: handleH2, label: 'Heading 2' },
    { icon: Heading3, action: handleH3, label: 'Heading 3' },
    { icon: List, action: handleBulletList, label: 'Bullet List' },
    { icon: Quote, action: handleQuote, label: 'Quote' },
    { icon: LinkIcon, action: handleLink, label: 'Link' },
  ];
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {toolbarButtons.map((btn) => (
          <Button key={btn.label} type="button" variant="ghost" size="sm" onClick={btn.action} aria-label={btn.label} className="h-8 w-8 p-0">
            <btn.icon className="h-4 w-4" />
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowImagePicker(true)} aria-label="Insert image" className="h-8 px-2 text-xs">
          <ImageIcon className="h-4 w-4 mr-1" /> Image
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowEmbedDialog(true)} aria-label="Embed video or social post" className="h-8 px-2 text-xs">
          <Film className="h-4 w-4 mr-1" /> Embed
        </Button>
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning className="min-h-[120px] p-3 text-sm outline-none" onInput={handleInput} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} data-placeholder={placeholder} />
      {!value && !isFocused && (
        <div className="pointer-events-none -mt-[120px] p-3 text-sm text-muted-foreground">{placeholder}</div>
      )}
      {showImagePicker && (
        <div className="border-t border-border p-3">
          <ImagePicker value="" onChange={handleInsertImage} label="Insert image" />
          <div className="mt-2 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowImagePicker(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {showEmbedDialog && (
        <div className="border-t border-border p-3 space-y-2">
          <label className="text-xs font-medium">Paste a public video/post URL</label>
          <input type="url" value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          {embedError && <p className="text-xs text-destructive">{embedError}</p>}
          <p className="text-xs text-muted-foreground">Supported: YouTube, TikTok, Instagram posts/Reels, Facebook videos/posts, X (Twitter), Vimeo.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setShowEmbedDialog(false); setEmbedUrl(''); setEmbedError(''); }}>Cancel</Button>
            <Button type="button" size="sm" onClick={handleEmbed}>Insert embed</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;


function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
interface EmbedResult { html: string }
function buildEmbedHtml(rawUrl: string): EmbedResult | null {
  let url: URL;
  try { url = new URL(rawUrl.trim()); } catch { return null; }
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
    let id = '';
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
    else if (url.pathname.startsWith('/watch')) id = url.searchParams.get('v') ?? '';
    else if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2] ?? '';
    else if (url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2] ?? '';
    if (!id) return null;
    return { html: responsiveIframe(`https://www.youtube.com/embed/${encodeURIComponent(id)}`, 'YouTube video') };
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const match = url.pathname.match(/\/(\d+)/);
    const id = match?.[1];
    if (!id) return null;
    return { html: responsiveIframe(`https://player.vimeo.com/video/${id}`, 'Vimeo video') };
  }
  if (host === 'tiktok.com' || host === 'www.tiktok.com' || host === 'vm.tiktok.com') {
    const m = url.pathname.match(/\/video\/(\d+)/);
    let id = m?.[1];
    if (!id && host === 'vm.tiktok.com') return fallbackLink(url.toString(), 'TikTok video');
    if (!id) return null;
    return { html: `<div class="my-6 aspect-video w-full overflow-hidden rounded-lg"><iframe src="https://www.tiktok.com/embed/v2/${id}" class="h-full w-full" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen loading="lazy" title="TikTok video"></iframe></div>` };
  }
  if (host === 'instagram.com' || host === 'www.instagram.com') {
    const m = url.pathname.match(/\/(p|reel|reels)\/([^/]+)/);
    const code = m?.[2];
    if (!code) return null;
    const kind = m?.[1] === 'reel' || m?.[1] === 'reels' ? 'reel' : 'p';
    return { html: `<div class="my-6 flex justify-center"><iframe src="https://www.instagram.com/${kind}/${code}/embed" class="w-full max-w-[540px] min-h-[400px] rounded-lg border-0" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy" title="Instagram post"></iframe></div>` };
  }
  if (host === 'facebook.com' || host === 'www.facebook.com' || host === 'fb.watch' || host === 'm.facebook.com') {
    if (url.pathname.includes('/posts/') || url.pathname.includes('/permalink/')) {
      return { html: `<div class="my-6 flex justify-center"><iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url.toString())}&width=500" class="w-full max-w-[500px] min-h-[300px] rounded-lg border-0" frameborder="0" scrolling="no" allowfullscreen loading="lazy" title="Facebook post"></iframe></div>` };
    }
    return { html: `<div class="my-6 aspect-video w-full overflow-hidden rounded-lg"><iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.toString())}&show_text=false&width=560" class="h-full w-full rounded-lg border-0" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen loading="lazy" title="Facebook video"></iframe></div>` };
  }
  if (host === 'twitter.com' || host === 'x.com' || host === 'www.twitter.com' || host === 'www.x.com') {
    return { html: `<blockquote class="twitter-tweet my-6" data-theme="dark"><a href="${escapeAttr(url.toString())}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>` };
  }
  return null;
}
function responsiveIframe(src: string, title: string): string {
  return `<div class="my-6 aspect-video w-full overflow-hidden rounded-lg"><iframe src="${src}" class="h-full w-full rounded-lg border-0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" title="${escapeAttr(title)}"></iframe></div>`;
}
function fallbackLink(url: string, label: string): EmbedResult {
  return { html: `<p class="my-4 text-sm"><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" class="text-primary underline">${escapeHtml(label)}</a> — view on original platform.</p>` };
}
