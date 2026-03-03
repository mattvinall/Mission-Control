import { NextResponse } from 'next/server';
import { getLiveDashboardSummary, IS_LOCAL } from '@/lib/data-live';
import { getDashboardData, getStatusCounts, getPriorityCounts, getCompletionRate } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mockData = getDashboardData();

    if (IS_LOCAL) {
      const liveSummary = await getLiveDashboardSummary();

      return NextResponse.json({
        // Base dashboard shape from mock (projects, bhag, meta)
        ...mockData,
        // Override with live counts
        live: {
          taskCounts: liveSummary.taskCounts,
          agentRunsToday: liveSummary.agentRunsToday,
          costToday: liveSummary.costToday,
          contentByStage: liveSummary.contentByStage,
          memoryCount: liveSummary.memoryCount,
          activeAgents: liveSummary.activeAgents,
        },
        meta: {
          ...mockData.meta,
          lastUpdated: liveSummary.lastUpdated,
          agentStatus: liveSummary.activeAgents > 0 ? 'active' : 'idle',
        },
        // Fallback counts from mock
        statusCounts: getStatusCounts(),
        priorityCounts: getPriorityCounts(),
        completionRate: getCompletionRate(),
        source: 'live',
      });
    }

    // Vercel / demo mode - pure mock
    return NextResponse.json({
      ...mockData,
      statusCounts: getStatusCounts(),
      priorityCounts: getPriorityCounts(),
      completionRate: getCompletionRate(),
      source: 'mock',
    });
  } catch (err) {
    console.error('[api/dashboard]', err);
    const mockData = getDashboardData();
    return NextResponse.json({
      ...mockData,
      statusCounts: getStatusCounts(),
      priorityCounts: getPriorityCounts(),
      completionRate: getCompletionRate(),
      source: 'mock',
    });
  }
}
