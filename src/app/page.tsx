'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import ProjectsView from '@/components/ProjectsView';
import TaskDetail from '@/components/TaskDetail';
import ActivityView from '@/components/ActivityView';
import StatsView from '@/components/StatsView';

export type View = 'dashboard' | 'projects' | 'activity' | 'stats';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
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
        return (
          <DashboardView
            onProjectSelect={handleProjectSelect}
            onTaskSelect={handleTaskSelect}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            selectedProjectId={selectedProjectId}
            onProjectSelect={handleProjectSelect}
            onTaskSelect={handleTaskSelect}
          />
        );
      case 'activity':
        return <ActivityView />;
      case 'stats':
        return <StatsView />;
      default:
        return (
          <DashboardView
            onProjectSelect={handleProjectSelect}
            onTaskSelect={handleTaskSelect}
          />
        );
    }
  };

  return (
    <div className="h-screen flex bg-gray-950 text-gray-100">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onProjectSelect={handleProjectSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        onBackToDashboard={handleBackToDashboard}
      />
      
      <main className="flex-1 overflow-hidden">
        {renderMainContent()}
      </main>
    </div>
  );
}