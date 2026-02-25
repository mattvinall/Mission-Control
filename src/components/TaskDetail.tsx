'use client';

import { getTaskById, getDashboardData } from '@/lib/data';
import { cn, getStatusColor, getPriorityColor, formatDate, formatTimeAgo } from '@/lib/utils';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
}

const TaskDetail = ({ taskId, onBack }: TaskDetailProps) => {
  const data = getDashboardData();
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
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // Find the project this task belongs to
  const project = data.projects.find(p => 
    p.tasks?.some(t => t.id === taskId)
  );

  const statusColors = getStatusColor(task.status);
  const priorityColors = getPriorityColor(task.priority);

  const statusOptions = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
    { value: 'discarded', label: 'Discarded' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              {project && (
                <span className="text-2xl">{project.icon}</span>
              )}
              <div>
                <h1 className="text-2xl font-bold">{task.title}</h1>
                {project && (
                  <p className="text-gray-400">{project.title}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Edit className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-800 text-red-400 hover:text-red-300 rounded-lg transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Priority */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium',
                  statusColors.bg,
                  statusColors.text
                )}>
                  {statusOptions.find(s => s.value === task.status)?.label || task.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium',
                  priorityColors.bg,
                  priorityColors.text
                )}>
                  {priorityOptions.find(p => p.value === task.priority)?.label || task.priority} Priority
                </span>
              </div>

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
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Notes */}
            {task.notes && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {task.notes}
                  </p>
                </div>
              </div>
            )}

            {/* PR Link */}
            {(task as any).pr && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Pull Request</h3>
                <a
                  href={(task as any).pr}
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
            {/* Quick Actions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors">
                  Mark as Done
                </button>
                <button className="w-full px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                  Move to Review
                </button>
                <button className="w-full px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                  Change Priority
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-sm text-gray-400">
                      {formatDate(task.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(task.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-sm text-gray-400">
                      {formatDate(task.updatedAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(task.updatedAt)}
                    </div>
                  </div>
                </div>

                {(task as any).dueDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Due Date</div>
                      <div className="text-sm text-gray-400">
                        {formatDate((task as any).dueDate)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <span className="text-sm">🆔</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Task ID</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {task.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Info */}
            {project && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Project</h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{project.icon}</span>
                  <div>
                    <div className="font-semibold">{project.title}</div>
                    <div className="text-sm text-gray-400">{project.description}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;