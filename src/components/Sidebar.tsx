'use client';

import { motion } from 'framer-motion';
import { getDashboardData } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { ViewType, NavGroup } from '@/types';
import { 
  Home, CheckSquare, Folder, Factory, Bot, Users, User,
  FileText, Calendar, CheckCircle, Gavel, Brain, BookOpen,
  ChevronLeft, ChevronRight, Target
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const navigationGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    ]
  },
  {
    label: 'Work',
    items: [
      { id: 'tasks', label: 'Tasks', icon: '✅' },
      { id: 'projects', label: 'Projects', icon: '📁' },
      { id: 'factory', label: 'Software Factory', icon: '🏭' },
    ]
  },
  {
    label: 'Team',
    items: [
      { id: 'agents', label: 'Agents', icon: '🤖' },
      { id: 'teams', label: 'Teams', icon: '👥' },
      { id: 'people', label: 'People', icon: '👤' },
    ]
  },
  {
    label: 'Content',
    items: [
      { id: 'content', label: 'Content', icon: '📝' },
      { id: 'calendar', label: 'Calendar', icon: '📅' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { id: 'approvals', label: 'Approvals', icon: '✔️' },
      { id: 'council', label: 'Council', icon: '⚖️' },
    ]
  },
  {
    label: 'Knowledge',
    items: [
      { id: 'memory', label: 'Memory', icon: '🧠' },
      { id: 'docs', label: 'Docs', icon: '📖' },
    ]
  },
];

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  collapsed, 
  onToggleCollapsed 
}: SidebarProps) {
  const data = getDashboardData();

  return (
    <div className={cn(
      'bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-72'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        {!collapsed && (
          <>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <span className="text-xl">🐉</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold truncate">
                Hydra <span className="text-orange-400">Mission Control</span>
              </h1>
              <p className="text-xs text-gray-500">Command Center</p>
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-3 p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 cursor-pointer hover:border-orange-400 transition-colors"
          onClick={() => onViewChange('dashboard')}
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
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-3 space-y-6">
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {/* Group Label */}
              {!collapsed && (
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: groupIndex * 0.05 }}
                  className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2"
                >
                  {group.label}
                </motion.h3>
              )}
              
              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  const isActive = currentView === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIndex * group.items.length + itemIndex) * 0.02 }}
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                        'hover:bg-gray-800',
                        isActive && 'bg-orange-500/10 border border-orange-500/20',
                        collapsed && 'justify-center'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={cn(
                        'text-lg flex-shrink-0',
                        isActive ? 'scale-110' : 'scale-100'
                      )}>
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className={cn(
                          'text-sm font-medium',
                          isActive ? 'text-orange-400' : 'text-gray-300'
                        )}>
                          {item.label}
                        </span>
                      )}
                      {item.badge && !collapsed && (
                        <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Agent Status */}
      <div className="p-4 border-t border-gray-800">
        {!collapsed ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                data.meta.agentStatus === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
              )} />
              <span className="text-xs text-gray-400 capitalize">
                Hydra {data.meta.agentStatus}
              </span>
            </div>
            <div className="text-xs text-gray-500 leading-tight line-clamp-2">
              {data.meta.currentTask}
            </div>
            <div className="text-xs text-gray-600">
              Last update: {new Date(data.meta.lastUpdated).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center">
            <div className={cn(
              'w-3 h-3 rounded-full',
              data.meta.agentStatus === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            )} />
          </div>
        )}
      </div>
    </div>
  );
}