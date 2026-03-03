'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getContacts } from '@/lib/data';
import { cn, getContactStatusColor, formatTimeAgo, formatCurrency } from '@/lib/utils';
import type { Person, ContactStatus } from '@/types';
import { 
  Users, Search, Plus, Mail, ExternalLink, 
  Building, User, Tag
} from 'lucide-react';

const statusConfig: Record<Person['status'], { color: string; bg: string; label: string }> = {
  lead: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Lead' },
  prospect: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Prospect' },
  client: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Client' },
  partner: { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Partner' },
  contact: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Contact' },
};

type StatusFilter = Person['status'] | 'all';

export default function PeopleView() {
  const contacts = getContacts();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Person | null>(null);

  const filtered = contacts.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = search === '' || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: contacts.length },
    { id: 'client', label: 'Clients', count: contacts.filter(p => p.status === 'client').length },
    { id: 'prospect', label: 'Prospects', count: contacts.filter(p => p.status === 'prospect').length },
    { id: 'lead', label: 'Leads', count: contacts.filter(p => p.status === 'lead').length },
    { id: 'partner', label: 'Partners', count: contacts.filter(p => p.status === 'partner').length },
    { id: 'contact', label: 'Contacts', count: contacts.filter(p => p.status === 'contact').length },
  ];

  return (
    <div className="h-full flex">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-orange-400" />
              <h1 className="text-2xl font-bold">contacts</h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add Person
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                filter === f.id
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
              )}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* contacts list */}
        <div className="space-y-2">
          {filtered.map((person, i) => {
            const status = statusConfig[person.status];
            return (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedContact(person)}
                className={cn(
                  'flex items-center gap-4 p-4 bg-gray-900/50 border rounded-xl cursor-pointer transition-all',
                  selectedContact?.id === person.id
                    ? 'border-orange-500/50'
                    : 'border-gray-800 hover:border-gray-700'
                )}
              >
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-lg">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{person.name}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Building className="h-3 w-3" />
                    <span>{person.role} at {person.company}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatTimeAgo(person.lastInteraction)}
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No contacts found
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedContact && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 border-l border-gray-800 bg-gray-900/30 p-6 overflow-y-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold">{selectedContact.name}</h2>
            <p className="text-sm text-gray-400">{selectedContact.role}</p>
            <p className="text-sm text-gray-500">{selectedContact.company}</p>
            <span className={cn(
              'inline-block mt-2 text-xs px-3 py-1 rounded-full',
              statusConfig[selectedContact.status].bg,
              statusConfig[selectedContact.status].color
            )}>
              {statusConfig[selectedContact.status].label}
            </span>
          </div>

          {selectedContact.email && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-300">{selectedContact.email}</span>
            </div>
          )}

          {selectedContact.linkedin && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <ExternalLink className="h-4 w-4 text-gray-500" />
              <a href={`https://${selectedContact.linkedin}`} className="text-blue-400 hover:underline">
                LinkedIn
              </a>
            </div>
          )}

          {selectedContact.notes && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Notes</h4>
              <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                {selectedContact.notes}
              </p>
            </div>
          )}

          {selectedContact.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedContact.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Last interaction: {formatTimeAgo(selectedContact.lastInteraction)}
          </div>
        </motion.div>
      )}
    </div>
  );
}




