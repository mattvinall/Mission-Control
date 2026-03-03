'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getContentPipeline } from '@/lib/data';
import { cn, formatDate } from '@/lib/utils';
import type { ContentPiece } from '@/types';
import { 
  PenTool, Calendar, Eye, ThumbsUp, MessageSquare, Share2, 
  Plus, Linkedin, Twitter, Youtube
} from 'lucide-react';

const STAGES = ['idea', 'draft', 'review', 'scheduled', 'published'] as const;

const stageColors: Record<ContentPiece['stage'], { bg: string; text: string; border: string }> = {
  idea: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  draft: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  review: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  scheduled: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  published: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
};

const platformConfig: Record<ContentPiece['platform'], { icon: typeof Linkedin; color: string; label: string }> = {
  linkedin: { icon: Linkedin, color: 'text-blue-400', label: 'LinkedIn' },
  x: { icon: Twitter, color: 'text-gray-400', label: 'X' },
  youtube: { icon: Youtube, color: 'text-red-400', label: 'YouTube' },
};

type PlatformFilter = ContentPiece['platform'] | 'all';

export default function ContentView() {
  const content = getContentPipeline();
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  const filtered = platformFilter === 'all' 
    ? content 
    : content.filter(c => c.platform === platformFilter);

  const getByStage = (stage: ContentPiece['stage']) => filtered.filter(c => c.stage === stage);

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PenTool className="h-6 w-6 text-orange-400" />
            <h1 className="text-2xl font-bold">Content Pipeline</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
            <Plus className="h-4 w-4" />
            New Content
          </button>
        </div>
      </motion.div>

      {/* Platform filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setPlatformFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            platformFilter === 'all'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
          )}
        >
          All ({content.length})
        </button>
        {Object.entries(platformConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = content.filter(c => c.platform === key).length;
          return (
            <button
              key={key}
              onClick={() => setPlatformFilter(key as ContentPiece['platform'])}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                platformFilter === key
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
              )}
            >
              <Icon className={cn('h-4 w-4', config.color)} />
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const items = getByStage(stage);
          const colors = stageColors[stage];
          return (
            <div key={stage} className="flex-shrink-0 w-72">
              <div className={cn('flex items-center gap-2 mb-3 px-2')}>
                <div className={cn('w-2 h-2 rounded-full', colors.text.replace('text-', 'bg-'))} />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  {stage}
                </h3>
                <span className="text-xs text-gray-500">({items.length})</span>
              </div>

              <div className="space-y-3">
                {items.map((piece, i) => {
                  const platform = platformConfig[piece.platform];
                  const PlatformIcon = platform.icon;
                  return (
                    <motion.div
                      key={piece.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'bg-gray-900/50 border rounded-xl p-4 hover:border-gray-600 transition-all cursor-pointer',
                        colors.border
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformIcon className={cn('h-4 w-4', platform.color)} />
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
                          {piece.type}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold mb-2 line-clamp-2">{piece.title}</h4>

                      {piece.scheduledDate && (
                        <div className="flex items-center gap-1 text-xs text-purple-400 mb-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(piece.scheduledDate)}
                        </div>
                      )}

                      {piece.metrics && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-800 text-xs text-gray-500">
                          {piece.metrics.views != null && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {piece.metrics.views.toLocaleString()}
                            </span>
                          )}
                          {piece.metrics.likes != null && (
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" /> {piece.metrics.likes}
                            </span>
                          )}
                          {piece.metrics.comments != null && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> {piece.metrics.comments}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-600 mt-2">
                        {formatDate(piece.updatedAt)}
                      </div>
                    </motion.div>
                  );
                })}

                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-gray-800 rounded-xl">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
