import { NextResponse } from 'next/server';
import { getLiveContent, IS_LOCAL } from '@/lib/data-live';
import { getContentPipeline } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (IS_LOCAL) {
      const content = await getLiveContent(50);
      if (content.length > 0) {
        return NextResponse.json({ content, source: 'live', count: content.length });
      }
    }
    const content = getContentPipeline();
    return NextResponse.json({ content, source: 'mock', count: content.length });
  } catch (err) {
    console.error('[api/content]', err);
    const content = getContentPipeline();
    return NextResponse.json({ content, source: 'mock', count: content.length });
  }
}
