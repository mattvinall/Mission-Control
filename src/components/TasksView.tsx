'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTasks } from '@/lib/data';
import { cn, getStatusColor, getPriorityColor } from '@/lib/utils';
import type { Task } from '@/types';
import { LayoutGrid, List, Plus, Calendar, Flag, Search, Filter, GripVertical } from 'lucide-react';

interface TasksViewProps {
  onTaskSelect: (taskId: string) => void;
}

const COLUMNS = [
  { id: 'backlog', name: 'Backlog', color: 'text-gray-400', bg: 'bg-gray-500/5' },
  { id: 'in-progress', name: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/5' },
  { id: 'review', name: 'Review', color: 'text-blue-400', bg: 'bg-blue-500/5' },
  { id: 'done', name: 'Done', color: 'text-green-400', bg: 'bg-green-500/5' },
] as const;

export default function TasksView({ onTaskSelect }: TasksViewProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  
  const allTasks = getAllTasks();
  
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const tasksByColumn = {
    backlog: filteredTasks.filter(t => t.status === 'backlog'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-gray-400 text-sm">
              {allTasks.length} total · {allTasks.filter(t => t.status === 'in-progress').length} in progress
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'kanban' ? 'bg-gray-800 text-orange-400' : 'text-gray-400 hover:text-white'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-gray-800 text-orange-400' : 'text-gray-400 hover:text-white'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'kanban' ? (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-6 h-full min-w-max"
            >
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id]}
                  onTaskSelect={onTaskSelect}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TaskList tasks={filteredTasks} onTaskSelect={onTaskSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks, onTaskSelect }: { 
  column: { id: string; name: string; color: string; bg: string };
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
}) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className={cn('rounded-lg p-3 mb-3', column.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={cn('font-semibold', column.color)}>{column.name}</h3>
            <span className="text-xs text-gray-500 bg-gray-900/50 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <button className="p-1 hover:bg-gray-800/50 rounded text-gray-500 hover:text-white transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onTaskSelect(task.id)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-orange-500/50 hover:bg-gray-800/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-lg">{task.projectIcon}</span>
              <GripVertical className="h-4 w-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <h4 className="font-medium text-sm mb-3 line-clamp-2">{task.title}</h4>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
                getPriorityColor(task.priority).bg,
                getPriorityColor(task.priority).text
              )}>
                <Flag className="h-3 w-3" />
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            
            {task.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-3 flex-wrap">
                {task.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-gray-600">+{task.tags.length - 2}</span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TaskList({ tasks, onTaskSelect }: { tasks: Task[]; onTaskSelect: (taskId: string) => void }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800 text-left text-xs uppercase text-gray-500">
            <th className="px-4 py-3 font-medium">Task</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Project</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onTaskSelect(task.id)}
              className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span>{task.projectIcon}</span>
                  <span className="font-medium text-sm">{task.title}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  getStatusColor(task.status).bg,
                  getStatusColor(task.status).text
                )}>
                  {task.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  getPriorityColor(task.priority).bg,
                  getPriorityColor(task.priority).text
                )}>
                  {task.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">{task.projectTitle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
