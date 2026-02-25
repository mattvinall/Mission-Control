// Types for Mission Control Dashboard

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'done' | 'discarded';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes?: string;
  pr?: string;
  dueDate?: string;
  // Extended properties that might be added when fetching tasks with project context
  projectId?: string;
  projectTitle?: string;
  projectIcon?: string;
}

export interface Project {
  id: string;
  title: string;
  icon: string;
  description: string;
  stage: 'idea' | 'planning' | 'in-progress' | 'review' | 'done' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

export interface BHAG {
  title: string;
  description: string;
  icon: string;
}

export interface ActivityLogEntry {
  timestamp: string;
  type: 'task' | 'complete' | 'note';
  message: string;
}

export interface Meta {
  lastUpdated: string;
  agentStatus: 'active' | 'inactive' | 'busy';
  currentTask: string;
  lastSessionCompleted: string;
  sessionStart: string;
}

export interface DashboardData {
  meta: Meta;
  bhag: BHAG;
  projects: Project[];
  activityLog: ActivityLogEntry[];
}

export type StatusCounts = {
  [K in Task['status']]: number;
};

export type PriorityCounts = {
  [K in Task['priority']]: number;
};