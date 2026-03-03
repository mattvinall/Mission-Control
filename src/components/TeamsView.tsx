'use client';

import { motion } from 'framer-motion';
import { getTeamMembers } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { TeamMember } from '@/types';
import { 
  Users, User, Bot, TrendingUp, Activity, 
  GitBranch, ArrowRight, Zap 
} from 'lucide-react';

export default function TeamsView() {
  const members = getTeamMembers();
  const humans = members.filter(m => m.type === 'human');
  const agents = members.filter(m => m.type === 'agent');

  const getReportingStructure = () => {
    const structure: { [key: string]: TeamMember[] } = {};
    members.forEach(member => {
      if (member.reportsTo) {
        if (!structure[member.reportsTo]) {
          structure[member.reportsTo] = [];
        }
        structure[member.reportsTo].push(member);
      }
    });
    return structure;
  };

  const reportingStructure = getReportingStructure();
  const rootMembers = members.filter(m => !m.reportsTo);

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 rounded-xl">
            <Users className="h-8 w-8 text-teal-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-gray-400">{humans.length} humans · {agents.length} AI agents</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Humans</span>
          </div>
          <p className="text-2xl font-bold">{humans.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">AI Agents</span>
          </div>
          <p className="text-2xl font-bold">{agents.length}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-400">Avg Load</span>
          </div>
          <p className="text-2xl font-bold">
            {Math.round(members.reduce((sum, m) => sum + m.capacity, 0) / members.length)}%
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Total Capacity</span>
          </div>
          <p className="text-2xl font-bold">{members.reduce((sum, m) => sum + m.capacity, 0)}</p>
        </div>
      </motion.div>

      {/* Org Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-teal-400" />
          Organization Chart
        </h2>
        
        <div className="space-y-6">
          {rootMembers.map((member, i) => (
            <div key={member.id} className="space-y-4">
              <MemberCard member={member} isRoot />
              {reportingStructure[member.id] && (
                <div className="ml-8 space-y-3 border-l-2 border-gray-800 pl-6">
                  {reportingStructure[member.id].map(subordinate => (
                    <div key={subordinate.id}>
                      <MemberCard member={subordinate} />
                      {reportingStructure[subordinate.id] && (
                        <div className="ml-8 mt-3 space-y-2 border-l border-gray-800 pl-6">
                          {reportingStructure[subordinate.id].map(agent => (
                            <MemberCard key={agent.id} member={agent} isSmall />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skills Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Skills Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-800">
                <th className="pb-3">Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Load</th>
                <th className="pb-3">Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {members.map(member => (
                <tr key={member.id}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        member.type === 'human' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                      )}>
                        <span className="text-xl">{member.emoji}</span>
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-400">{member.role}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all',
                            member.capacity < 70 ? 'bg-green-400' :
                            member.capacity < 90 ? 'bg-yellow-400' : 'bg-red-400'
                          )}
                          style={{ width: `${member.capacity}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{member.capacity}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1">
                      {[member.role, member.currentFocus].filter(Boolean).map(skill => (
                        <span key={skill} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
{/* no overflow */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function MemberCard({ member, isRoot = false, isSmall = false }: { 
  member: TeamMember; 
  isRoot?: boolean; 
  isSmall?: boolean; 
}) {
  return (
    <div className={cn(
      'bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-teal-500/30 transition-all',
      isRoot && 'border-teal-500/30 bg-teal-500/5',
      isSmall && 'p-3'
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          'rounded-xl flex items-center justify-center font-bold',
          isSmall ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl',
          member.type === 'human' 
            ? 'bg-blue-500/10 text-blue-400' 
            : 'bg-purple-500/10 text-purple-400'
        )}>
          {member.emoji}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              'font-semibold truncate',
              isSmall ? 'text-sm' : 'text-base'
            )}>
              {member.name}
            </h4>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs',
              member.type === 'human' 
                ? 'bg-blue-500/10 text-blue-400' 
                : 'bg-purple-500/10 text-purple-400'
            )}>
              {member.type}
            </span>
          </div>
          <p className={cn(
            'text-gray-400 truncate',
            isSmall ? 'text-xs' : 'text-sm'
          )}>
            {member.role}
          </p>
        </div>
        
        <div className="text-right">
          <div className={cn(
            'flex items-center gap-2 mb-1',
            isSmall ? 'text-xs' : 'text-sm'
          )}>
            <div className={cn(
              'bg-gray-800 rounded-full overflow-hidden',
              isSmall ? 'w-12 h-1.5' : 'w-16 h-2'
            )}>
              <div 
                className={cn(
                  'h-full rounded-full transition-all',
                  member.capacity < 70 ? 'bg-green-400' :
                  member.capacity < 90 ? 'bg-yellow-400' : 'bg-red-400'
                )}
                style={{ width: `${member.capacity}%` }}
              />
            </div>
            <span className="text-gray-500 font-medium">{member.capacity}%</span>
          </div>
          <p className={cn(
            'text-gray-600',
            isSmall ? 'text-xs' : 'text-xs'
          )}>
            {(member.skills || []).length} skills
          </p>
        </div>
      </div>
      
      {!isSmall && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-1">
            {(member.skills || []).slice(0, 4).map(skill => (
              <span key={skill} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {(member.skills || []).length > 4 && (
              <span className="text-xs text-gray-600">+{(member.skills || []).length - 4} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


