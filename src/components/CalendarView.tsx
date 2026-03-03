'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getCalendarEvents } from '@/lib/data';
import { cn, formatDate } from '@/lib/utils';
import type { CalendarEvent } from '@/types';
type CalendarEventType = CalendarEvent['type'];
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, Target, Users, AlertTriangle, Bell 
} from 'lucide-react';

const eventTypeColors: Record<CalendarEventType, { bg: string; text: string; icon: typeof Clock }> = {
  deadline: { bg: 'bg-red-500/10', text: 'text-red-400', icon: AlertTriangle },
  content: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: CalendarIcon },
  meeting: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: Users },
  milestone: { bg: 'bg-green-500/10', text: 'text-green-400', icon: Target },
};

export default function CalendarView() {
  const events = getCalendarEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  while (current <= lastDay || current.getDay() !== 0) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <CalendarIcon className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-gray-400">Deadlines, content schedule, meetings</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-1 rounded text-sm',
                viewMode === 'month' ? 'bg-gray-800 text-white' : 'text-gray-400'
              )}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-1 rounded text-sm',
                viewMode === 'week' ? 'bg-gray-800 text-white' : 'text-gray-400'
              )}
            >
              Week
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1))}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1))}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isCurrentMonth = day.getMonth() === month;
                const isToday = day.toDateString() === new Date().toDateString();
                const dayEvents = getEventsForDay(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'min-h-[100px] p-2 border border-gray-800 rounded-lg',
                      !isCurrentMonth && 'opacity-50 bg-gray-900/30',
                      isCurrentMonth && 'bg-gray-800/30',
                      isToday && 'border-orange-500/50 bg-orange-500/5'
                    )}
                  >
                    <div className={cn(
                      'text-sm font-medium mb-1',
                      isToday && 'text-orange-400'
                    )}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => {
                        const config = eventTypeColors[event.type];
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              'text-xs px-2 py-1 rounded truncate',
                              config.bg,
                              config.text
                            )}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <h3 className="text-lg font-semibold mb-4">Upcoming</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event, i) => {
                const config = eventTypeColors[event.type];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div className={cn('p-2 rounded-lg', config.bg)}>
                      <Icon className={cn('h-4 w-4', config.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(event.date)}
                        {event.endDate && (
                          <span> • {new Date(event.date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}</span>
                        )}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{event.description}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Event Types Legend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          >
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Event Types</h4>
            <div className="space-y-2">
              {Object.entries(eventTypeColors).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={cn('p-1.5 rounded', config.bg)}>
                      <Icon className={cn('h-3 w-3', config.text)} />
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{type}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}