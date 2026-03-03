'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getDocs } from '@/lib/data';
import { cn, formatDate } from '@/lib/utils';
import type { DocEntry } from '@/types';
import { 
  BookOpen, Search, FileText, ExternalLink, 
  Clock, User, ChevronRight
} from 'lucide-react';

const categoryConfig: Record<DocEntry['category'], { color: string; bg: string; label: string }> = {
  guide: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Guide' },
  reference: { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Reference' },
  process: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Process' },
  architecture: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Architecture' },
};

type CategoryFilter = DocEntry['category'] | 'all';

export default function DocsView() {
  const docs = getDocs();
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocEntry | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filtered = docs.filter(doc => {
    const matchesSearch = search === '' || 
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'guide', label: 'Guides' },
    { id: 'reference', label: 'Reference' },
    { id: 'process', label: 'Process' },
    { id: 'architecture', label: 'Architecture' },
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
            <BookOpen className="h-6 w-6 text-orange-400" />
            <h1 className="text-2xl font-bold">Documentation</h1>
          </div>
          <p className="text-gray-400">{docs.length} documents</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search docs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                categoryFilter === cat.id
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Docs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc, i) => {
            const config = categoryConfig[doc.category as DocEntry['category']];
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedDoc(doc)}
                className={cn(
                  'bg-gray-900/50 border rounded-xl p-5 cursor-pointer transition-all',
                  selectedDoc?.id === doc.id
                    ? 'border-orange-500/50'
                    : 'border-gray-800 hover:border-gray-700'
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn('p-2 rounded-lg', config.bg)}>
                    <FileText className={cn('h-5 w-5', config.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{doc.title}</h3>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', config.bg, config.color)}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{doc.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {formatDate(doc.lastUpdated)}
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No documents found
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedDoc && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 border-l border-gray-800 bg-gray-900/30 p-6 overflow-y-auto"
        >
          <h2 className="text-lg font-bold mb-4">{selectedDoc.title}</h2>
          <p className="text-sm text-gray-400 mb-6">{selectedDoc.description}</p>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-500">Category</span>
              <p className={cn('text-sm', categoryConfig[selectedDoc.category].color)}>
                {categoryConfig[selectedDoc.category].label}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Last Updated</span>
              <p className="text-sm">{formatDate(selectedDoc.lastUpdated)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Path</span>
              <p className="text-sm text-gray-400">{selectedDoc.path}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
