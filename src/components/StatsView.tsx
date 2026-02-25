'use client';

import { getDashboardData, getStatusCounts, getPriorityCounts, getAllTasks, getCompletionRate } from '@/lib/data';
import { cn, getStatusColor, getPriorityColor, getStageColor } from '@/lib/utils';
import { 
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Zap
} from 'lucide-react';

const StatsView = () => {
  const data = getDashboardData();
  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();
  const allTasks = getAllTasks();
  const completionRate = getCompletionRate();

  // Calculate project stats
  const projectStats = {
    total: data.projects.length,
    active: data.projects.filter(p => p.stage === 'in-progress').length,
    completed: data.projects.filter(p => p.stage === 'done').length,
    planning: data.projects.filter(p => p.stage === 'planning').length,
  };

  // Calculate task distribution by project
  const projectTaskDistribution = data.projects.map(project => ({
    ...project,
    taskCount: project.tasks?.length || 0,
    completedTasks: project.tasks?.filter(t => t.status === 'done').length || 0,
  })).sort((a, b) => b.taskCount - a.taskCount);

  // Calculate weekly activity (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const weeklyActivity = last7Days.map(dateString => {
    const count = data.activityLog.filter(activity => {
      return new Date(activity.timestamp).toDateString() === dateString;
    }).length;
    return {
      date: dateString,
      count,
      label: new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  const maxActivity = Math.max(...weeklyActivity.map(d => d.count), 1);

  // Recent performance metrics
  const last30Days = data.activityLog.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return activityDate >= thirtyDaysAgo;
  });

  const tasksCompleted30Days = last30Days.filter(a => a.type === 'complete').length;
  const avgTasksPerDay = Math.round((tasksCompleted30Days / 30) * 10) / 10;

  // Status distribution for chart
  const statusData = [
    { status: 'done', count: statusCounts.done, label: 'Done', color: 'bg-green-400' },
    { status: 'in-progress', count: statusCounts['in-progress'], label: 'In Progress', color: 'bg-yellow-400' },
    { status: 'review', count: statusCounts.review, label: 'Review', color: 'bg-blue-400' },
    { status: 'backlog', count: statusCounts.backlog, label: 'Backlog', color: 'bg-gray-400' },
    { status: 'discarded', count: statusCounts.discarded, label: 'Discarded', color: 'bg-red-400' },
  ].filter(item => item.count > 0);

  const totalTasks = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="h-6 w-6 text-orange-400" />
          <h1 className="text-2xl font-bold">Statistics</h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold">{allTasks.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CheckCircle className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold">{completionRate}%</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active Projects</p>
                <p className="text-3xl font-bold">{projectStats.active}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Avg Tasks/Day</p>
                <p className="text-3xl font-bold">{avgTasksPerDay}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Calendar className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Status Distribution */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-400" />
              Task Status Distribution
            </h3>
            
            <div className="space-y-4">
              {statusData.map((item) => {
                const percentage = totalTasks > 0 ? (item.count / totalTasks) * 100 : 0;
                const statusColors = getStatusColor(item.status);
                
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{item.count}</span>
                        <span className="text-xs text-gray-500">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={cn('h-2 rounded-full transition-all duration-500', item.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Priority Distribution
            </h3>
            
            <div className="space-y-4">
              {[
                { priority: 'critical', count: priorityCounts.critical, label: 'Critical', color: 'bg-red-400' },
                { priority: 'high', count: priorityCounts.high, label: 'High', color: 'bg-yellow-400' },
                { priority: 'medium', count: priorityCounts.medium, label: 'Medium', color: 'bg-blue-400' },
                { priority: 'low', count: priorityCounts.low, label: 'Low', color: 'bg-gray-400' },
              ].filter(item => item.count > 0).map((item) => {
                const percentage = totalTasks > 0 ? (item.count / totalTasks) * 100 : 0;
                
                return (
                  <div key={item.priority} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{item.count}</span>
                        <span className="text-xs text-gray-500">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={cn('h-2 rounded-full transition-all duration-500', item.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Activity */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Weekly Activity
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-32">
                {weeklyActivity.map((day, index) => {
                  const height = maxActivity > 0 ? (day.count / maxActivity) * 100 : 0;
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-400 rounded-t-sm mb-2 transition-all duration-500"
                        style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                      />
                      <span className="text-xs text-gray-400">{day.label}</span>
                      <span className="text-xs text-gray-500">{day.count}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-sm text-gray-400 text-center">
                Activity over the last 7 days
              </div>
            </div>
          </div>

          {/* Project Performance */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Project Performance
            </h3>
            
            <div className="space-y-4">
              {projectTaskDistribution.slice(0, 5).map((project) => {
                const completionRate = project.taskCount > 0 
                  ? (project.completedTasks / project.taskCount) * 100 
                  : 0;
                const stageColors = getStageColor(project.stage);
                
                return (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{project.icon}</span>
                        <span className="text-sm font-medium truncate">
                          {project.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {project.completedTasks}/{project.taskCount}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          stageColors.bg,
                          stageColors.text
                        )}>
                          {project.stage}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;