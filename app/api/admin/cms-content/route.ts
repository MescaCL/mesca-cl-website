import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin, requireCsrf } from '@/lib/api-guard';
import {
  getCtaBandConfig,
  setCtaBandConfig,
  getFooterExploreLinks,
  setFooterExploreLinks,
  getPageMetadata,
  setPageMetadata,
  getContactResponseTime,
  setContactResponseTime,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

const ctaBandSchema = z.object({
  heading: z.string().min(1, 'Heading is required').max(200),
  description: z.string().min(1, 'Description is required').max(500),
});

const footerLinksSchema = z.object({
  links: z.array(
    z.object({
      href: z.string().min(1, 'URL is required').max(200),
      label: z.string().min(1, 'Label is required').max(80),
    })
  ),
});

const pageMetadataSchema = z.object({
  eyebrow: z.string().min(1, 'Eyebrow is required').max(100).optional(),
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().min(1, 'Description is required').max(500).optional(),
});

const contactResponseTimeSchema = z.object({
  time: z.string().min(1, 'Response time is required').max(200),
});

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  const page = searchParams.get('page');

  try {
    if (section === 'cta-band') {
      const config = await getCtaBandConfig();
      return NextResponse.json({ data: config });
    }

    if (section === 'footer-links') {
      const links = await getFooterExploreLinks();
      return NextResponse.json({ data: { links } });
    }

    if (section === 'page-metadata' && page) {
      const metadata = await getPageMetadata(page as 'blog' | 'projects' | 'contact' | 'journey');
      return NextResponse.json({ data: metadata });
    }

    if (section === 'contact-response-time') {
      const time = await getContactResponseTime();
      return NextResponse.json({ data: { time } });
    }

    return NextResponse.json({ message: 'Invalid section.' }, { status: 400 });
  } catch (error) {
    console.error('[cms-content] GET failed', error);
    return NextResponse.json({ message: 'Could not load CMS content.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { section, ...payload } = body;

  try {
    if (section === 'cta-band') {
      const parsed = ctaBandSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ message: 'Invalid CTA band data.' }, { status: 422 });
      }
      await setCtaBandConfig(parsed.data);
      return NextResponse.json({ message: 'CTA band updated.' });
    }

    if (section === 'footer-links') {
      const parsed = footerLinksSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ message: 'Invalid footer links data.' }, { status: 422 });
      }
      await setFooterExploreLinks(parsed.data.links);
      return NextResponse.json({ message: 'Footer links updated.' });
    }

    if (section === 'page-metadata' && payload.page) {
      const parsed = pageMetadataSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ message: 'Invalid page metadata.' }, { status: 422 });
      }
      await setPageMetadata(
        payload.page as 'blog' | 'projects' | 'contact' | 'journey',
        { eyebrow: parsed.data.eyebrow, title: parsed.data.title, description: parsed.data.description }
      );
      return NextResponse.json({ message: 'Page metadata updated.' });
    }

    if (section === 'contact-response-time') {
      const parsed = contactResponseTimeSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ message: 'Invalid response time.' }, { status: 422 });
      }
      await setContactResponseTime(parsed.data.time);
      return NextResponse.json({ message: 'Contact response time updated.' });
    }

    return NextResponse.json({ message: 'Invalid section.' }, { status: 400 });
  } catch (error) {
    console.error('[cms-content] POST failed', error);
    return NextResponse.json({ message: 'Could not update CMS content.' }, { status: 500 });
  }
}