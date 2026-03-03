'use client';

import { motion } from 'framer-motion';
import { 
  getDashboardData, 
  getStatusCounts, 
  getPriorityCounts, 
  getCompletionRate,
  getAllTasks,
  getActivityLog
} from '@/lib/data';
import { cn, formatTimeAgo, getStatusColor, getPriorityColor } from '@/lib/utils';
import { 
  Target, TrendingUp, CheckCircle, Clock, AlertTriangle, 
  Activity, Zap, ArrowRight, Bot, Rocket
} from 'lucide-react';

interface DashboardViewProps {
  onViewChange: (view: string) => void;
  onTaskSelect: (taskId: string) => void;
}

export default function DashboardView({ onViewChange, onTaskSelect }: DashboardViewProps) {
  const data = getDashboardData();
  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();
  const completionRate = getCompletionRate();
  const allTasks = getAllTasks();
  const recentActivity = getActivityLog().slice(0, 6);

  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').slice(0, 4);
  const criticalTasks = allTasks.filter(t => t.priority === 'critical' && t.status !== 'done').slice(0, 4);

  const stats = [
    { label: 'Total Tasks', value: allTasks.length, icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12%' },
    { label: 'In Progress', value: statusCounts['in-progress'], icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', trend: '+3' },
    { label: 'Completion', value: `${completionRate}%`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', trend: '+5%' },
    { label: 'Active Agents', value: '5', icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: 'All online' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <Rocket className="h-8 w-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mission Control</h1>
            <p className="text-gray-400">Track progress toward {data.bhag.title}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-orange-500/30 transition-all group cursor-pointer"
            onClick={() => stat.label === 'Active Agents' && onViewChange('agents')}
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
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* BHAG Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-bold text-orange-400 uppercase tracking-wider">BHAG</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{data.bhag.title}</h2>
            <p className="text-gray-400">{data.bhag.description}</p>
          </motion.div>

          {/* In Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer transition-all group"
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
            transition={{ delay: 0.3 }}
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
        </div>

        {/* Right Column - Activity */}
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
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800/30 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <div>
                <p className="font-medium text-green-400">{data.meta.agentStatus}</p>
                <p className="text-xs text-gray-500">{data.meta.currentTask.slice(0, 50)}...</p>
              </div>
            </div>
            <button 
              onClick={() => onViewChange('agents')}
              className="w-full py-2 text-sm text-center text-orange-400 hover:text-orange-300 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-all"
            >
              View all agents
            </button>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold">Live Activity</h3>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    activity.type === 'complete' && 'bg-green-400',
                    activity.type === 'agent' && 'bg-purple-400',
                    activity.type === 'deploy' && 'bg-orange-400',
                    activity.type === 'decision' && 'bg-blue-400',
                    activity.type === 'system' && 'bg-gray-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activity.actor && <span className="mr-2">{activity.actorAvatar} {activity.actor}</span>}
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Projects Quick View */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
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
              {data.projects.filter(p => p.stage === 'in-progress').map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{project.icon}</span>
                      <span className="font-medium text-sm">{project.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
