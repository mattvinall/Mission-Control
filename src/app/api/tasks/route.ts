import { NextResponse } from 'next/server';
import { getLiveTasks, IS_LOCAL } from '@/lib/data-live';
import { getAllTasks } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (IS_LOCAL) {
      const tasks = await getLiveTasks();
      if (tasks.length > 0) {
        return NextResponse.json({ tasks, source: 'live', count: tasks.length });
      }
    }
    // Fallback to mock
    const tasks = getAllTasks();
    return NextResponse.json({ tasks, source: 'mock', count: tasks.length });
  } catch (err) {
    console.error('[api/tasks]', err);
    const tasks = getAllTasks();
    return NextResponse.json({ tasks, source: 'mock', count: tasks.length });
  }
}
