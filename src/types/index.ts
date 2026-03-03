// ============================================================================
// MISSION CONTROL TYPES - Clean Rebuild
// ============================================================================

// ============================================================================
// NAVIGATION
// ============================================================================

export type ViewType = 
  | 'dashboard'
  | 'tasks'
  | 'agents'
  | 'content'
  | 'approvals'
  | 'council'
  | 'calendar'
  | 'projects'
  | 'memory'
  | 'docs'
  | 'people'
  | 'teams'
  | 'factory';

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
  badge?: number;
}

// ============================================================================
// CORE
// ============================================================================

export interface Meta {
  lastUpdated: string;
  agentStatus: 'active' | 'inactive' | 'busy';
  currentTask: string;
  lastSessionCompleted: string;
  sessionStart: string;
}

export interface BHAG {
  title: string;
  description: string;
  icon: string;
}

// ============================================================================
// TASKS
// ============================================================================

export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done' | 'discarded';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes?: string;
  pr?: string;
  dueDate?: string;
  projectId?: string;
  projectTitle?: string;
  projectIcon?: string;
  assignee?: string;
}

// ============================================================================
// PROJECTS
// ============================================================================

export type ProjectStage = 'idea' | 'planning' | 'in-progress' | 'review' | 'done' | 'paused';

export interface Project {
  id: string;
  title: string;
  icon: string;
  description: string;
  stage: ProjectStage;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  progress: number;
}

// ============================================================================
// AGENTS
// ============================================================================

export type AgentStatus = 'active' | 'idle' | 'busy' | 'error' | 'offline';

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  currentTask: string | null;
  model: string;
  totalRuns: number;
  totalCost: number;
  lastActive: string;
  capabilities: string[];
}

export interface AgentRun {
  id: string;
  agentId: string;
  task: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  tokensUsed: number;
  cost: number;
  model: string;
}

// ============================================================================
// CONTENT PIPELINE
// ============================================================================

export type ContentStage = 'idea' | 'draft' | 'review' | 'scheduled' | 'published';
export type ContentPlatform = 'linkedin' | 'x' | 'youtube' | 'blog' | 'newsletter';

export interface ContentPiece {
  id: string;
  title: string;
  platform: 'linkedin' | 'x' | 'youtube';
  type: 'post' | 'thread' | 'carousel' | 'video-script';
  stage: 'idea' | 'draft' | 'review' | 'scheduled' | 'published';
  content: string;
  scheduledDate: string | null;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

// ============================================================================
// APPROVALS
// ============================================================================

export type ApprovalType = 'content' | 'task' | 'decision' | 'deployment';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export interface ApprovalItem {
  id: string;
  type: 'content' | 'task' | 'decision' | 'deployment';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  context?: string;
}

// ============================================================================
// COUNCIL / DECISIONS
// ============================================================================

export type DecisionStatus = 'pending' | 'decided' | 'revisit';

export interface Decision {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'decided' | 'revisit';
  category: 'strategy' | 'product' | 'marketing' | 'technical' | 'operations';
  decidedAt: string | null;
  outcome: string | null;
  context: string;
  createdAt: string;
}

// ============================================================================
// CALENDAR
// ============================================================================

export type CalendarEventType = 'deadline' | 'content' | 'meeting' | 'milestone' | 'reminder';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'deadline' | 'content' | 'meeting' | 'milestone';
  date: string;
  endDate?: string;
  description?: string;
  color: string;
}

// ============================================================================
// MEMORY
// ============================================================================

export type MemoryCategory = 'fact' | 'decision' | 'preference' | 'context' | 'lesson' | 'system' | 'todo';

export interface MemoryEntry {
  id: string;
  category: 'fact' | 'decision' | 'preference' | 'context' | 'lesson' | 'system' | 'todo';
  key: string;
  value: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DOCS
// ============================================================================

export interface DocEntry {
  id: string;
  title: string;
  category: 'guide' | 'reference' | 'process' | 'architecture';
  description: string;
  lastUpdated: string;
  path: string;
}

// ============================================================================
// PEOPLE / CRM
// ============================================================================

export type ContactStatus = 'lead' | 'prospect' | 'qualified' | 'customer' | 'churned' | 'partner';

export interface Person {
  id: string;
  name: string;
  company: string;
  role: string;
  status: 'lead' | 'prospect' | 'client' | 'partner' | 'contact';
  lastInteraction: string;
  email?: string;
  linkedin?: string;
  notes?: string;
  tags: string[];
}

// ============================================================================
// TEAMS
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  type: 'human' | 'agent';
  role: string;
  emoji: string;
  status: 'active' | 'idle' | 'offline';
  reportsTo: string | null;
  currentFocus: string;
  capacity: number; // 0-100
  skills: string[];
}

// ============================================================================
// SOFTWARE FACTORY
// ============================================================================

export type FactoryStage = 'intake' | 'queued' | 'building' | 'qa' | 'shipping' | 'deployed';

export interface FactoryTask {
  id: string;
  title: string;
  stage: 'intake' | 'queued' | 'building' | 'qa' | 'shipping' | 'deployed';
  assignedAgent: string | null;
  pr?: string;
  branch?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startedAt: string | null;
  estimatedMinutes: number;
  progress: number; // 0-100
}

export interface FactoryMetrics {
  tasksCompletedToday: number;
  tasksInProgress: number;
  avgBuildTime: number;
  successRate: number;
  queueDepth: number;
}

export interface PipelineStage {
  id: FactoryStage;
  name: string;
  description: string;
  count: number;
  avgTime: number;
  isActive: boolean;
}

// ============================================================================
// ACTIVITY
// ============================================================================

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: 'task' | 'complete' | 'note' | 'agent' | 'system' | 'deploy' | 'decision';
  message: string;
  actor?: string;
  actorAvatar?: string;
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export interface DashboardData {
  meta: Meta;
  bhag: BHAG;
  projects: Project[];
  activityLog: ActivityLogEntry[];
}

export type StatusCounts = Record<TaskStatus, number>;
export type PriorityCounts = Record<TaskPriority, number>;

// ============================================================================
// TYPE ALIASES (for component compatibility)
// ============================================================================

export type Contact = Person;
export type Doc = DocEntry;
