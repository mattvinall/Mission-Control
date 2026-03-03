'use client';

/**
 * useData.ts - SWR hooks for all Mission Control data endpoints
 *
 * Each hook polls the corresponding API route on a sensible interval.
 * Falls back gracefully when the API is unavailable.
 */

import useSWR from 'swr';
import type { Task, Agent, AgentRun, ContentPiece, MemoryEntry } from '@/types';
import type { GitHubActivity } from '@/lib/github';
import type { LiveDashboardSummary } from '@/lib/data-live';
import type { DashboardData } from '@/types';

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[useData] ${url} returned ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Response shapes ──────────────────────────────────────────────────────────

interface TasksResponse {
  tasks: Task[];
  source: 'live' | 'mock';
  count: number;
}

interface AgentsResponse {
  agents: Agent[];
  runs: AgentRun[];
  source: 'live' | 'mock';
}

interface MemoryResponse {
  entries: MemoryEntry[];
  source: 'live' | 'mock';
  count: number;
}

interface ContentResponse {
  content: ContentPiece[];
  source: 'live' | 'mock';
  count: number;
}

interface DashboardResponse extends DashboardData {
  live?: LiveDashboardSummary;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  completionRate: number;
  source: 'live' | 'mock';
}

interface GitHubResponse extends GitHubActivity {
  source: 'live' | 'mock';
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Tasks — refresh every 30s */
export function useTasks() {
  return useSWR<TasksResponse>('/api/tasks', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });
}

/** Agents — refresh every 15s (agents change frequently) */
export function useAgents() {
  return useSWR<AgentsResponse>('/api/agents', fetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });
}

/** Memory entries — refresh every 60s */
export function useMemory() {
  return useSWR<MemoryResponse>('/api/memory', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });
}

/** Content pipeline — refresh every 30s */
export function useContent() {
  return useSWR<ContentResponse>('/api/content', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });
}

/** Dashboard summary — refresh every 20s */
export function useDashboard() {
  return useSWR<DashboardResponse>('/api/dashboard', fetcher, {
    refreshInterval: 20_000,
    revalidateOnFocus: true,
  });
}

/** GitHub activity — refresh every 5 minutes (rate limit aware) */
export function useGitHub() {
  return useSWR<GitHubResponse>('/api/github', fetcher, {
    refreshInterval: 5 * 60_000,
    revalidateOnFocus: false,
  });
}

// ─── Convenience selectors ────────────────────────────────────────────────────

/** Returns just the tasks array (unwrapped) */
export function useTaskList() {
  const { data, error, isLoading } = useTasks();
  return {
    tasks: data?.tasks ?? [],
    source: data?.source,
    error,
    isLoading,
  };
}

/** Returns just agents + runs (unwrapped) */
export function useAgentList() {
  const { data, error, isLoading } = useAgents();
  return {
    agents: data?.agents ?? [],
    runs: data?.runs ?? [],
    source: data?.source,
    error,
    isLoading,
  };
}

/** Returns just the content array (unwrapped) */
export function useContentList() {
  const { data, error, isLoading } = useContent();
  return {
    content: data?.content ?? [],
    source: data?.source,
    error,
    isLoading,
  };
}

/** Returns just the memory entries (unwrapped) */
export function useMemoryList() {
  const { data, error, isLoading } = useMemory();
  return {
    entries: data?.entries ?? [],
    source: data?.source,
    error,
    isLoading,
  };
}
