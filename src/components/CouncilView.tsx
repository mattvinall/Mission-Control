'use client';

import { motion } from 'framer-motion';
import { getDecisions } from '@/lib/data';
import { cn, formatDate } from '@/lib/utils';

function getCategoryColor(category: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    strategy: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    product: { bg: 'bg-green-500/10', text: 'text-green-400' },
    marketing: { bg: 'bg-pink-500/10', text: 'text-pink-400' },
    technical: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    operations: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  };
  return colors[category] || { bg: 'bg-gray-500/10', text: 'text-gray-400' };
}
import type { Decision } from '@/types';
import { 
  Gavel, CheckCircle, XCircle, Clock, AlertTriangle, 
  Lightbulb, Target, Users, DollarSign, GitBranch
} from 'lucide-react';

const categoryIcons: Record<string, typeof Lightbulb> = {
  Strategy: Target,
  Pricing: DollarSign,
  Product: Lightbulb,
  Engineering: GitBranch,
};

export default function CouncilView() {
  const decisions = getDecisions();
  const pendingDecisions = decisions.filter(d => d.status === 'pending');
  const decidedDecisions = decisions.filter(d => d.status !== 'pending');

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Gavel className="h-8 w-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Council</h1>
            <p className="text-gray-400">Strategic decisions & decision log</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending', value: pendingDecisions.length, icon: Clock, color: 'text-yellow-400' },
          { label: 'Decided', value: decidedDecisions.length, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Pending', value: pendingDecisions.length, icon: XCircle, color: 'text-red-400' },
          { label: 'Total', value: decisions.length, icon: Gavel, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn('h-5 w-5', stat.color)} />
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Pending Decisions */}
      {pendingDecisions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            Pending Decisions
          </h2>
          <div className="space-y-3">
            {pendingDecisions.map((decision, i) => (
              <DecisionCard key={decision.id} decision={decision} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Decision Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gavel className="h-5 w-5 text-indigo-400" />
          Decision Log
        </h2>
        <div className="space-y-3">
          {decidedDecisions.map((decision, i) => (
            <DecisionCard key={decision.id} decision={decision} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function DecisionCard({ decision, index }: { decision: Decision; index: number }) {
  const Icon = categoryIcons[decision.category] || Lightbulb;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-gray-900/50 border rounded-xl p-5',
        decision.status === 'pending' 
          ? 'border-yellow-500/30 bg-yellow-500/5' 
          : 'border-gray-800 hover:border-gray-700'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-800 rounded-xl flex-shrink-0">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-semibold">{decision.title}</h3>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              getCategoryColor(decision.category).bg,
              getCategoryColor(decision.category).text
            )}>
              {decision.category}
            </span>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
              {decision.category}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">{decision.context}</p>
          
          {decision.status !== 'pending' && decision.outcome && (
            <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
              <p className="text-sm">
                <span className={cn(
                  'font-medium',
                  decision.status === 'decided' && 'text-green-400',
                  decision.status === 'revisit' && 'text-red-400',
                )}>
                  {decision.status === 'decided' && 'Decided'}
                  {decision.status === 'revisit' && 'Revisit'}
                </span>
                <span className="text-gray-500"> — {decision.outcome}</span>
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Created {formatDate(decision.createdAt)}</span>
            {decision.decidedAt && (
              <>
                <span>·</span>
                <span>Decided {formatDate(decision.decidedAt)}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          {decision.status === 'pending' ? (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              Pending
            </span>
          ) : decision.status === 'decided' ? (
            <CheckCircle className="h-6 w-6 text-green-400" />
          ) : decision.status === 'revisit' ? (
            <XCircle className="h-6 w-6 text-red-400" />
          ) : (
            <Clock className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}


