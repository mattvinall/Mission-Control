'use client';

import { getDashboardData, getStatusCounts, getAllTasks, getRecentActivity, getCompletionRate } from '@/lib/data';
import { cn, getStatusColor, formatTimeAgo } from '@/lib/utils';
import { 
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity as ActivityIcon,
  Zap
} from 'lucide-react';

interface DashboardViewProps {
  onProjectSelect: (projectId: string) => void;
  onTaskSelect: (taskId: string) => void;
}

const DashboardView = ({ onProjectSelect, onTaskSelect }: DashboardViewProps) => {
  const data = getDashboardData();
  const statusCounts = getStatusCounts();
  const allTasks = getAllTasks();
  const recentActivity = getRecentActivity(10);
  const completionRate = getCompletionRate();
  
  const inProgressTasks = allTasks.filter(task => task.status === 'in-progress');
  const urgentTasks = allTasks.filter(task => 
    task.priority === 'critical' && task.status !== 'done'
  );

  const stats = [
    {
      label: 'Total Tasks',
      value: allTasks.length,
      icon: CheckCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'In Progress',
      value: statusCounts['in-progress'],
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Critical Tasks',
      value: urgentTasks.length,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-6 w-6 text-orange-400" />
            <h1 className="text-2xl font-bold">Mission Control</h1>
          </div>
          <p className="text-gray-400">
            Track progress toward {data.bhag.title}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-xl border border-gray-800',
                  'bg-gray-900/50 hover:bg-gray-800/50 transition-colors'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn('p-3 rounded-lg', stat.bg)}>
                    <Icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Tasks */}
          <div className="space-y-6">
            {/* In Progress Tasks */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">In Progress</h3>
                <span className="text-sm text-gray-400">
                  ({inProgressTasks.length})
                </span>
              </div>
              
              <div className="space-y-3">
                {inProgressTasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tasks in progress</p>
                ) : (
                  inProgressTasks.slice(0, 5).map((task) => {
                    const project = data.projects.find(p => 
                      p.tasks?.some(t => t.id === task.id)
                    );
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => onTaskSelect(task.id)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="text-lg">{project?.icon || '📋'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {project?.title}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Urgent Tasks */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold">Critical Tasks</h3>
                <span className="text-sm text-gray-400">
                  ({urgentTasks.length})
                </span>
              </div>
              
              <div className="space-y-3">
                {urgentTasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No critical tasks</p>
                ) : (
                  urgentTasks.slice(0, 5).map((task) => {
                    const project = data.projects.find(p => 
                      p.tasks?.some(t => t.id === task.id)
                    );
                    const statusColors = getStatusColor(task.status);
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => onTaskSelect(task.id)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="text-lg">{project?.icon || '📋'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">
                              {project?.title}
                            </span>
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              statusColors.bg,
                              statusColors.text
                            )}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Projects Overview */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Active Projects</h3>
              </div>
              
              <div className="space-y-3">
                {data.projects
                  .filter(p => p.stage === 'in-progress')
                  .slice(0, 5)
                  .map((project) => {
                    const taskCount = project.tasks?.length || 0;
                    const doneCount = project.tasks?.filter(t => t.status === 'done').length || 0;
                    const progress = taskCount > 0 ? (doneCount / taskCount) * 100 : 0;
                    
                    return (
                      <div
                        key={project.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => onProjectSelect(project.id)}
                      >
                        <span className="text-lg flex-shrink-0">{project.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {project.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-green-400 h-1.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">
                              {doneCount}/{taskCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ActivityIcon className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
              
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                        activity.type === 'complete' ? 'bg-green-400' :
                        activity.type === 'task' ? 'bg-blue-400' : 'bg-gray-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;