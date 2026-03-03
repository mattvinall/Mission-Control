'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getMemoryEntries } from '@/lib/data';
import { useMemory } from '@/hooks/useData';
import { cn, formatDate } from '@/lib/utils';
import type { MemoryEntry } from '@/types';

type MemoryCategory = MemoryEntry['category'];

import { 
  Brain, Search, Plus, Tag, Calendar,
  Lightbulb, Target, Heart, Globe, BookOpen, Settings, Clock,
  Wifi, WifiOff, RefreshCw
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMemoryCategoryColor(category: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    fact:       { bg: 'bg-blue-500/10',   text: 'text-blue-400' },
    decision:   { bg: 'bg-green-500/10',  text: 'text-green-400' },
    preference: { bg: 'bg-pink-500/10',   text: 'text-pink-400' },
    context:    { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    lesson:     { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    system:     { bg: 'bg-gray-500/10',   text: 'text-gray-400' },
    todo:       { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  };
  return colors[category] ?? { bg: 'bg-gray-500/10', text: 'text-gray-400' };
}

const categoryIcons: Record<MemoryCategory, typeof Lightbulb> = {
  fact:       BookOpen,
  decision:   Target,
  preference: Heart,
  context:    Globe,
  lesson:     Lightbulb,
  system:     Settings,
  todo:       Clock,
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function MemoryCardSkeleton() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 bg-gray-800 rounded-lg" />
        <div className="w-20 h-5 bg-gray-800 rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-gray-700 rounded mb-2" />
      <div className="h-3 w-full bg-gray-800 rounded mb-1" />
      <div className="h-3 w-5/6 bg-gray-800 rounded" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MemoryView() {
  // ── SWR live data ─────────────────────────────────────────────────────────
  const { data: liveData, isLoading, error } = useMemory();

  // ── Fallback mock ─────────────────────────────────────────────────────────
  const mockEntries = getMemoryEntries();

  // ── Merge: prefer live ────────────────────────────────────────────────────
  const memories = liveData?.entries?.length ? liveData.entries : mockEntries;
  const source   = liveData?.source ?? 'mock';

  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'all'>('all');
  const [selectedMemory,   setSelectedMemory]   = useState<MemoryEntry | null>(null);

  const filteredMemories = memories.filter(memory => {
    const matchesSearch =
      memory.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || memory.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const CATS = ['fact', 'decision', 'preference', 'context', 'lesson', 'system'] as MemoryCategory[];
  const categoryCounts = CATS.reduce((acc, cat) => ({
    ...acc,
    [cat]: memories.filter(m => m.category === cat).length
  }), {} as Record<MemoryCategory, number>);

  return (
    <div className="h-full flex">
      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 rounded-xl">
                <Brain className="h-8 w-8 text-violet-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Memory</h1>
                <p className="text-gray-400">
                  {isLoading ? 'Loading…' : `${memories.length} entries · Knowledge base`}
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

              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Memory</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search memories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-3 py-1 rounded-full text-sm transition-all',
                selectedCategory === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              )}
            >
              All ({memories.length})
            </button>
            {CATS.map(category => {
              const Icon   = categoryIcons[category];
              const colors = getMemoryCategoryColor(category);
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm transition-all flex items-center gap-1.5',
                    selectedCategory === category
                      ? cn(colors.bg, colors.text)
                      : 'bg-gray-900 text-gray-400 hover:text-white'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {category} ({categoryCounts[category] ?? 0})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Memory Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <MemoryCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((memory, i) => {
              const Icon   = categoryIcons[memory.category];
              const colors = getMemoryCategoryColor(memory.category);
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedMemory(memory)}
                  className={cn(
                    'bg-gray-900/50 border border-gray-800 rounded-xl p-5 cursor-pointer transition-all hover:border-violet-500/30',
                    selectedMemory?.id === memory.id && 'border-violet-500/50 bg-violet-500/5'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('p-2 rounded-lg', colors.bg)}>
                      <Icon className={cn('h-5 w-5', colors.text)} />
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
                      {memory.category}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold mb-2 text-violet-400">{memory.key}</h3>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">{memory.value}</p>
                  
                  {memory.tags.length > 0 && (
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      <Tag className="h-3 w-3 text-gray-500" />
                      {memory.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {memory.tags.length > 3 && (
                        <span className="text-xs text-gray-600">+{memory.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(memory.createdAt)}
                    </span>
                    <span className="capitalize">{memory.category}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredMemories.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No memories found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* ── Detail Panel ─────────────────────────────────────────────────── */}
      {selectedMemory && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-96 border-l border-gray-800 bg-gray-900/30 p-6 overflow-y-auto"
        >
          {(() => {
            const Icon   = categoryIcons[selectedMemory.category];
            const colors = getMemoryCategoryColor(selectedMemory.category);
            return (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn('p-3 rounded-xl', colors.bg)}>
                    <Icon className={cn('h-6 w-6', colors.text)} />
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', colors.bg, colors.text)}>
                    {selectedMemory.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold mb-4 text-violet-400">{selectedMemory.key}</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">{selectedMemory.value}</p>
                
                {selectedMemory.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemory.tags.map(tag => (
                        <span key={tag} className="text-sm bg-gray-800 text-gray-400 px-3 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created</span>
                    <span>{formatDate(selectedMemory.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Updated</span>
                    <span>{formatDate(selectedMemory.updatedAt)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button className="flex-1 py-2 text-sm text-center bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    Edit
                  </button>
                  <button
                    onClick={() => setSelectedMemory(null)}
                    className="flex-1 py-2 text-sm text-center text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
