import { NextResponse } from 'next/server';
import { getLiveAgentStatus, getLiveAgentRuns, IS_LOCAL } from '@/lib/data-live';
import { getAgents, getAgentRuns } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (IS_LOCAL) {
      const [agents, runs] = await Promise.all([
        getLiveAgentStatus(),
        getLiveAgentRuns(20),
      ]);

      if (agents.length > 0 || runs.length > 0) {
        return NextResponse.json({
          agents: agents.length > 0 ? agents : getAgents(),
          runs: runs.length > 0 ? runs : getAgentRuns(10),
          source: 'live',
        });
      }
    }
    // Fallback to mock
    return NextResponse.json({
      agents: getAgents(),
      runs: getAgentRuns(10),
      source: 'mock',
    });
  } catch (err) {
    console.error('[api/agents]', err);
    return NextResponse.json({
      agents: getAgents(),
      runs: getAgentRuns(10),
      source: 'mock',
    });
  }
}
