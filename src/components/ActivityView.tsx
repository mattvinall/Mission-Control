'use client';

import { getDashboardData } from '@/lib/data';
import { formatTimeAgo, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { 
  Activity as ActivityIcon,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { useState } from 'react';

type ActivityType = 'task' | 'complete' | 'note' | 'all';

const ActivityView = () => {
  const data = getDashboardData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredActivities = data.activityLog
    .filter(activity => {
      const matchesSearch = activity.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      
      let matchesTime = true;
      if (timeFilter !== 'all') {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - activityDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        switch (timeFilter) {
          case 'today':
            matchesTime = diffDays === 0;
            break;
          case 'week':
            matchesTime = diffDays <= 7;
            break;
          case 'month':
            matchesTime = diffDays <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesType && matchesTime;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'complete':
        return CheckCircle;
      case 'task':
        return Clock;
      case 'note':
        return FileText;
      default:
        return ActivityIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'complete':
        return 'text-green-400 bg-green-400/10';
      case 'task':
        return 'text-blue-400 bg-blue-400/10';
      case 'note':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof filteredActivities>);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ActivityIcon className="h-6 w-6 text-orange-400" />
          <h1 className="text-2xl font-bold">Activity Log</h1>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ActivityType)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              >
                <option value="all">All Types</option>
                <option value="task">Task Updates</option>
                <option value="complete">Completions</option>
                <option value="note">Notes</option>
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">
              {data.activityLog.filter(a => a.type === 'task').length}
            </div>
            <div className="text-sm text-gray-400">Task Updates</div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {data.activityLog.filter(a => a.type === 'complete').length}
            </div>
            <div className="text-sm text-gray-400">Completions</div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-400">
              {data.activityLog.filter(a => a.type === 'note').length}
            </div>
            <div className="text-sm text-gray-400">Notes</div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-400">
              {filteredActivities.length}
            </div>
            <div className="text-sm text-gray-400">Filtered Results</div>
          </div>
        </div>

        {/* Activity Feed */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <ActivityIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">No activity found</div>
            <div className="text-sm text-gray-600">
              {searchTerm || typeFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Activity will appear here as you work on tasks'
              }
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([dateString, activities]) => {
              const date = new Date(dateString);
              const isToday = date.toDateString() === new Date().toDateString();
              const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
              
              let dateLabel = formatDate(activities[0].timestamp);
              if (isToday) dateLabel = 'Today';
              if (isYesterday) dateLabel = 'Yesterday';

              return (
                <div key={dateString}>
                  {/* Date Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-400">
                        {dateLabel}
                      </h3>
                    </div>
                    <div className="flex-1 h-px bg-gray-800" />
                    <div className="text-xs text-gray-500">
                      {activities.length} {activities.length === 1 ? 'event' : 'events'}
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-3">
                    {activities.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      const colorClass = getActivityColor(activity.type);
                      
                      return (
                        <div
                          key={`${activity.timestamp}-${index}`}
                          className="flex items-start gap-4 p-4 bg-gray-900/30 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                        >
                          <div className={cn(
                            'p-2 rounded-lg flex-shrink-0',
                            colorClass
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300">
                              {activity.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                activity.type === 'complete' ? 'bg-green-500/10 text-green-400' :
                                activity.type === 'task' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-gray-500/10 text-gray-400'
                              )}>
                                {activity.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityView;