import { NextResponse } from 'next/server';
import { getLiveMemory, IS_LOCAL } from '@/lib/data-live';
import { getMemoryEntries } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (IS_LOCAL) {
      const entries = await getLiveMemory(50);
      if (entries.length > 0) {
        return NextResponse.json({ entries, source: 'live', count: entries.length });
      }
    }
    const entries = getMemoryEntries();
    return NextResponse.json({ entries, source: 'mock', count: entries.length });
  } catch (err) {
    console.error('[api/memory]', err);
    const entries = getMemoryEntries();
    return NextResponse.json({ entries, source: 'mock', count: entries.length });
  }
}
