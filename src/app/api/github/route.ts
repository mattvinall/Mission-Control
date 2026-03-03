import { NextResponse } from 'next/server';
import { getLiveGitHubActivity } from '@/lib/data-live';

export const dynamic = 'force-dynamic';

// Mock fallback for when GitHub is unreachable
function getMockGitHubActivity() {
  const now = new Date().toISOString();
  return {
    pullRequests: [
      {
        number: 42,
        title: 'feat: HubSpot CRM integration',
        state: 'open',
        url: 'https://github.com/mattvinall/Pipeline/pull/42',
        branch: 'feature/hubspot',
        baseBranch: 'main',
        author: 'mattvinall',
        createdAt: now,
        updatedAt: now,
        isDraft: false,
        labels: ['feature', 'integration'],
        body: null,
      },
    ],
    issues: [
      {
        number: 15,
        title: 'Improve rate limiting for LinkedIn automation',
        state: 'open',
        url: 'https://github.com/mattvinall/Pipeline/issues/15',
        author: 'mattvinall',
        createdAt: now,
        updatedAt: now,
        labels: ['enhancement'],
        body: null,
      },
    ],
    commits: [
      {
        sha: 'abc1234',
        message: 'fix: resolve auth middleware issue',
        author: 'mattvinall',
        date: now,
        url: 'https://github.com/mattvinall/Pipeline/commit/abc1234',
      },
    ],
    repo: 'mattvinall/Pipeline',
    fetchedAt: now,
    source: 'mock',
  };
}

export async function GET() {
  try {
    const activity = await getLiveGitHubActivity();

    // If we got real data, return it
    if (
      activity.pullRequests.length > 0 ||
      activity.issues.length > 0 ||
      activity.commits.length > 0
    ) {
      return NextResponse.json({ ...activity, source: 'live' });
    }

    // No data (unauthenticated / private repo with no token)
    return NextResponse.json(getMockGitHubActivity());
  } catch (err) {
    console.error('[api/github]', err);
    return NextResponse.json(getMockGitHubActivity());
  }
}
