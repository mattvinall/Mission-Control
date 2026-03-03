'use client';

import { motion } from 'framer-motion';
import { getAgents, getAgentRuns } from '@/lib/data';
import { cn, formatTimeAgo, formatDuration, formatCurrency, getStatusColor } from '@/lib/utils';
import { 
  Bot, Activity, Clock, DollarSign, Zap, CheckCircle, 
  XCircle, Loader2, Play, Pause, TrendingUp 
} from 'lucide-react';

export default function AgentsView() {
  const agents = getAgents();
  const recentRuns = getAgentRuns();

  const runningRuns = recentRuns.filter(r => r.status === 'running');
  const completedRuns = recentRuns.filter(r => r.status === 'completed');

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Bot className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Agents</h1>
            <p className="text-gray-400">{agents.length} agents · {runningRuns.length} running</p>
          </div>
        </div>
      </motion.div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{agent.emoji}</span>
              <div className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
                agent.status === 'active' && 'bg-green-500/10 text-green-400',
                agent.status === 'busy' && 'bg-orange-500/10 text-orange-400',
                agent.status === 'idle' && 'bg-gray-500/10 text-gray-400',
              )}>
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  agent.status === 'active' && 'bg-green-400 animate-pulse',
                  agent.status === 'busy' && 'bg-orange-400',
                  agent.status === 'idle' && 'bg-gray-400',
                )} />
                {agent.status}
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-1">{agent.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{agent.model}</p>
            
            {agent.currentTask && (
              <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
                <p className="text-xs text-gray-500 mb-1">Current task</p>
                <p className="text-sm truncate">{agent.currentTask}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800/30 rounded-lg p-2">
                <p className="text-xs text-gray-500">Success</p>
                <p className="font-semibold text-green-400">{95}%</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-2">
                <p className="text-xs text-gray-500">Runs</p>
                <p className="font-semibold">{agent.totalRuns.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-2">
                <p className="text-xs text-gray-500">Today</p>
                <p className="font-semibold">${0.04}</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-2">
                <p className="text-xs text-gray-500">Month</p>
                <p className="font-semibold">${agent.totalCost}</p>
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 3).map(cap => (
                <span key={cap} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                  {cap}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Runs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Recent Runs</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-gray-400">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {runningRuns.length} running
            </span>
            <span className="flex items-center gap-1 text-gray-400">
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
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all"
            >
              <div className="flex-shrink-0">
                {run.status === 'running' ? (
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  </div>
                ) : run.status === 'completed' ? (
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0 text-2xl">{'??'}</div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{run.task}</p>
                <p className="text-sm text-gray-500">{run.agentId} · {formatTimeAgo(run.startedAt)}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {run.completedAt ? 'Completed' : 'Running'}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {run.cost.toFixed(2)}
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
        </div>
      </motion.div>

      {/* Cost Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
      >
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-400">Today's Cost</span>
          </div>
          <p className="text-3xl font-bold">${recentRuns.filter(r => new Date(r.startedAt).toDateString() === new Date().toDateString()).reduce((a, r) => a + r.cost, 0).toFixed(2)}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Month to Date</span>
          </div>
          <p className="text-3xl font-bold">${agents.reduce((a, b) => a + b.totalCost, 0).toFixed(2)}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Total Runs</span>
          </div>
          <p className="text-3xl font-bold">{agents.reduce((a, b) => a + b.totalRuns, 0).toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
}





