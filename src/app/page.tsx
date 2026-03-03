'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import TasksView from '@/components/TasksView';
import ProjectsView from '@/components/ProjectsView';
import AgentsView from '@/components/AgentsView';
import ContentView from '@/components/ContentView';
import ApprovalsView from '@/components/ApprovalsView';
import CouncilView from '@/components/CouncilView';
import CalendarView from '@/components/CalendarView';
import MemoryView from '@/components/MemoryView';
import DocsView from '@/components/DocsView';
import PeopleView from '@/components/PeopleView';
import TeamsView from '@/components/TeamsView';
import FactoryView from '@/components/FactoryView';
import TaskDetail from '@/components/TaskDetail';
import type { ViewType } from '@/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('projects');
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleBackToProjects = () => {
    setSelectedTaskId(null);
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setSelectedTaskId(null);
    setCurrentView('dashboard');
  };

  const renderMainContent = () => {
    if (selectedTaskId) {
      return (
        <TaskDetail
          taskId={selectedTaskId}
          onBack={handleBackToProjects}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView onViewChange={(v: string) => setCurrentView(v as ViewType)} onTaskSelect={handleTaskSelect} />;
      case 'tasks':
        return <TasksView onTaskSelect={handleTaskSelect} />;
      case 'projects':
        return <ProjectsView onProjectSelect={handleProjectSelect} onTaskSelect={handleTaskSelect} />;
      case 'agents':
        return <AgentsView />;
      case 'content':
        return <ContentView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'council':
        return <CouncilView />;
      case 'calendar':
        return <CalendarView />;
      case 'memory':
        return <MemoryView />;
      case 'docs':
        return <DocsView />;
      case 'people':
        return <PeopleView />;
      case 'teams':
        return <TeamsView />;
      case 'factory':
        return <FactoryView />;
      default:
        return <DashboardView onViewChange={(v: string) => setCurrentView(v as ViewType)} onTaskSelect={handleTaskSelect} />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-950 text-gray-100">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTaskId || currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderMainContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
