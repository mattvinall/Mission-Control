import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  
  return date.toLocaleDateString();
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateString);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    backlog: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    'in-progress': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    review: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    done: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    discarded: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    active: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    idle: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    busy: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    error: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    offline: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    approved: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    running: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    idea: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    draft: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    scheduled: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    published: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  };
  
  return colors[status] || colors.backlog;
}

export function getPriorityColor(priority: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    medium: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    high: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  };
  
  return colors[priority] || colors.medium;
}

export function getStageColor(stage: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    idea: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    planning: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    'in-progress': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    review: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    done: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    paused: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    intake: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    backlog: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    building: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    qa: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    ship: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  };
  
  return colors[stage] || colors.planning;
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    linkedin: '💼',
    x: '𝕏',
    youtube: '📺',
    blog: '📝',
    newsletter: '📧',
  };
  return icons[platform] || '📄';
}

export function getContentStageColor(stage: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    idea: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    draft: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    review: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    scheduled: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    published: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  };
  return colors[stage] || colors.idea;
}

export function getImpactColor(impact: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    medium: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    strategic: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  };
  return colors[impact] || colors.low;
}

export function getContactStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    lead: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
    prospect: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    qualified: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    customer: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    churned: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    partner: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  };
  return colors[status] || colors.lead;
}

export function getMemoryCategoryColor(category: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    fact: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    decision: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    preference: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
    context: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    lesson: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    system: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
  };
  return colors[category] || colors.fact;
}
