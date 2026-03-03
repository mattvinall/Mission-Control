'use client';

import { motion } from 'framer-motion';
import { getProjects, getAllTasks } from '@/lib/data';
import { cn, getStageColor, getPriorityColor, getStatusColor } from '@/lib/utils';
import { 
  Folder, Plus, Target, TrendingUp, CheckCircle2, Calendar,
  ArrowRight, MoreHorizontal, Users
} from 'lucide-react';

interface ProjectsViewProps {
  onProjectSelect: (projectId: string) => void;
  onTaskSelect: (taskId: string) => void;
}

export default function ProjectsView({ onProjectSelect, onTaskSelect }: ProjectsViewProps) {
  const projects = getProjects();
  const allTasks = getAllTasks();

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
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Folder className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-gray-400">{projects.length} projects · {allTasks.length} tasks</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, i) => {
          const tasks = project.tasks || [];
          const doneCount = tasks.filter(t => t.status === 'done').length;
          const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-blue-500/30 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{project.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      getStageColor(project.stage).bg,
                      getStageColor(project.stage).text
                    )}>
                      {project.stage}
                    </span>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-white transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{project.description}</p>
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>{doneCount}/{tasks.length} tasks done</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full',
                    getPriorityColor(project.priority).bg,
                    getPriorityColor(project.priority).text
                  )}>
                    {project.priority} priority
                  </span>
                </div>
              </div>
              
              {/* Recent Tasks */}
              <div className="space-y-2 mb-4">
                {tasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskSelect(task.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      task.status === 'done' ? 'bg-green-400' :
                      task.status === 'in-progress' ? 'bg-yellow-400' :
                      'bg-gray-600'
                    )} />
                    <span className={cn(
                      'text-sm truncate flex-1',
                      task.status === 'done' && 'line-through text-gray-500'
                    )}>
                      {task.title}
                    </span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      getPriorityColor(task.priority).bg,
                      getPriorityColor(task.priority).text
                    )}>
                      {task.priority[0].toUpperCase()}
                    </span>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <p className="text-xs text-gray-500 pl-2">+{tasks.length - 3} more tasks</p>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-500">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => onProjectSelect(project.id)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
