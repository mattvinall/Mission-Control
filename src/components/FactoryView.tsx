'use client'

import { useMemo } from 'react'
import { Cog, Clock, ArrowRight, GitBranch, GitPullRequest } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFactoryTasks } from '@/lib/data'
import { FactoryTask } from '@/types'
import { cn } from '@/lib/utils'

const STAGES = [
  { key: 'intake', label: 'Intake', color: 'bg-gray-600', textColor: 'text-gray-300' },
  { key: 'queued', label: 'Queued', color: 'bg-blue-600', textColor: 'text-blue-300' },
  { key: 'building', label: 'Building', color: 'bg-yellow-600', textColor: 'text-yellow-300', animated: true },
  { key: 'qa', label: 'QA', color: 'bg-orange-600', textColor: 'text-orange-300', animated: true },
  { key: 'shipping', label: 'Shipping', color: 'bg-purple-600', textColor: 'text-purple-300' },
  { key: 'deployed', label: 'Deployed', color: 'bg-green-600', textColor: 'text-green-300' },
] as const

const PRIORITY_COLORS = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
} as const

export default function FactoryView() {
  const factoryTasks = getFactoryTasks()
  
  // Group tasks by stage
  const tasksByStage = useMemo(() => {
    const grouped = STAGES.reduce((acc, stage) => {
      acc[stage.key] = factoryTasks.filter(task => task.stage === stage.key)
      return acc
    }, {} as Record<string, FactoryTask[]>)
    return grouped
  }, [factoryTasks])

  // Calculate stats
  const stats = useMemo(() => {
    const totalTasks = factoryTasks.length
    const inProgress = factoryTasks.filter(task => 
      ['building', 'qa', 'shipping'].includes(task.stage)
    ).length
    
    const deployedToday = factoryTasks.filter(task => {
      if (task.stage !== 'deployed') return false
      if (!task.startedAt) return false
      const today = new Date().toDateString()
      const taskDate = new Date(task.startedAt).toDateString()
      return taskDate === today
    }).length

    // Calculate average cycle time (for deployed tasks)
    const deployedTasks = factoryTasks.filter(task => task.stage === 'deployed')
    const avgCycleTime = deployedTasks.length > 0
      ? deployedTasks.reduce((sum, task) => {
          if (!task.startedAt) return sum
          const start = new Date(task.startedAt)
          const now = new Date()
          return sum + (now.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
        }, 0) / deployedTasks.length
      : 0

    return {
      totalTasks,
      inProgress,
      deployedToday,
      avgCycleTime: Math.round(avgCycleTime * 10) / 10 // round to 1 decimal
    }
  }, [factoryTasks])

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours}h`
    return `${hours}h ${remainingMinutes}m`
  }

  const getTimeElapsed = (startedAt: string) => {
    const start = new Date(startedAt)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))
    return formatEstimatedTime(diffInMinutes)
  }

  const TaskCard = ({ task, isAnimated }: { task: FactoryTask, isAnimated?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "rounded-lg border border-gray-800 bg-gray-900/70 p-4 space-y-3",
        isAnimated && "ring-2 ring-orange-400/30 shadow-lg shadow-orange-400/10"
      )}
    >
      {/* Task Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-white truncate">{task.title}</h4>
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-medium",
              PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
            )}
          >
            {task.priority}
          </span>
        </div>
        
        {/* Agent Assignment */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {task.assignedAgent ? (
            <span>{task.assignedAgent}</span>
          ) : (
            <span className="text-gray-500">Unassigned</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span>{task.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-700">
          <motion.div
            className="h-2 rounded-full bg-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${task.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Task Details */}
      <div className="space-y-2 text-xs text-gray-500">
        {task.pr && (
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-3 w-3" />
            <span>PR #{task.pr}</span>
          </div>
        )}
        {task.branch && (
          <div className="flex items-center gap-2">
            <GitBranch className="h-3 w-3" />
            <span className="font-mono">{task.branch}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{formatEstimatedTime(task.estimatedMinutes)} est</span>
          </div>
          <span>{task.startedAt ? getTimeElapsed(task.startedAt) : 'N/A'} elapsed</span>
        </div>
      </div>
    </motion.div>
  )

  const StageColumn = ({ stage, tasks }: { stage: typeof STAGES[number], tasks: FactoryTask[] }) => (
    <div className="flex-1 space-y-4">
      {/* Stage Header */}
      <motion.div
        className={cn(
          "rounded-lg border-2 p-4 text-center",
          stage.color,
          stage.textColor,
          (stage as any).animated && "animate-pulse"
        )}
        animate={(stage as any).animated ? {
          boxShadow: [
            '0 0 20px rgba(251, 146, 60, 0.3)',
            '0 0 40px rgba(251, 146, 60, 0.5)',
            '0 0 20px rgba(251, 146, 60, 0.3)'
          ]
        } : {}}
        transition={{
          repeat: (stage as any).animated ? Infinity : 0,
          duration: 2,
          ease: "easeInOut"
        }}
      >
        <h3 className="font-bold text-lg">{stage.label}</h3>
        <div className="text-sm opacity-80">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </div>
      </motion.div>

      {/* Tasks */}
      <div className="space-y-3 min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isAnimated={(stage as any).animated}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Cog className="h-8 w-8 text-orange-400" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white">Software Factory</h1>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
        >
          <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
          <div className="text-sm text-gray-400">Total Tasks</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
        >
          <div className="text-2xl font-bold text-orange-400">{stats.inProgress}</div>
          <div className="text-sm text-gray-400">In Progress</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
        >
          <div className="text-2xl font-bold text-green-400">{stats.deployedToday}</div>
          <div className="text-sm text-gray-400">Deployed Today</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
        >
          <div className="text-2xl font-bold text-blue-400">{stats.avgCycleTime}h</div>
          <div className="text-sm text-gray-400">Avg Cycle Time</div>
        </motion.div>
      </div>

      {/* Pipeline Visualization */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-4" style={{ minWidth: '1200px' }}>
          {STAGES.map((stage, index) => (
            <div key={stage.key} className="flex items-center gap-4">
              <StageColumn stage={stage} tasks={tasksByStage[stage.key] || []} />
              
              {/* Arrow between stages */}
              {index < STAGES.length - 1 && (
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {factoryTasks.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
          <Cog className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-400">No tasks in the pipeline yet</p>
        </div>
      )}
    </div>
  )
}
