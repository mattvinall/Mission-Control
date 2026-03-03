'use client';

import { motion } from 'framer-motion';
import { getAgents, getAgentRuns } from '@/lib/data';
import { useAgents } from '@/hooks/useData';
import { cn, formatTimeAgo, formatCurrency, getStatusColor } from '@/lib/utils';
import { 
  Bot, Activity, Clock, DollarSign, Zap, CheckCircle, 
  XCircle, Loader2, TrendingUp, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import type { Agent, AgentRun } from '@/types';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function AgentCardSkeleton() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-gray-800 rounded-lg" />
        <div className="w-16 h-5 bg-gray-800 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-gray-700 rounded mb-1" />
      <div className="h-3 w-1/2 bg-gray-800 rounded mb-3" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Agent['status'] }) {
  const cfg = {
    active:  { bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400 animate-pulse' },
    busy:    { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
    idle:    { bg: 'bg-gray-500/10',   text: 'text-gray-400',   dot: 'bg-gray-400' },
    offline: { bg: 'bg-red-500/10',    text: 'text-red-400',    dot: 'bg-red-400' },
  }[status] ?? { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' };

  return (
    <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full text-xs', cfg.bg, cfg.text)}>
      <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {status}
    </div>
  );
}

// ── Run status icon ───────────────────────────────────────────────────────────

function RunIcon({ status }: { status: AgentRun['status'] }) {
  if (status === 'running')
    return <div className="p-2 bg-blue-500/10 rounded-lg"><Loader2 className="h-5 w-5 text-blue-400 animate-spin" /></div>;
  if (status === 'completed')
    return <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle className="h-5 w-5 text-green-400" /></div>;
  return <div className="p-2 bg-red-500/10 rounded-lg"><XCircle className="h-5 w-5 text-red-400" /></div>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AgentsView() {
  // ── SWR live data ─────────────────────────────────────────────────────────
  const { data: liveData, isLoading, error } = useAgents();

  // ── Fallback mock data ────────────────────────────────────────────────────
  const mockAgents = getAgents();
  const mockRuns   = getAgentRuns();

  // ── Merge: prefer live, fall back to mock ─────────────────────────────────
  const agents     = liveData?.agents?.length ? liveData.agents : mockAgents;
  const recentRuns = liveData?.runs?.length   ? liveData.runs   : mockRuns;
  const source     = liveData?.source ?? 'mock';

  const runningRuns   = recentRuns.filter(r => r.status === 'running');
  const completedRuns = recentRuns.filter(r => r.status === 'completed');

  const totalCost = agents.reduce((a, b) => a + b.totalCost, 0);
  const totalRuns = agents.reduce((a, b) => a + b.totalRuns, 0);
  const todayCost = recentRuns
    .filter(r => new Date(r.startedAt).toDateString() === new Date().toDateString())
    .reduce((a, r) => a + r.cost, 0);

  // Find emoji for a run by matching agentId
  const getAgentEmoji = (agentId: string) =>
    agents.find(a => a.id === agentId)?.emoji ?? '🤖';

  return (
    <div className="h-full overflow-y-auto p-6">

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Bot className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Agents</h1>
              <p className="text-gray-400">
                {isLoading ? 'Loading…' : `${agents.length} agents · ${runningRuns.length} running`}
              </p>
            </div>
          </div>

          {/* Source indicator */}
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
              <RefreshCw className="h-3 w-3 animate-spin" /> Syncing…
            </span>
          ) : source === 'live' ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
              <Wifi className="h-3 w-3" /> Live data
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full">
              <WifiOff className="h-3 w-3" /> Mock data
            </span>
          )}
        </div>
      </motion.div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <AgentCardSkeleton key={i} />)
          : agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{agent.emoji}</span>
                  <StatusBadge status={agent.status} />
                </div>
                
                <h3 className="font-bold text-lg mb-1">{agent.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{agent.model}</p>
                
                {agent.currentTask && (
                  <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Current task</p>
                    <p className="text-sm truncate">{agent.currentTask}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-800/30 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Runs</p>
                    <p className="font-semibold">{agent.totalRuns.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Cost</p>
                    <p className="font-semibold text-green-400">${agent.totalCost.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Last active</p>
                    <p className="font-semibold text-xs">{formatTimeAgo(agent.lastActive)}</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className={cn(
                      'font-semibold text-xs capitalize',
                      agent.status === 'active' && 'text-green-400',
                      agent.status === 'busy'   && 'text-orange-400',
                      agent.status === 'idle'   && 'text-gray-400',
                    )}>
                      {agent.status}
                    </p>
                  </div>
                </div>
                
                {agent.capabilities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                        {cap}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="text-xs text-gray-600">+{agent.capabilities.length - 3}</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))
        }
      </div>

      {/* Recent Runs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Recent Runs</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {runningRuns.length} running
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              {completedRuns.length} completed
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          {recentRuns.map((run, i) => (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all"
            >
              <RunIcon status={run.status} />
              <div className="flex-shrink-0 text-2xl">{getAgentEmoji(run.agentId)}</div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{run.task}</p>
                <p className="text-sm text-gray-500">{run.agentId} · {formatTimeAgo(run.startedAt)}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {run.completedAt ? formatTimeAgo(run.completedAt) : 'Running'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {run.cost.toFixed(3)}
                </span>
              </div>
              
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                getStatusColor(run.status).bg,
                getStatusColor(run.status).text
              )}>
                {run.status}
              </span>
            </motion.div>
          ))}

          {recentRuns.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No runs recorded yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cost Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-400">Today's Cost</span>
          </div>
          <p className="text-3xl font-bold">${todayCost.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Month to Date</span>
          </div>
          <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Total Runs</span>
          </div>
          <p className="text-3xl font-bold">{totalRuns.toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
}
