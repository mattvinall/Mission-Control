'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjects } from '@/lib/data';
import { cn, getPriorityColor, getStatusColor, getStageColor, formatTimeAgo } from '@/lib/utils';
import type { Project, Task, TaskStatus } from '@/types';
import {
  ArrowLeft, Plus, GripVertical, Flag, Clock, Tag,
  ChevronRight, Users, CheckCircle2, Circle, Layers,
  TrendingUp, BarChart3, Zap
} from 'lucide-react';

interface ProjectsViewProps {
  onProjectSelect: (projectId: string) => void;
  onTaskSelect: (taskId: string) => void;
}

// ─── Kanban column definitions ────────────────────────────────────────────────
const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'backlog',     label: 'Backlog',     color: 'text-gray-400',   bg: 'bg-gray-500/8',   dot: 'bg-gray-500' },
  { id: 'in-progress', label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/8', dot: 'bg-yellow-400' },
  { id: 'review',      label: 'Review',      color: 'text-blue-400',   bg: 'bg-blue-500/8',   dot: 'bg-blue-400' },
  { id: 'done',        label: 'Done',        color: 'text-green-400',  bg: 'bg-green-500/8',  dot: 'bg-green-400' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getProjectProgress(project: Project) {
  const tasks = project.tasks || [];
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const review = tasks.filter(t => t.status === 'review').length;
  const backlog = tasks.filter(t => t.status === 'backlog').length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  return { done, inProgress, review, backlog, total: tasks.length, pct };
}

function getUniqueAgents(tasks: Task[]): string[] {
  const agents = tasks.map(t => t.assignee).filter(Boolean) as string[];
  return [...new Set(agents)];
}

// ─── Priority dot ─────────────────────────────────────────────────────────────
const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-400',
  high: 'bg-yellow-400',
  critical: 'bg-red-400',
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProjectsView({ onProjectSelect, onTaskSelect }: ProjectsViewProps) {
  const projects = getProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => projects.find(p => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {selectedProject ? (
          <KanbanView
            key="kanban"
            project={selectedProject}
            onBack={() => setSelectedProjectId(null)}
            onTaskSelect={onTaskSelect}
          />
        ) : (
          <ProjectGrid
            key="grid"
            projects={projects}
            onSelectProject={setSelectedProjectId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Project Grid ─────────────────────────────────────────────────────────────
function ProjectGrid({
  projects,
  onSelectProject,
}: {
  projects: Project[];
  onSelectProject: (id: string) => void;
}) {
  const totalTasks = projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
  const totalDone = projects.reduce(
    (sum, p) => sum + (p.tasks?.filter(t => t.status === 'done').length || 0), 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="h-full overflow-y-auto p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <Layers className="h-8 w-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-gray-400 text-sm">
              {projects.length} active projects · {totalDone}/{totalTasks} tasks complete
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Projects', value: projects.filter(p => p.stage === 'in-progress').length, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Total Tasks', value: totalTasks, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'In Progress', value: projects.reduce((s, p) => s + (p.tasks?.filter(t => t.status === 'in-progress').length || 0), 0), icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Done', value: totalDone, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={i}
            onClick={() => onSelectProject(project.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Single project card ──────────────────────────────────────────────────────
function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const { done, inProgress, review, backlog, total, pct } = getProjectProgress(project);
  const agents = getUniqueAgents(project.tasks || []);
  const stageColors = getStageColor(project.stage);
  const priorityColors = getPriorityColor(project.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      onClick={onClick}
      className="group bg-gray-900/60 border border-gray-800 rounded-2xl p-5 cursor-pointer
                 hover:border-orange-500/40 hover:bg-gray-900/80 hover:shadow-lg hover:shadow-orange-500/5
                 transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{project.icon}</span>
          <div>
            <h3 className="font-bold text-base group-hover:text-orange-300 transition-colors leading-tight">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                stageColors.bg, stageColors.text
              )}>
                {project.stage}
              </span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                priorityColors.bg, priorityColors.text
              )}>
                {project.priority}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {project.description}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500">Progress</span>
          <span className={cn('font-bold', pct >= 75 ? 'text-green-400' : pct >= 40 ? 'text-yellow-400' : 'text-gray-300')}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: index * 0.07 + 0.3, duration: 0.6, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              pct >= 75 ? 'bg-gradient-to-r from-green-500 to-green-400' :
              pct >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                          'bg-gradient-to-r from-orange-500 to-orange-400'
            )}
          />
        </div>
      </div>

      {/* Stage pill counts */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {[
          { label: 'Backlog', count: backlog, color: 'text-gray-400', bg: 'bg-gray-500/10' },
          { label: 'Active', count: inProgress, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Review', count: review, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Done', count: done, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map(col => (
          <div key={col.label} className={cn('rounded-lg px-2 py-1.5 text-center', col.bg)}>
            <div className={cn('text-base font-bold leading-none', col.color)}>{col.count}</div>
            <div className="text-xs text-gray-600 mt-0.5 leading-none">{col.label}</div>
          </div>
        ))}
      </div>

      {/* Footer: agents + CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800/60">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-gray-600" />
          <div className="flex items-center gap-1">
            {agents.slice(0, 3).map(a => (
              <span key={a} className="text-sm" title={a.split(' ').slice(1).join(' ')}>
                {a.split(' ')[0]}
              </span>
            ))}
            {agents.length > 3 && (
              <span className="text-xs text-gray-500">+{agents.length - 3}</span>
            )}
          </div>
        </div>
        <span className="text-xs text-orange-400 font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
          Open Board <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.div>
  );
}

// ─── Kanban board view ────────────────────────────────────────────────────────
function KanbanView({
  project,
  onBack,
  onTaskSelect,
}: {
  project: Project;
  onBack: () => void;
  onTaskSelect: (taskId: string) => void;
}) {
  const tasks = project.tasks || [];
  const { done, inProgress, review, backlog, total, pct } = getProjectProgress(project);
  const agents = getUniqueAgents(tasks);
  const stageColors = getStageColor(project.stage);

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {
      backlog: [],
      'in-progress': [],
      review: [],
      done: [],
    };
    tasks.forEach(t => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Board header */}
      <div className="px-6 py-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Projects
            </button>
            <span className="text-gray-700">/</span>

            {/* Project identity */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{project.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{project.title}</h2>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    stageColors.bg, stageColors.text
                  )}>
                    {project.stage}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{project.description}</p>
              </div>
            </div>
          </div>

          {/* Right side stats */}
          <div className="flex items-center gap-6">
            {/* Progress */}
            <div className="text-right">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      pct >= 75 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      pct >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                  'bg-gradient-to-r from-orange-500 to-orange-400'
                    )}
                  />
                </div>
                <span className="text-sm font-bold text-white">{pct}%</span>
              </div>
              <p className="text-xs text-gray-500">{done}/{total} complete</p>
            </div>

            {/* Agents */}
            <div className="flex items-center gap-1.5">
              {agents.slice(0, 4).map(a => (
                <div
                  key={a}
                  title={a.split(' ').slice(1).join(' ')}
                  className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm"
                >
                  {a.split(' ')[0]}
                </div>
              ))}
              {agents.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-400">
                  +{agents.length - 4}
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Column count pills */}
      <div className="px-6 py-3 border-b border-gray-800/50 flex items-center gap-4 flex-shrink-0 bg-gray-950/50">
        {KANBAN_COLUMNS.map(col => {
          const count = tasksByColumn[col.id]?.length ?? 0;
          return (
            <div key={col.id} className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', col.dot)} />
              <span className={cn('text-xs font-medium', col.color)}>{col.label}</span>
              <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded-full">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-5 p-6 h-full min-w-max">
          {KANBAN_COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasksByColumn[col.id] || []}
              onTaskSelect={onTaskSelect}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Kanban column ─────────────────────────────────────────────────────────────
function KanbanColumn({
  column,
  tasks,
  onTaskSelect,
}: {
  column: (typeof KANBAN_COLUMNS)[number];
  tasks: Task[];
  onTaskSelect: (taskId: string) => void;
}) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col h-full">
      {/* Column header */}
      <div className={cn('rounded-xl p-3 mb-3 flex items-center justify-between', column.bg)}>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', column.dot)} />
          <span className={cn('font-semibold text-sm', column.color)}>{column.label}</span>
          <span className="text-xs text-gray-500 bg-gray-900/50 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 hover:bg-gray-800/50 rounded text-gray-600 hover:text-gray-300 transition-colors">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Task cards */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
        <AnimatePresence>
          {tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i}
              onSelect={onTaskSelect}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center">
            <span className="text-xs text-gray-600">No tasks</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Task card ────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  index,
  onSelect,
}: {
  task: Task;
  index: number;
  onSelect: (id: string) => void;
}) {
  const priorityColors = getPriorityColor(task.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      onClick={() => onSelect(task.id)}
      className="group bg-gray-900 border border-gray-800 rounded-xl p-3.5 cursor-pointer
                 hover:border-orange-500/40 hover:bg-gray-800/60 hover:shadow-md hover:shadow-black/20
                 transition-all duration-150"
    >
      {/* Top: grip + priority dot */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {/* Priority indicator */}
          <span className={cn(
            'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium',
            priorityColors.bg, priorityColors.text
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[task.priority])} />
            {task.priority[0].toUpperCase()}{task.priority.slice(1)}
          </span>
        </div>
        <GripVertical className="h-3.5 w-3.5 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-100 mb-3 leading-snug group-hover:text-white transition-colors">
        {task.title}
      </h4>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {task.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs text-gray-500 bg-gray-800/80 px-1.5 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-600">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: agent + time */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-800/60">
        {/* Assignee */}
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{task.assignee.split(' ')[0]}</span>
            <span className="text-xs text-gray-500 truncate max-w-[90px]">
              {task.assignee.split(' ').slice(1).join(' ')}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-600 italic">Unassigned</span>
        )}

        {/* Time in stage */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(task.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
