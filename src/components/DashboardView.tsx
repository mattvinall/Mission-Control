'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  getDashboardData, 
  getStatusCounts, 
  getPriorityCounts, 
  getCompletionRate,
  getAllTasks,
  getActivityLog
} from '@/lib/data';
import { useDashboard, useAgents } from '@/hooks/useData';
import { cn, formatTimeAgo, getStatusColor, getPriorityColor } from '@/lib/utils';
import { 
  Target, TrendingUp, CheckCircle, Clock, AlertTriangle, 
  Activity, Zap, ArrowRight, Bot, Rocket, RefreshCw, Wifi, WifiOff
} from 'lucide-react';

interface DashboardViewProps {
  onViewChange: (view: string) => void;
  onTaskSelect: (taskId: string) => void;
}

// Skeleton pulse card
function SkeletonCard() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-3 w-20 bg-gray-800 rounded mb-2" />
          <div className="h-8 w-12 bg-gray-700 rounded mb-2" />
          <div className="h-3 w-14 bg-gray-800 rounded" />
        </div>
        <div className="w-12 h-12 bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}

function ActivityDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    complete: 'bg-green-400',
    agent:    'bg-purple-400',
    deploy:   'bg-orange-400',
    decision: 'bg-blue-400',
    task:     'bg-yellow-400',
    note:     'bg-gray-400',
    system:   'bg-gray-500',
  };
  return (
    <span className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', colors[type] ?? 'bg-gray-500')} />
  );
}

export default function DashboardView({ onViewChange, onTaskSelect }: DashboardViewProps) {
  // ── SWR live data ─────────────────────────────────────────────────────────
  const { data: dashData, isLoading: dashLoading, error: dashError } = useDashboard();
  const { data: agentsData, isLoading: agentsLoading } = useAgents();

  // ── Mock fallbacks ────────────────────────────────────────────────────────
  const mockDash      = getDashboardData();
  const mockCounts    = getStatusCounts();
  const mockCompletion = getCompletionRate();
  const mockAllTasks  = getAllTasks();
  const mockActivity  = getActivityLog();

  // ── Derived data (live first, mock fallback) ──────────────────────────────
  const meta           = dashData?.meta          ?? mockDash.meta;
  const bhag           = dashData?.bhag          ?? mockDash.bhag;
  const projects       = dashData?.projects      ?? mockDash.projects;
  const completionRate = dashData?.completionRate ?? mockCompletion;
  const statusCounts   = dashData?.statusCounts  ?? mockCounts;
  const allTasks       = mockAllTasks; // tasks come from mock since dashboard API doesn't expose them directly
  const activityLog    = dashData?.activityLog   ?? mockActivity;

  const agents        = agentsData?.agents ?? [];
  const activeAgents  = agentsLoading ? 5 : agents.filter(a => a.status === 'active' || a.status === 'busy').length;
  const agentStatus   = agents.length > 0 ? agents[0] : null;

  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').slice(0, 4);
  const criticalTasks   = allTasks.filter(t => t.priority === 'critical' && t.status !== 'done').slice(0, 4);
  const recentActivity  = activityLog.slice(0, 8);

  const isLive   = !!dashData && !dashError;
  const isLoading = dashLoading && agentsLoading;

  const stats = [
    { 
      label: 'Total Tasks', 
      value: isLoading ? '…' : allTasks.length, 
      icon: CheckCircle, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10', 
      trend: `${statusCounts['done'] ?? 0} done` 
    },
    { 
      label: 'In Progress', 
      value: isLoading ? '…' : (statusCounts['in-progress'] ?? inProgressTasks.length), 
      icon: Clock, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10', 
      trend: 'active now' 
    },
    { 
      label: 'Completion', 
      value: isLoading ? '…' : `${completionRate}%`, 
      icon: TrendingUp, 
      color: 'text-green-400', 
      bg: 'bg-green-500/10', 
      trend: 'all time' 
    },
    { 
      label: 'Active Agents', 
      value: agentsLoading ? '…' : activeAgents, 
      icon: Bot, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10', 
      trend: agents.length > 0 ? 'live' : 'mock',
      onClick: () => onViewChange('agents'),
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* ── BHAG Hero Banner ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-transparent p-6"
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative flex items-center gap-5">
          <div className="flex-shrink-0 p-4 bg-orange-500/20 rounded-2xl ring-1 ring-orange-500/30">
            <Rocket className="h-10 w-10 text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400">BHAG · Big Hairy Audacious Goal</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              {bhag.title}
            </h1>
            <p className="mt-1 text-gray-400 max-w-xl">{bhag.description}</p>
          </div>

          {/* Live indicator */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                <Wifi className="h-3 w-3" />
                Live data
              </span>
            ) : dashError ? (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full">
                <WifiOff className="h-3 w-3" />
                Mock data
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Syncing…
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnimatePresence>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SkeletonCard />
                </motion.div>
              ))
            : stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    'bg-gray-900/50 border border-gray-800 rounded-xl p-5 transition-all group',
                    stat.onClick && 'cursor-pointer hover:border-orange-500/30'
                  )}
                  onClick={stat.onClick}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-xs text-green-400 mt-1">{stat.trend}</p>
                    </div>
                    <div className={cn('p-3 rounded-xl', stat.bg)}>
                      <stat.icon className={cn('h-6 w-6', stat.color)} />
                    </div>
                  </div>
                </motion.div>
              ))
          }
        </AnimatePresence>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Tasks */}
        <div className="lg:col-span-2 space-y-6">

          {/* In Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">In Progress</h3>
                <span className="text-sm text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                  {inProgressTasks.length}
                </span>
              </div>
              <button 
                onClick={() => onViewChange('tasks')}
                className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskSelect(task.id)}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer transition-all"
                >
                  <span className="text-2xl">{task.projectIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.projectTitle}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getPriorityColor(task.priority).bg,
                    getPriorityColor(task.priority).text
                  )}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Critical Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-semibold">Critical Priority</h3>
              <span className="text-sm text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {criticalTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {criticalTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskSelect(task.id)}
                  className="flex items-center gap-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 cursor-pointer transition-all"
                >
                  <span className="text-2xl">{task.projectIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.projectTitle}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getStatusColor(task.status).bg,
                    getStatusColor(task.status).text
                  )}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Live Activity Feed ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold">Live Activity Feed</h3>
                {isLive && (
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    live
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{recentActivity.length} events</span>
            </div>

            <div className="relative">
              {/* Timeline spine */}
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gray-800" />

              <div className="space-y-4 pl-6">
                {recentActivity.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="relative"
                  >
                    {/* Dot on the spine */}
                    <span className={cn(
                      'absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-gray-950',
                      activity.type === 'complete'  && 'bg-green-400',
                      activity.type === 'agent'     && 'bg-purple-400',
                      activity.type === 'deploy'    && 'bg-orange-400',
                      activity.type === 'decision'  && 'bg-blue-400',
                      activity.type === 'task'      && 'bg-yellow-400',
                      activity.type === 'note'      && 'bg-gray-400',
                      activity.type === 'system'    && 'bg-gray-500',
                    )} />

                    <div className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-200 leading-snug flex-1">{activity.message}</p>
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      {activity.actor && (
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.actorAvatar} {activity.actor}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right — Sidebar cards */}
        <div className="space-y-6">

          {/* Agent Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold">Agent Status</h3>
            </div>

            {agentsLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-12 bg-gray-800 rounded-lg" />
                <div className="h-4 w-3/4 bg-gray-800 rounded" />
              </div>
            ) : agentStatus ? (
              <>
                <div className="flex items-center gap-3 mb-3 p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-2xl">{agentStatus.emoji}</span>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      agentStatus.status === 'active' && 'bg-green-400 animate-pulse',
                      agentStatus.status === 'busy'   && 'bg-orange-400',
                      agentStatus.status === 'idle'   && 'bg-gray-400',
                    )} />
                    <div>
                      <p className="font-medium text-sm">{agentStatus.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{agentStatus.status}</p>
                    </div>
                  </div>
                </div>
                {agentStatus.currentTask && (
                  <p className="text-xs text-gray-500 truncate mb-3">{agentStatus.currentTask}</p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800/30 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <p className="font-medium text-green-400 capitalize">{meta.agentStatus}</p>
                  <p className="text-xs text-gray-500">{meta.currentTask.slice(0, 50)}…</p>
                </div>
              </div>
            )}

            {agents.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {agents.slice(0, 5).map(a => (
                  <span key={a.id} title={a.name} className="text-xl">{a.emoji}</span>
                ))}
              </div>
            )}

            <button 
              onClick={() => onViewChange('agents')}
              className="w-full py-2 text-sm text-center text-orange-400 hover:text-orange-300 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-all"
            >
              View all agents
            </button>
          </motion.div>

          {/* Active Projects */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Projects</h3>
              <button 
                onClick={() => onViewChange('projects')}
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                View all
              </button>
            </div>
            <div className="space-y-4">
              {projects.filter(p => p.stage === 'in-progress').slice(0, 5).map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{project.icon}</span>
                      <span className="font-medium text-sm">{project.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Nav */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Nav</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Content', view: 'content', emoji: '✍️' },
                { label: 'Memory',  view: 'memory',  emoji: '🧠' },
                { label: 'Tasks',   view: 'tasks',   emoji: '✅' },
                { label: 'Council', view: 'council', emoji: '⚖️' },
              ].map(item => (
                <button
                  key={item.view}
                  onClick={() => onViewChange(item.view)}
                  className="flex items-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
