'use client';

import { useState } from 'react';
import { getDashboardData } from '@/lib/data';
import { cn, getStatusColor, getPriorityColor, getStageColor, formatDate } from '@/lib/utils';
import type { Task } from '@/types';
import { 
  FolderOpen, 
  Filter, 
  Search,
  Grid,
  List,
  Plus,
  ChevronDown
} from 'lucide-react';

interface ProjectsViewProps {
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onTaskSelect: (taskId: string) => void;
}

const ProjectsView = ({ 
  selectedProjectId, 
  onProjectSelect, 
  onTaskSelect 
}: ProjectsViewProps) => {
  const data = getDashboardData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // If a specific project is selected, show its tasks
  if (selectedProjectId) {
    const project = data.projects.find(p => p.id === selectedProjectId);
    if (!project) {
      return <div className="p-6">Project not found</div>;
    }

    const filteredTasks = (project.tasks || []).filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
      <div className="h-full flex flex-col">
        {/* Project Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{project.icon}</span>
              <div>
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <p className="text-gray-400">{project.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn(
                    'text-xs px-3 py-1 rounded-full font-medium',
                    getStageColor(project.stage).bg,
                    getStageColor(project.stage).text
                  )}>
                    {project.stage}
                  </span>
                  <span className={cn(
                    'text-xs px-3 py-1 rounded-full font-medium',
                    getPriorityColor(project.priority).bg,
                    getPriorityColor(project.priority).text
                  )}>
                    {project.priority} priority
                  </span>
                  <span className="text-xs text-gray-500">
                    {filteredTasks.filter(t => t.status === 'done').length} / {project.tasks?.length || 0} tasks completed
                  </span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'px-3 py-2 border border-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                showFilters ? 'bg-gray-700' : 'hover:bg-gray-800'
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                showFilters && 'rotate-180'
              )} />
            </button>

            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 text-sm transition-colors',
                  viewMode === 'grid' ? 'bg-gray-700' : 'hover:bg-gray-800'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 text-sm transition-colors',
                  viewMode === 'list' ? 'bg-gray-700' : 'hover:bg-gray-800'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="flex items-center gap-4 mt-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="backlog">Backlog</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="discarded">Discarded</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No tasks found</div>
              <div className="text-sm text-gray-600">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'
                }
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => {
                const statusColors = getStatusColor(task.status);
                const priorityColors = getPriorityColor(task.priority);
                
                return (
                  <div
                    key={task.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 cursor-pointer transition-all group"
                    onClick={() => onTaskSelect(task.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full font-medium',
                          statusColors.bg,
                          statusColors.text
                        )}>
                          {task.status}
                        </span>
                      </div>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full font-medium',
                        priorityColors.bg,
                        priorityColors.text
                      )}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold mb-2 group-hover:text-orange-300 transition-colors">
                      {task.title}
                    </h3>
                    
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created {formatDate(task.createdAt)}</span>
                      {task.tags.length > 0 && (
                        <div className="flex gap-1">
                          {task.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-800 px-1.5 py-0.5 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-gray-600">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const statusColors = getStatusColor(task.status);
                const priorityColors = getPriorityColor(task.priority);
                
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 cursor-pointer transition-all group"
                    onClick={() => onTaskSelect(task.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full font-medium flex-shrink-0',
                        statusColors.bg,
                        statusColors.text
                      )}>
                        {task.status}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-orange-300 transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          {task.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full font-medium',
                        priorityColors.bg,
                        priorityColors.text
                      )}>
                        {task.priority}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show all projects view
  const filteredProjects = data.projects.filter(project => {
    return project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           project.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-6 w-6 text-orange-400" />
            <h1 className="text-2xl font-bold">Projects</h1>
          </div>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const taskCount = project.tasks?.length || 0;
            const doneCount = project.tasks?.filter(t => t.status === 'done').length || 0;
            const progress = taskCount > 0 ? (doneCount / taskCount) * 100 : 0;
            const stageColors = getStageColor(project.stage);

            return (
              <div
                key={project.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 cursor-pointer transition-all group"
                onClick={() => onProjectSelect(project.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{project.icon}</span>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    stageColors.bg,
                    stageColors.text
                  )}>
                    {project.stage}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-orange-300 transition-colors">
                  {project.title}
                </h3>

                <p className="text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-gray-300">{doneCount}/{taskCount} tasks</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Updated {formatDate(project.updatedAt)}</span>
                    <span className={cn(
                      'px-2 py-1 rounded-full',
                      getPriorityColor(project.priority).bg,
                      getPriorityColor(project.priority).text
                    )}>
                      {project.priority}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No projects found</div>
            <div className="text-sm text-gray-600">
              {searchTerm ? 'Try a different search term' : 'Create your first project to get started'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;