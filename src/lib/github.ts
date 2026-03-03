/**
 * github.ts - GitHub data client
 * Uses the GitHub REST API (authenticated via GITHUB_TOKEN or gh CLI token).
 * Fetches PRs, issues, and commits for the Pipeline repo.
 */

const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = 'mattvinall';
const REPO_NAME = 'Pipeline'; // the main Pipeline app repo
const TIMEOUT_MS = 8000;

// Try env var first, fall back to gh CLI token (set in env by the shell)
function getGitHubToken(): string {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
}

async function ghFetch<T>(path: string): Promise<T | null> {
  const token = getGitHubToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${GITHUB_API}${path}`, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[github] HTTP ${res.status} for ${path}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.warn(`[github] Timeout fetching ${path}`);
    } else {
      console.warn(`[github] Error:`, (err as Error).message);
    }
    return null;
  }
}

// ─── GitHub raw types ─────────────────────────────────────────────────────────

interface GHPullRequest {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  user: { login: string };
  head: { ref: string };
  base: { ref: string };
  draft: boolean;
  body: string | null;
  labels: { name: string }[];
}

interface GHIssue {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  user: { login: string };
  labels: { name: string }[];
  body: string | null;
  pull_request?: unknown; // present if it's a PR, not a pure issue
}

interface GHCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  author: { login: string } | null;
}

// ─── Exported types ───────────────────────────────────────────────────────────

export interface PullRequest {
  number: number;
  title: string;
  state: string;
  url: string;
  branch: string;
  baseBranch: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  labels: string[];
  body: string | null;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  url: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  body: string | null;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GitHubActivity {
  pullRequests: PullRequest[];
  issues: GitHubIssue[];
  commits: Commit[];
  repo: string;
  fetchedAt: string;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getOpenPullRequests(
  limit = 10
): Promise<PullRequest[]> {
  const data = await ghFetch<GHPullRequest[]>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&per_page=${limit}&sort=updated&direction=desc`
  );
  if (!data) return [];

  return data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    url: pr.html_url,
    branch: pr.head.ref,
    baseBranch: pr.base.ref,
    author: pr.user.login,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    isDraft: pr.draft,
    labels: pr.labels.map((l) => l.name),
    body: pr.body,
  }));
}

export async function getOpenIssues(limit = 10): Promise<GitHubIssue[]> {
  const data = await ghFetch<GHIssue[]>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=open&per_page=${limit}&sort=updated&direction=desc`
  );
  if (!data) return [];

  // Filter out PRs (GH returns PRs in issues endpoint too)
  return data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      url: issue.html_url,
      author: issue.user.login,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      labels: issue.labels.map((l) => l.name),
      body: issue.body,
    }));
}

export async function getRecentCommits(limit = 10): Promise<Commit[]> {
  const data = await ghFetch<GHCommit[]>(
    `/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=${limit}`
  );
  if (!data) return [];

  return data.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0], // first line only
    author: c.author?.login || c.commit.author.name,
    date: c.commit.author.date,
    url: c.html_url,
  }));
}

export async function getGitHubActivity(): Promise<GitHubActivity> {
  const [pullRequests, issues, commits] = await Promise.all([
    getOpenPullRequests(10),
    getOpenIssues(10),
    getRecentCommits(10),
  ]);

  return {
    pullRequests,
    issues,
    commits,
    repo: `${REPO_OWNER}/${REPO_NAME}`,
    fetchedAt: new Date().toISOString(),
  };
}
