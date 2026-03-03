import type { 
  DashboardData, Task, Project, Agent, AgentRun, ContentPiece, 
  ApprovalItem, Decision, CalendarEvent, MemoryEntry, Doc, 
  Contact, TeamMember, FactoryTask, FactoryMetrics, PipelineStage,
  ActivityLogEntry
} from '@/types';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const now = new Date();

export function getDashboardData(): DashboardData {
  return {
    meta: {
      lastUpdated: now.toISOString(),
      agentStatus: 'active',
      currentTask: 'DFY client acquisition, beta testers, test campaigns. Orchestration layer LIVE.',
      lastSessionCompleted: now.toISOString(),
      sessionStart: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    },
    bhag: {
      title: '$10M ARR, 1 Employee',
      description: 'Build Pipeline to $10M ARR as a solo founder with AI leverage',
      icon: '🎯',
    },
    projects: getProjects(),
    activityLog: getActivityLog(),
  };
}

export function getProjects(): Project[] {
  return [
    {
      id: 'proj-pipeline',
      title: 'Pipeline Dev',
      icon: '🚀',
      description: 'Engineering, product, and infrastructure work for Pipeline.',
      stage: 'in-progress',
      priority: 'critical',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updatedAt: now.toISOString(),
      progress: 78,
      tasks: [
        { id: 't1', title: 'HubSpot CRM Integration', description: 'Build OAuth and sync', status: 'in-progress', priority: 'critical', createdAt: now.toISOString(), updatedAt: now.toISOString(), tags: ['crm', 'integration'], projectId: 'proj-pipeline', projectTitle: 'Pipeline Dev', projectIcon: '🚀' },
        { id: 't2', title: 'Beta Launch Prep', description: 'Final QA and docs', status: 'review', priority: 'critical', createdAt: now.toISOString(), updatedAt: now.toISOString(), tags: ['beta', 'launch'], projectId: 'proj-pipeline', projectTitle: 'Pipeline Dev', projectIcon: '🚀' },
        { id: 't3', title: 'Performance Optimization', description: 'Speed improvements', status: 'backlog', priority: 'high', createdAt: now.toISOString(), updatedAt: now.toISOString(), tags: ['perf'], projectId: 'proj-pipeline', projectTitle: 'Pipeline Dev', projectIcon: '🚀' },
      ],
    },
    {
      id: 'proj-gtm',
      title: 'GTM & Marketing',
      icon: '📣',
      description: 'Content, landing pages, email sequences, YouTube.',
      stage: 'in-progress',
      priority: 'critical',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      updatedAt: now.toISOString(),
      progress: 65,
      tasks: [
        { id: 't4', title: 'YouTube Channel Setup', description: 'Create and brand channel', status: 'in-progress', priority: 'high', createdAt: now.toISOString(), updatedAt: now.toISOString(), tags: ['youtube'], projectId: 'proj-gtm', projectTitle: 'GTM & Marketing', projectIcon: '📣' },
        { id: 't5', title: 'Cold Traffic Offer', description: 'Create offer doc', status: 'done', priority: 'critical', createdAt: now.toISOString(), updatedAt: now.toISOString(), tags: ['offer'], projectId: 'proj-gtm', projectTitle: 'GTM & Marketing', projectIcon: '📣' },
      ],
    },
    {
      id: 'proj-mission',
      title: 'Mission Control',
      icon: '🎮',
      description: 'Internal dashboard for managing AI agents and operations.',
      stage: 'in-progress',
      priority: 'high',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updatedAt: now.toISOString(),
      progress: 45,
      tasks: [
        { id: 't6', title: 'Software Factory View', description: 'Build dev pipeline viz', status: 'in-progress', priority: 'high', createdAt: now.toISOString(), updatedAt: now.toISOString(), tags: ['ui'], projectId: 'proj-mission', projectTitle: 'Mission Control', projectIcon: '🎮' },
      ],
    },
  ];
}

export function getAllTasks(): Task[] {
  const projects = getProjects();
  const tasks: Task[] = [];
  projects.forEach(p => {
    p.tasks.forEach(t => {
      tasks.push({ ...t, projectTitle: p.title, projectIcon: p.icon });
    });
  });
  return tasks;
}

export function getTasksByStatus(status: Task['status']): Task[] {
  return getAllTasks().filter(t => t.status === status);
}

export function getStatusCounts() {
  const all = getAllTasks();
  return {
    backlog: all.filter(t => t.status === 'backlog').length,
    'in-progress': all.filter(t => t.status === 'in-progress').length,
    review: all.filter(t => t.status === 'review').length,
    done: all.filter(t => t.status === 'done').length,
    discarded: all.filter(t => t.status === 'discarded').length,
  };
}

export function getPriorityCounts() {
  const all = getAllTasks();
  return {
    low: all.filter(t => t.priority === 'low').length,
    medium: all.filter(t => t.priority === 'medium').length,
    high: all.filter(t => t.priority === 'high').length,
    critical: all.filter(t => t.priority === 'critical').length,
  };
}

export function getCompletionRate(): number {
  const counts = getStatusCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return total > 0 ? Math.round((counts.done / total) * 100) : 0;
}

export function getAgents(): Agent[] {
  return [
    {
      id: 'agent-hydra',
      name: 'Hydra',
      emoji: '🐉',
      status: 'active',
      currentTask: 'Coordinating multi-agent workflow',
      lastActive: now.toISOString(),
      totalRuns: 1247,
      totalCost: 89.32,
      model: 'claude-sonnet-4-5',
      capabilities: ['Task Planning', 'Code Review', 'Research', 'Content Strategy'],
    },
    {
      id: 'agent-marketing',
      name: 'Marketing Agent',
      emoji: '📣',
      status: 'busy',
      currentTask: 'Generating LinkedIn content calendar',
      lastActive: now.toISOString(),
      totalRuns: 892,
      totalCost: 67.45,
      model: 'claude-sonnet-4-5',
      capabilities: ['Content Creation', 'Social Media', 'SEO', 'Campaign Planning'],
    },
    {
      id: 'agent-dev',
      name: 'Dev Agent',
      emoji: '⚡',
      status: 'busy',
      currentTask: 'Building CRM integration for Pipedrive',
      lastActive: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
      totalRuns: 2156,
      totalCost: 156.78,
      model: 'claude-sonnet-4-5',
      capabilities: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    },
    {
      id: 'agent-research',
      name: 'Research Agent',
      emoji: '🔬',
      status: 'idle',
      currentTask: null,
      lastActive: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      totalRuns: 543,
      totalCost: 34.21,
      model: 'claude-sonnet-4-5',
      capabilities: ['Web Scraping', 'Data Analysis', 'Competitive Research'],
    },
    {
      id: 'agent-support',
      name: 'Support Agent',
      emoji: '🎧',
      status: 'active',
      currentTask: 'Drafting documentation for new feature',
      lastActive: now.toISOString(),
      totalRuns: 328,
      totalCost: 23.44,
      model: 'claude-sonnet-4-5',
      capabilities: ['Documentation', 'FAQ Generation', 'User Guides'],
    },
  ];
}

export function getAgentRuns(limit = 10): AgentRun[] {
  return ([
    { id: 'r1', agentId: 'agent-dev', task: 'HubSpot OAuth implementation', status: 'completed' as const, startedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), completedAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), tokensUsed: 12400, cost: 0.84, model: 'claude-sonnet-4-5' },
    { id: 'r2', agentId: 'agent-marketing', task: 'YouTube script: AI Agents', status: 'completed' as const, startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), completedAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), tokensUsed: 18200, cost: 1.23, model: 'claude-sonnet-4-5' },
    { id: 'r3', agentId: 'agent-hydra', task: 'Optimize task distribution', status: 'running' as const, startedAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(), completedAt: null, tokensUsed: 2200, cost: 0.15, model: 'claude-sonnet-4-5' },
    { id: 'r4', agentId: 'agent-research', task: 'Competitor pricing analysis', status: 'completed' as const, startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), tokensUsed: 9800, cost: 0.67, model: 'claude-sonnet-4-5' },
    { id: 'r5', agentId: 'agent-dev', task: 'Fix P0 auth tests', status: 'completed' as const, startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), tokensUsed: 13600, cost: 0.92, model: 'claude-sonnet-4-5' },
    { id: 'r6', agentId: 'agent-marketing', task: 'Twitter thread on automation', status: 'running' as const, startedAt: new Date(now.getTime() - 1000 * 60 * 3).toISOString(), completedAt: null, tokensUsed: 1200, cost: 0.08, model: 'claude-sonnet-4-5' },
    { id: 'r7', agentId: 'agent-support', task: 'API documentation updates', status: 'completed' as const, startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), tokensUsed: 6700, cost: 0.45, model: 'claude-sonnet-4-5' },
  ] as AgentRun[]).slice(0, limit);
}

export function getContentPipeline(): ContentPiece[] {
  return [
    { id: 'c1', title: 'Why AI Agents Will Replace Your SDR Team', platform: 'linkedin', type: 'post', stage: 'published', content: 'AI agents are transforming SDR workflows...', publishedDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), scheduledDate: null, metrics: { views: 12400, likes: 234, comments: 45, shares: 12 }, createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 'c2', title: 'The $10M Solo Founder Playbook', platform: 'youtube', type: 'video-script', stage: 'scheduled', content: 'Script for YouTube video on solo founder growth...', scheduledDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3).toISOString(), publishedDate: null, createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), updatedAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString() },
    { id: 'c3', title: 'Pipeline vs Clay: Honest Comparison', platform: 'x', type: 'thread', stage: 'review', content: 'Thread comparing Pipeline vs Clay...', scheduledDate: null, publishedDate: null, createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), updatedAt: now.toISOString() },
    { id: 'c4', title: 'How We Use AI to Write 30 Posts/Day', platform: 'linkedin', type: 'carousel', stage: 'draft', content: 'Behind-the-scenes look at our content workflow...', scheduledDate: null, publishedDate: null, createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'c5', title: "Agency Owner's Guide to LinkedIn Automation", platform: 'linkedin', type: 'post', stage: 'idea', content: 'Comprehensive guide for agency owners...', scheduledDate: null, publishedDate: null, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: 'c6', title: '5 LinkedIn Safety Tips', platform: 'youtube', type: 'video-script', stage: 'draft', content: 'Video script covering LinkedIn safety best practices...', scheduledDate: null, publishedDate: null, createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(), updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString() },
  ];
}

export function getPendingApprovals(): ApprovalItem[] {
  return [
    { id: 'a1', type: 'content', title: 'Publish X thread: Pipeline vs Clay', description: 'Marketing Agent drafted comparison thread', submittedBy: 'Marketing Agent', submittedAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), status: 'pending', urgency: 'medium', context: 'Competitor comparison highlighting unique features' },
    { id: 'a2', type: 'decision', title: 'Approve $500/mo Firecrawl API', description: 'Research Agent needs more scraping capacity', submittedBy: 'Research Agent', submittedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), status: 'pending', urgency: 'high', context: 'Spider-RS hitting rate limits at scale' },
    { id: 'a3', type: 'deployment', title: 'Auto-escalate LinkedIn restrictions', description: 'Auto-pause campaigns on restriction detect', submittedBy: 'Dev Agent', submittedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), status: 'pending', urgency: 'high', context: 'Prevents account bans' },
  ];
}

export function getDecisions(): Decision[] {
  return [
    { id: 'd1', title: 'Pivot ICP from agencies to vibe coders', description: 'Switch target customer from agencies to technical founders and vibe coders', context: 'Better retention with technical founders', decidedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), status: 'decided', outcome: '3x better retention with founders vs agencies', category: 'strategy', createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString() },
    { id: 'd2', title: 'Remove DIY unlimited, focus on DFY', description: 'Discontinue DIY unlimited plan and focus resources on Done-For-You service', context: 'DFY has 5x LTV, less support burden', decidedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12).toISOString(), status: 'decided', outcome: '$5K/mo DFY beats $99/mo DIY', category: 'strategy', createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString() },
    { id: 'd3', title: 'Invest in Research Agent', description: 'Allocate budget and resources to expand Research Agent capabilities', context: 'Users want AI research but BYOK is friction', decidedAt: null, status: 'pending', outcome: null, category: 'product', createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  ];
}

export function getCalendarEvents(): CalendarEvent[] {
  return [
    { id: 'cal1', title: 'LinkedIn post: AI SDRs', type: 'content', date: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(), description: 'Scheduled post', color: '#3b82f6' },
    { id: 'cal2', title: 'YouTube: $10M Playbook', type: 'content', date: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3).toISOString(), description: 'Video goes live', color: '#8b5cf6' },
    { id: 'cal3', title: 'Beta Launch Deadline', type: 'deadline', date: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString(), description: 'Public beta launch', color: '#ef4444' },
  ];
}

export function getMemoryEntries(): MemoryEntry[] {
  return [
    { id: 'm1', category: 'decision', key: 'icp_pivot', value: 'Pivoted from agencies to vibe coders based on 3x better retention', tags: ['icp', 'strategy'], createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString() },
    { id: 'm2', category: 'preference', key: 'content_tone', value: 'Educational, not promotional. Focus on LinkedIn fundamentals.', tags: ['content', 'voice'], createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(), updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14).toISOString() },
    { id: 'm3', category: 'fact', key: 'clay_pricing', value: 'Clay: $149 Starter, $379 Explorer, $799 Enterprise. Unlimited at $379+', tags: ['competitor', 'pricing'], createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(), updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString() },
    { id: 'm4', category: 'lesson', key: 'linkedin_limits', value: 'Daily: 20-25 connections, 50-60 messages for new accounts', tags: ['linkedin', 'safety'], createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60).toISOString(), updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60).toISOString() },
  ];
}

export function getDocs(): Doc[] {
  return [
    { id: 'doc1', title: 'Agent Orchestration Guide', description: 'How Hydra coordinates tasks', category: 'architecture', lastUpdated: '2026-02-20T10:00:00Z', path: '/docs/agent-orchestration' },
    { id: 'doc2', title: 'LinkedIn Safety Framework', description: 'Safe automation best practices', category: 'process', lastUpdated: '2026-02-15T14:30:00Z', path: '/docs/linkedin-safety' },
    { id: 'doc3', title: 'Content Strategy Playbook', description: 'Content at scale', category: 'guide', lastUpdated: '2026-02-18T09:00:00Z', path: '/docs/content-strategy' },
    { id: 'doc4', title: 'API Reference', description: 'Complete API docs', category: 'reference', lastUpdated: '2026-02-22T16:00:00Z', path: '/docs/api-reference' },
  ];
}

export function getContacts(): Contact[] {
  return [
    { id: 'con1', name: 'Sarah Chen', company: 'TechFlow Agency', role: 'Founder', email: 'sarah@techflow.io', linkedin: 'linkedin.com/in/sarahchen', status: 'prospect', lastInteraction: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), notes: 'Interested in DFY. Budget $5K/mo confirmed.', tags: ['agency', 'dfy', 'warm'] },
    { id: 'con2', name: 'Marcus Johnson', company: 'GrowthLabs', role: 'Head of Sales', email: 'marcus@growthlabs.co', status: 'prospect', lastInteraction: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), notes: 'Scaling for 10 SDRs', tags: ['enterprise', 'scale'] },
    { id: 'con3', name: 'Emily Rodriguez', company: 'SoloFounder', role: 'Solo Founder', linkedin: 'linkedin.com/in/emilyr', status: 'lead', lastInteraction: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), notes: 'Vibe coder, AI tools', tags: ['founder', 'icp'] },
  ];
}

export function getTeamMembers(): TeamMember[] {
  return [
    { id: 'tm-matt', name: 'Matt Vinall', role: 'Founder & CEO', emoji: '👤', type: 'human', status: 'active', reportsTo: null, capacity: 85, currentFocus: 'Product strategy and sales', skills: ['Strategy', 'Product', 'Sales'] },
    { id: 'tm-hydra', name: 'Hydra', role: 'AI Orchestrator', emoji: '🐉', type: 'agent', status: 'active', reportsTo: 'tm-matt', capacity: 72, currentFocus: 'Coordinating multi-agent workflows', skills: ['Planning', 'Coordination'] },
    { id: 'tm-marketing', name: 'Marketing Agent', role: 'Growth Engineer', emoji: '📣', type: 'agent', status: 'active', reportsTo: 'tm-hydra', capacity: 90, currentFocus: 'Generating LinkedIn content calendar', skills: ['Content', 'SEO', 'Social'] },
    { id: 'tm-dev', name: 'Dev Agent', role: 'Software Engineer', emoji: '⚡', type: 'agent', status: 'active', reportsTo: 'tm-hydra', capacity: 95, currentFocus: 'Building CRM integration for Pipedrive', skills: ['TypeScript', 'React', 'Node'] },
    { id: 'tm-research', name: 'Research Agent', role: 'Intelligence', emoji: '🔬', type: 'agent', status: 'idle', reportsTo: 'tm-hydra', capacity: 45, currentFocus: 'Competitor analysis', skills: ['Research', 'Analysis'] },
    { id: 'tm-support', name: 'Support Agent', role: 'Customer Success', emoji: '🎧', type: 'agent', status: 'active', reportsTo: 'tm-hydra', capacity: 60, currentFocus: 'API documentation updates', skills: ['Docs', 'Support'] },
  ];
}

export function getFactoryTasks(): FactoryTask[] {
  return [
    { id: 'f1', title: 'HubSpot CRM Integration', stage: 'building', priority: 'critical', assignedAgent: 'agent-dev', pr: '#', branch: 'feature/hubspot', startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), estimatedMinutes: 480, progress: 55 },
    { id: 'f2', title: 'Fix: P0 auth middleware', stage: 'qa', priority: 'critical', assignedAgent: 'agent-dev', pr: '#', branch: 'fix/auth', startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), estimatedMinutes: 60, progress: 80 },
    { id: 'f3', title: 'AI Voice Notes Feature', stage: 'queued', priority: 'high', assignedAgent: null, startedAt: null, estimatedMinutes: 240, progress: 0 },
    { id: 'f4', title: 'Add Apollo.io provider', stage: 'intake', priority: 'medium', assignedAgent: null, startedAt: null, estimatedMinutes: 120, progress: 0 },
    { id: 'f5', title: 'Update landing page copy', stage: 'shipping', priority: 'high', assignedAgent: 'agent-marketing', pr: '#', branch: 'update/landing', startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), estimatedMinutes: 30, progress: 90 },
    { id: 'f6', title: 'Competitor analysis', stage: 'deployed', priority: 'medium', assignedAgent: 'agent-research', startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), estimatedMinutes: 90, progress: 100 },
    { id: 'f7', title: 'API v2 documentation', stage: 'building', priority: 'medium', assignedAgent: 'agent-support', branch: 'docs/api-v2', startedAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), estimatedMinutes: 300, progress: 40 },
  ];
}

export function getFactoryMetrics(): FactoryMetrics {
  return {
    tasksCompletedToday: 12,
    tasksInProgress: 4,
    avgBuildTime: 45,
    successRate: 96,
    queueDepth: 8,
  };
}

export function getPipelineStages(): PipelineStage[] {
  const tasks = getFactoryTasks();
  return [
    { id: 'intake', name: 'Intake', description: 'New tasks', count: tasks.filter(t => t.stage === 'intake').length, avgTime: 5, isActive: false },
    { id: 'queued', name: 'Queued', description: 'Prioritized', count: tasks.filter(t => t.stage === 'queued').length, avgTime: 120, isActive: false },
    { id: 'building', name: 'Build', description: 'Coding', count: tasks.filter(t => t.stage === 'building').length, avgTime: 180, isActive: true },
    { id: 'qa', name: 'QA', description: 'Testing', count: tasks.filter(t => t.stage === 'qa').length, avgTime: 30, isActive: true },
    { id: 'shipping', name: 'Ship', description: 'Deploying', count: tasks.filter(t => t.stage === 'shipping').length, avgTime: 10, isActive: true },
    { id: 'deployed', name: 'Done', description: 'Live', count: tasks.filter(t => t.stage === 'deployed').length, avgTime: 0, isActive: false },
  ];
}

export function getActivityLog(): ActivityLogEntry[] {
  return [
    { id: 'act1', timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), type: 'agent', message: 'Dev Agent completed HubSpot OAuth implementation', actor: 'Dev Agent', actorAvatar: '⚡' },
    { id: 'act2', timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), type: 'complete', message: 'Marketing Agent finished YouTube script', actor: 'Marketing Agent', actorAvatar: '📣' },
    { id: 'act3', timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), type: 'deploy', message: 'Deployed landing page copy updates', actor: 'Dev Agent', actorAvatar: '⚡' },
    { id: 'act4', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), type: 'decision', message: 'Approved pivot to vibe coder ICP', actor: 'Matt Vinall', actorAvatar: '👤' },
    { id: 'act5', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), type: 'system', message: 'P0 tests passing: 31/32' },
  ];
}

export function getTaskById(taskId: string): Task | null {
  return getAllTasks().find(t => t.id === taskId) || null;
}

export function getProjectById(projectId: string): Project | null {
  return getProjects().find(p => p.id === projectId) || null;
}

export function getRecentActivity(limit = 10): ActivityLogEntry[] {
  return getActivityLog()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}