import type { DashboardData, StatusCounts, PriorityCounts, Task } from '@/types';
import dashboardData from '../../data.json';

export function getDashboardData(): DashboardData {
  return dashboardData as DashboardData;
}

export function getAllTasks(): Task[] {
  const data = getDashboardData();
  const allTasks: Task[] = [];
  
  for (const project of data.projects) {
    for (const task of project.tasks || []) {
      allTasks.push({
        ...task,
        // Add project context for filtering/display
        projectId: project.id,
        projectTitle: project.title,
        projectIcon: project.icon,
      } as Task & { projectId: string; projectTitle: string; projectIcon: string });
    }
  }
  
  return allTasks;
}

export function getTasksByStatus(status: Task['status']): Task[] {
  return getAllTasks().filter(task => task.status === status);
}

export function getTasksByPriority(priority: Task['priority']): Task[] {
  return getAllTasks().filter(task => task.priority === priority);
}

export function getStatusCounts(): StatusCounts {
  const allTasks = getAllTasks();
  
  return {
    backlog: allTasks.filter(t => t.status === 'backlog').length,
    'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
    review: allTasks.filter(t => t.status === 'review').length,
    done: allTasks.filter(t => t.status === 'done').length,
    discarded: allTasks.filter(t => t.status === 'discarded').length,
  };
}

export function getPriorityCounts(): PriorityCounts {
  const allTasks = getAllTasks();
  
  return {
    low: allTasks.filter(t => t.priority === 'low').length,
    medium: allTasks.filter(t => t.priority === 'medium').length,
    high: allTasks.filter(t => t.priority === 'high').length,
    critical: allTasks.filter(t => t.priority === 'critical').length,
  };
}

export function getTaskById(taskId: string): Task | null {
  const allTasks = getAllTasks();
  return allTasks.find(task => task.id === taskId) || null;
}

export function getProjectById(projectId: string) {
  const data = getDashboardData();
  return data.projects.find(project => project.id === projectId) || null;
}

export function getCompletionRate(): number {
  const statusCounts = getStatusCounts();
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  return total > 0 ? Math.round((statusCounts.done / total) * 100) : 0;
}

export function getRecentActivity(limit: number = 10) {
  const data = getDashboardData();
  return data.activityLog
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}