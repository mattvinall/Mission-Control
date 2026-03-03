'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getContentPipeline } from '@/lib/data';
import { useContent } from '@/hooks/useData';
import { cn, formatDate } from '@/lib/utils';
import type { ContentPiece } from '@/types';
import { 
  PenTool, Calendar, Eye, ThumbsUp, MessageSquare,
  Plus, Linkedin, Twitter, Youtube, Wifi, WifiOff, RefreshCw
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const STAGES = ['idea', 'draft', 'review', 'scheduled', 'published'] as const;

const stageColors: Record<ContentPiece['stage'], { bg: string; text: string; border: string; dot: string }> = {
  idea:      { bg: 'bg-gray-500/10',   text: 'text-gray-400',   border: 'border-gray-500/30',   dot: 'bg-gray-400' },
  draft:     { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/30',   dot: 'bg-blue-400' },
  review:    { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  scheduled: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  published: { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/30',  dot: 'bg-green-400' },
};

const platformConfig: Record<ContentPiece['platform'], { icon: typeof Linkedin; color: string; label: string }> = {
  linkedin: { icon: Linkedin, color: 'text-blue-400',  label: 'LinkedIn' },
  x:        { icon: Twitter,  color: 'text-gray-400',  label: 'X' },
  youtube:  { icon: Youtube,  color: 'text-red-400',   label: 'YouTube' },
};

type PlatformFilter = ContentPiece['platform'] | 'all';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ContentCardSkeleton() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 bg-gray-800 rounded" />
        <div className="w-16 h-4 bg-gray-800 rounded-full" />
      </div>
      <div className="h-4 w-full bg-gray-700 rounded mb-1" />
      <div className="h-4 w-3/4 bg-gray-700 rounded mb-3" />
      <div className="h-3 w-1/2 bg-gray-800 rounded" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContentView() {
  // ── SWR live data ─────────────────────────────────────────────────────────
  const { data: liveData, isLoading, error } = useContent();

  // ── Fallback mock ─────────────────────────────────────────────────────────
  const mockContent = getContentPipeline();

  // ── Merge ─────────────────────────────────────────────────────────────────
  const content = liveData?.content?.length ? liveData.content : mockContent;
  const source  = liveData?.source ?? 'mock';

  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  const filtered    = platformFilter === 'all' ? content : content.filter(c => c.platform === platformFilter);
  const getByStage  = (stage: ContentPiece['stage']) => filtered.filter(c => c.stage === stage);

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
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <PenTool className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Content Pipeline</h1>
              <p className="text-gray-400 text-sm">
                {isLoading ? 'Loading…' : `${content.length} pieces across all platforms`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Source badge */}
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                <RefreshCw className="h-3 w-3 animate-spin" /> Syncing…
              </span>
            ) : source === 'live' ? (
              <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                <Wifi className="h-3 w-3" /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full">
                <WifiOff className="h-3 w-3" /> Mock
              </span>
            )}

            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
              <Plus className="h-4 w-4" />
              New Content
            </button>
          </div>
        </div>
      </motion.div>

      {/* Platform filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 flex-wrap"
      >
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
          const Icon  = config.icon;
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
      </motion.div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {STAGES.map((stage) => {
          const items  = isLoading ? [] : getByStage(stage);
          const colors = stageColors[stage];

          return (
            <div key={stage} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  {stage}
                </h3>
                <span className="text-xs text-gray-500">
                  ({isLoading ? '…' : items.length})
                </span>
              </div>

              <div className="space-y-3">
                {/* Loading skeletons */}
                {isLoading && Array.from({ length: 2 }).map((_, i) => (
                  <ContentCardSkeleton key={i} />
                ))}

                {/* Content cards */}
                {!isLoading && items.map((piece, i) => {
                  const platform    = platformConfig[piece.platform];
                  const PlatformIcon = platform.icon;

                  return (
                    <motion.div
                      key={piece.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'bg-gray-900/50 border rounded-xl p-4 hover:border-gray-600 transition-all cursor-pointer group',
                        colors.border
                      )}
                    >
                      {/* Platform + type row */}
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformIcon className={cn('h-4 w-4', platform.color)} />
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
                          {piece.type}
                        </span>
                        <span className="ml-auto text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
                          {formatDate(piece.updatedAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold mb-2 line-clamp-2 leading-snug">
                        {piece.title}
                      </h4>

                      {/* Scheduled date */}
                      {piece.scheduledDate && (
                        <div className="flex items-center gap-1 text-xs text-purple-400 mb-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(piece.scheduledDate)}
                        </div>
                      )}

                      {/* Published date */}
                      {piece.publishedDate && (
                        <div className="flex items-center gap-1 text-xs text-green-400 mb-2">
                          <Calendar className="h-3 w-3" />
                          Published {formatDate(piece.publishedDate)}
                        </div>
                      )}

                      {/* Metrics */}
                      {piece.metrics && (
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-800 text-xs text-gray-500">
                          {piece.metrics.views != null && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {piece.metrics.views.toLocaleString()}
                            </span>
                          )}
                          {piece.metrics.likes != null && (
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {piece.metrics.likes}
                            </span>
                          )}
                          {piece.metrics.comments != null && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {piece.metrics.comments}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Empty column */}
                {!isLoading && items.length === 0 && (
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
