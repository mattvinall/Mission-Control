'use client';

import { getTaskById, getDashboardData } from '@/lib/data';
import { cn, getStatusColor, getPriorityColor, formatDate, formatTimeAgo } from '@/lib/utils';
import { 
  ArrowLeft, Calendar, Clock, Tag, ExternalLink, CheckCircle
} from 'lucide-react';

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
}

const TaskDetail = ({ taskId, onBack }: TaskDetailProps) => {
  const task = getTaskById(taskId);
  
  if (!task) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Task not found</div>
          <button
            onClick={onBack}
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(task.status);
  const priorityColors = getPriorityColor(task.priority);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            {task.projectIcon && <span className="text-2xl">{task.projectIcon}</span>}
            <div>
              <h1 className="text-2xl font-bold">{task.title}</h1>
              {task.projectTitle && (
                <p className="text-gray-400">{task.projectTitle}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Priority */}
            <div className="flex items-center gap-4">
              <span className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium',
                statusColors.bg, statusColors.text
              )}>
                {task.status}
              </span>
              <span className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium',
                priorityColors.bg, priorityColors.text
              )}>
                {task.priority} priority
              </span>
              {task.status === 'done' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {/* Notes */}
            {task.notes && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{task.notes}</p>
              </div>
            )}

            {/* PR Link */}
            {task.pr && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Pull Request</h3>
                <a
                  href={task.pr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Pull Request
                </a>
              </div>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-sm text-gray-400">{formatDate(task.createdAt)}</div>
                    <div className="text-xs text-gray-500">{formatTimeAgo(task.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-sm text-gray-400">{formatDate(task.updatedAt)}</div>
                    <div className="text-xs text-gray-500">{formatTimeAgo(task.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors">
                  Mark as Done
                </button>
                <button className="w-full px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                  Move to Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
