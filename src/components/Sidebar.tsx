'use client';

import { getDashboardData } from '@/lib/data';
import { cn, getStageColor } from '@/lib/utils';
import { 
  BarChart3,
  Activity,
  FolderOpen,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: 'dashboard' | 'projects' | 'activity' | 'stats') => void;
  onProjectSelect: (projectId: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onBackToDashboard: () => void;
}

const Sidebar = ({
  currentView,
  onViewChange,
  onProjectSelect,
  collapsed,
  onToggleCollapsed,
  onBackToDashboard,
}: SidebarProps) => {
  const data = getDashboardData();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
  ];

  return (
    <div className={cn(
      'bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-72'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        {!collapsed && (
          <>
            <span className="text-2xl">🐉</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold truncate">
                Hydra <span className="text-orange-400">Mission Control</span>
              </h1>
            </div>
          </>
        )}
        <button
          onClick={onToggleCollapsed}
          className="p-1.5 rounded-lg border border-gray-700 hover:border-orange-400 hover:text-orange-400 transition-colors flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* BHAG Card */}
      {!collapsed && (
        <div
          className="m-3 p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 cursor-pointer hover:border-orange-400 transition-colors"
          onClick={onBackToDashboard}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
            <Target className="h-3 w-3" />
            BHAG
          </div>
          <div className="text-sm font-bold leading-tight mb-1">
            {data.bhag.title}
          </div>
          <div className="text-xs text-gray-400 leading-tight">
            {data.bhag.description}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'hover:bg-gray-800',
                  isActive && 'bg-orange-500/10 border border-orange-500/20',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-orange-400' : 'text-gray-400'
                )} />
                {!collapsed && (
                  <span className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-orange-400' : 'text-gray-300'
                  )}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects List */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between px-3 py-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Projects
              </h3>
              <button className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-orange-400 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              {data.projects.map((project) => {
                const stageColors = getStageColor(project.stage);
                const taskCount = project.tasks?.length || 0;
                const doneCount = project.tasks?.filter(t => t.status === 'done').length || 0;
                
                return (
                  <button
                    key={project.id}
                    onClick={() => onProjectSelect(project.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors group"
                    title={`${project.title} (${doneCount}/${taskCount} tasks done)`}
                  >
                    <span className="text-lg flex-shrink-0">{project.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-left truncate">
                        {project.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          stageColors.bg,
                          stageColors.text
                        )}>
                          {project.stage}
                        </span>
                        <span className="text-xs text-gray-500">
                          {doneCount}/{taskCount}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                data.meta.agentStatus === 'active' ? 'bg-green-400' : 'bg-gray-500'
              )} />
              <span className="text-xs text-gray-400">
                Agent {data.meta.agentStatus}
              </span>
            </div>
            <div className="text-xs text-gray-500 leading-tight">
              {data.meta.currentTask}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className={cn(
              'w-3 h-3 rounded-full',
              data.meta.agentStatus === 'active' ? 'bg-green-400' : 'bg-gray-500'
            )} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;