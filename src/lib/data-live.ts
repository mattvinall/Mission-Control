/**
 * data-live.ts - Live data functions reading from real sources
 * - SQLite (Hydra DB) for tasks, memory, content, agent_runs
 * - Clawdbot gateway for active agent sessions
 * - GitHub API for repo activity
 *
 * Each function has a mock fallback imported from data.ts.
 */

import type {
  Task,
  MemoryEntry,
  ContentPiece,
  Agent,
  AgentRun,
} from '@/types';
import { dbAll, dbGet } from './db';
import { getGatewaySessions } from './gateway';
import { getGitHubActivity, type GitHubActivity } from './github';

// ─── Environment detection ────────────────────────────────────────────────────

export const IS_LOCAL =
  process.env.NODE_ENV !== 'production' ||
  process.env.FORCE_LIVE_DATA === 'true';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDbStatus(dbStatus: string): Task['status'] {
  const map: Record<string, Task['status']> = {
    queued: 'backlog',
    running: 'in-progress',
    done: 'done',
    failed: 'discarded',
    cancelled: 'discarded',
  };
  return map[dbStatus] ?? 'backlog';
}

function mapDbPriority(priority: number): Task['priority'] {
  if (priority <= 2) return 'critical';
  if (priority <= 4) return 'high';
  if (priority <= 6) return 'medium';
  return 'low';
}

function parseJsonSafe<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ─── DB Row types ─────────────────────────────────────────────────────────────

interface DbTask {
  id: number;
  type: string;
  status: string;
  priority: number;
  title: string | null;
  payload: string | null;
  result: string | null;
  agent_type: string | null;
  model: string | null;
  session_key: string | null;
  error: string | null;
  retries: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface DbMemory {
  id: number;
  category: string;
  key: string;
  value: string;
  metadata: string | null;
  tags: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  archived: number;
}

interface DbContent {
  id: number;
  platform: string;
  type: string;
  status: string;
  title: string | null;
  body: string | null;
  hook: string | null;
  angle: string | null;
  pillar: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  url: string | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  clicks: number | null;
}

interface DbAgentRun {
  id: number;
  agent_type: string;
  task_id: number | null;
  session_key: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  duration_ms: number | null;
  status: string;
  error: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

interface DbAgentStats {
  agent_type: string;
  model: string | null;
  runs: number;
  total_input_tokens: number | null;
  total_output_tokens: number | null;
  total_cost: number | null;
  avg_duration_ms: number | null;
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

export async function getLiveTasks(limit = 100): Promise<Task[]> {
  const rows = dbAll<DbTask>(
    `SELECT * FROM tasks ORDER BY priority ASC, created_at DESC LIMIT ?`,
    [limit]
  );

  if (rows.length === 0) return [];

  return rows.map((row) => {
    const payload = parseJsonSafe<Record<string, unknown>>(row.payload, {});
    return {
      id: String(row.id),
      title: row.title || `Task #${row.id} (${row.type})`,
      description:
        (payload.description as string) ||
        row.error ||
        `${row.type} task`,
      status: mapDbStatus(row.status),
      priority: mapDbPriority(row.priority),
      createdAt: row.created_at,
      updatedAt: row.completed_at || row.started_at || row.created_at,
      tags: [row.type, row.agent_type].filter(Boolean) as string[],
      notes: row.error || undefined,
      assignee: row.agent_type || undefined,
    } satisfies Task;
  });
}

// ─── MEMORY ───────────────────────────────────────────────────────────────────

type MemoryCategory = MemoryEntry['category'];

export async function getLiveMemory(limit = 50): Promise<MemoryEntry[]> {
  const rows = dbAll<DbMemory>(
    `SELECT * FROM memory WHERE archived = 0 ORDER BY updated_at DESC LIMIT ?`,
    [limit]
  );

  if (rows.length === 0) return [];

  const validCategories: MemoryCategory[] = [
    'fact', 'decision', 'preference', 'context', 'lesson', 'system', 'todo',
  ];

  return rows.map((row) => ({
    id: String(row.id),
    category: validCategories.includes(row.category as MemoryCategory)
      ? (row.category as MemoryCategory)
      : 'fact',
    key: row.key,
    value: row.value,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// ─── CONTENT ─────────────────────────────────────────────────────────────────

type ContentPlatform = ContentPiece['platform'];
type ContentType = ContentPiece['type'];
type ContentStage = ContentPiece['stage'];

export async function getLiveContent(limit = 50): Promise<ContentPiece[]> {
  const rows = dbAll<DbContent>(
    `SELECT * FROM content WHERE status != 'archived' ORDER BY updated_at DESC LIMIT ?`,
    [limit]
  );

  if (rows.length === 0) return [];

  const validPlatforms: ContentPlatform[] = ['linkedin', 'x', 'youtube'];
  const validTypes: ContentType[] = ['post', 'thread', 'carousel', 'video-script'];
  const validStages: ContentStage[] = ['idea', 'draft', 'review', 'scheduled', 'published'];

  // Map DB status → ContentStage
  const statusMap: Record<string, ContentStage> = {
    idea: 'idea',
    draft: 'draft',
    review: 'review',
    approved: 'scheduled',
    published: 'published',
  };

  // Map DB type → ContentType
  const typeMap: Record<string, ContentType> = {
    post: 'post',
    thread: 'thread',
    carousel: 'carousel',
    video_script: 'video-script',
    article: 'post',
  };

  return rows.map((row) => ({
    id: String(row.id),
    title: row.title || `Content #${row.id}`,
    platform: validPlatforms.includes(row.platform as ContentPlatform)
      ? (row.platform as ContentPlatform)
      : 'linkedin',
    type: typeMap[row.type] ?? (validTypes.includes(row.type as ContentType) ? (row.type as ContentType) : 'post'),
    stage: statusMap[row.status] ?? (validStages.includes(row.status as ContentStage) ? (row.status as ContentStage) : 'draft'),
    content: row.body || '',
    scheduledDate: null,
    publishedDate: row.published_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metrics:
      row.impressions != null || row.likes != null
        ? {
            views: row.impressions ?? undefined,
            likes: row.likes ?? undefined,
            comments: row.comments ?? undefined,
            shares: row.shares ?? undefined,
          }
        : undefined,
  }));
}

// ─── AGENT RUNS ───────────────────────────────────────────────────────────────

export async function getLiveAgentRuns(limit = 20): Promise<AgentRun[]> {
  const rows = dbAll<DbAgentRun>(
    `SELECT * FROM agent_runs ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );

  if (rows.length === 0) return [];

  return rows.map((row) => ({
    id: String(row.id),
    agentId: `agent-${row.agent_type}`,
    task: row.notes || `${row.agent_type} run #${row.id}`,
    status:
      row.status === 'completed'
        ? 'completed'
        : row.status === 'failed'
        ? 'failed'
        : 'running',
    startedAt: row.created_at,
    completedAt: row.completed_at || null,
    tokensUsed: (row.input_tokens || 0) + (row.output_tokens || 0),
    cost: row.cost_usd || 0,
    model: row.model || 'claude-sonnet-4-5',
  }));
}

// ─── AGENT STATUS (from gateway + DB stats) ───────────────────────────────────

const AGENT_EMOJI: Record<string, string> = {
  research: '🔬',
  content: '📣',
  strategy: '🎯',
  orchestrator: '🐉',
  dev: '⚡',
  support: '🎧',
};

const AGENT_CAPABILITIES: Record<string, string[]> = {
  research: ['Web Scraping', 'Data Analysis', 'Competitive Research'],
  content: ['Content Creation', 'Social Media', 'SEO', 'Campaign Planning'],
  strategy: ['Planning', 'Analysis', 'Decision Making'],
  orchestrator: ['Task Planning', 'Code Review', 'Research', 'Content Strategy'],
  dev: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
  support: ['Documentation', 'FAQ Generation', 'User Guides'],
};

export async function getLiveAgentStatus(): Promise<Agent[]> {
  // Get aggregate stats from DB
  const stats = dbAll<DbAgentStats>(`
    SELECT
      agent_type,
      model,
      COUNT(*) as runs,
      SUM(input_tokens) as total_input_tokens,
      SUM(output_tokens) as total_output_tokens,
      ROUND(SUM(cost_usd), 4) as total_cost,
      ROUND(AVG(duration_ms), 0) as avg_duration_ms
    FROM agent_runs
    GROUP BY agent_type
    ORDER BY runs DESC
  `);

  // Get active sessions from gateway
  const sessions = await getGatewaySessions();
  const activeSessions = new Set(sessions.map((s) => s.agent_type || ''));

  // Get running tasks from DB
  const runningTasks = dbAll<{ agent_type: string; title: string }>(
    `SELECT agent_type, title FROM tasks WHERE status = 'running' AND agent_type IS NOT NULL`
  );
  const runningTaskMap = new Map(
    runningTasks.map((t) => [t.agent_type, t.title])
  );

  // Get last active time per agent type
  const lastActive = dbAll<{ agent_type: string; last_at: string }>(
    `SELECT agent_type, MAX(created_at) as last_at FROM agent_runs GROUP BY agent_type`
  );
  const lastActiveMap = new Map(lastActive.map((r) => [r.agent_type, r.last_at]));

  if (stats.length === 0 && sessions.length === 0) return [];

  const agentTypes = new Set([
    ...stats.map((s) => s.agent_type),
    ...sessions.map((s) => s.agent_type || 'orchestrator'),
  ]);

  return Array.from(agentTypes).map((type) => {
    const stat = stats.find((s) => s.agent_type === type);
    const isActive = activeSessions.has(type) || runningTaskMap.has(type);
    const currentTask = runningTaskMap.get(type) || null;

    return {
      id: `agent-${type}`,
      name: type.charAt(0).toUpperCase() + type.slice(1) + ' Agent',
      emoji: AGENT_EMOJI[type] || '🤖',
      status: isActive ? 'busy' : 'idle',
      currentTask,
      model: stat?.model || 'claude-sonnet-4-5',
      totalRuns: stat?.runs || 0,
      totalCost: stat?.total_cost || 0,
      lastActive: lastActiveMap.get(type) || new Date().toISOString(),
      capabilities: AGENT_CAPABILITIES[type] || ['General Purpose'],
    } satisfies Agent;
  });
}

// ─── GITHUB ACTIVITY ──────────────────────────────────────────────────────────

export async function getLiveGitHubActivity(): Promise<GitHubActivity> {
  return getGitHubActivity();
}

// ─── DASHBOARD SUMMARY ────────────────────────────────────────────────────────

export interface LiveDashboardSummary {
  taskCounts: Record<string, number>;
  agentRunsToday: number;
  costToday: number;
  contentByStage: Record<string, number>;
  memoryCount: number;
  activeAgents: number;
  lastUpdated: string;
}

export async function getLiveDashboardSummary(): Promise<LiveDashboardSummary> {
  const taskCounts =
    dbGet<Record<string, number>>(`
    SELECT
      SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as backlog,
      SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as discarded
    FROM tasks
  `) || { backlog: 0, in_progress: 0, done: 0, discarded: 0 };

  const todayStats =
    dbGet<{ runs: number; cost: number }>(`
    SELECT COUNT(*) as runs, ROUND(SUM(cost_usd), 4) as cost
    FROM agent_runs
    WHERE date(created_at) = date('now')
  `) || { runs: 0, cost: 0 };

  const contentByStage = dbAll<{ status: string; count: number }>(`
    SELECT status, COUNT(*) as count FROM content WHERE status != 'archived' GROUP BY status
  `).reduce(
    (acc, row) => {
      acc[row.status] = row.count;
      return acc;
    },
    {} as Record<string, number>
  );

  const memoryCount =
    (dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM memory WHERE archived = 0`)
      ?.count) || 0;

  const sessions = await getGatewaySessions();

  return {
    taskCounts: {
      backlog: Number(taskCounts.backlog) || 0,
      'in-progress': Number(taskCounts.in_progress) || 0,
      done: Number(taskCounts.done) || 0,
      discarded: Number(taskCounts.discarded) || 0,
    },
    agentRunsToday: todayStats.runs,
    costToday: todayStats.cost,
    contentByStage,
    memoryCount,
    activeAgents: sessions.length,
    lastUpdated: new Date().toISOString(),
  };
}
