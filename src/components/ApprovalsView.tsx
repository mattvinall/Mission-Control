'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPendingApprovals } from '@/lib/data';
import { cn, formatTimeAgo } from '@/lib/utils';
import type { ApprovalItem } from '@/types';
import { 
  CheckCircle, XCircle, Clock, FileText, 
  Rocket, Bot, ShieldCheck, ChevronRight, User
} from 'lucide-react';

const typeConfig: Record<ApprovalItem['type'], { icon: typeof FileText; color: string; bg: string }> = {
  content: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  task: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  decision: { icon: Bot, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  deployment: { icon: Rocket, color: 'text-green-400', bg: 'bg-green-500/10' },
};

const urgencyConfig: Record<ApprovalItem['urgency'], { color: string; bg: string }> = {
  low: { color: 'text-gray-400', bg: 'bg-gray-500/10' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  high: { color: 'text-red-400', bg: 'bg-red-500/10' },
};

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function ApprovalsView() {
  const approvals = getPendingApprovals();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [processedIds, setProcessedIds] = useState<Map<string, 'approved' | 'rejected'>>(new Map());

  const getEffectiveStatus = (a: ApprovalItem) => {
    return processedIds.get(a.id) || a.status;
  };

  const filtered = approvals.filter(a => {
    if (filter === 'all') return true;
    return getEffectiveStatus(a) === filter;
  });

  const pendingCount = approvals.filter(a => getEffectiveStatus(a) === 'pending').length;
  const approvedCount = approvals.filter(a => getEffectiveStatus(a) === 'approved').length;
  const rejectedCount = approvals.filter(a => getEffectiveStatus(a) === 'rejected').length;

  const handleApprove = (id: string) => {
    setProcessedIds(new Map(processedIds).set(id, 'approved'));
    setSelectedApproval(null);
  };

  const handleReject = (id: string) => {
    setProcessedIds(new Map(processedIds).set(id, 'rejected'));
    setSelectedApproval(null);
  };

  const filters: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: approvals.length },
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'approved', label: 'Approved', count: approvedCount },
    { id: 'rejected', label: 'Rejected', count: rejectedCount },
  ];

  return (
    <div className="h-full flex">
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-6 w-6 text-orange-400" />
            <h1 className="text-2xl font-bold">Approvals</h1>
          </div>
          <p className="text-gray-400">{pendingCount} pending decisions</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400">{rejectedCount}</div>
            <div className="text-sm text-gray-400">Rejected</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f.id
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
              )}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Approvals list */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((approval, i) => {
              const config = typeConfig[approval.type];
              const Icon = config.icon;
              const urgency = urgencyConfig[approval.urgency];
              const effectiveStatus = getEffectiveStatus(approval);

              return (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedApproval(approval)}
                  className={cn(
                    'flex items-center gap-4 p-4 bg-gray-900/50 border rounded-xl cursor-pointer transition-all',
                    selectedApproval?.id === approval.id
                      ? 'border-orange-500/50'
                      : 'border-gray-800 hover:border-gray-700',
                    effectiveStatus !== 'pending' && 'opacity-60'
                  )}
                >
                  <div className={cn('p-3 rounded-xl', config.bg)}>
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{approval.title}</h3>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', urgency.bg, urgency.color)}>
                        {approval.urgency}
                      </span>
                      {effectiveStatus !== 'pending' && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          effectiveStatus === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        )}>
                          {effectiveStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{approval.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {approval.submittedBy}
                      </span>
                      <span>{formatTimeAgo(approval.submittedAt)}</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-gray-400">No approvals match this filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedApproval && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="w-96 border-l border-gray-800 bg-gray-900/30 p-6 overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">{selectedApproval.title}</h2>
            <p className="text-gray-400 mb-6">{selectedApproval.description}</p>
            
            {selectedApproval.context && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">Context</h4>
                <p className="text-sm bg-gray-800/50 p-3 rounded-lg">{selectedApproval.context}</p>
              </div>
            )}
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Submitted by</span>
                <span>{selectedApproval.submittedBy}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Submitted</span>
                <span>{formatTimeAgo(selectedApproval.submittedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="capitalize">{selectedApproval.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Urgency</span>
                <span className={cn(urgencyConfig[selectedApproval.urgency].color, 'capitalize')}>
                  {selectedApproval.urgency}
                </span>
              </div>
            </div>
            
            {getEffectiveStatus(selectedApproval) === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedApproval.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                >
                  <CheckCircle className="h-5 w-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedApproval.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors font-medium"
                >
                  <XCircle className="h-5 w-5" />
                  Reject
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
