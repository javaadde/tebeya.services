import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import { queryKeys } from '../../api/queryKeys';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SlotBadge } from '../../components/ui/Badge';
import { Header } from '../../components/layout/Header';
import { CreateEventModal } from './CreateEventModal';
import { EventDetailModal } from './EventDetailModal';
import type { CateringEvent, EventStatus } from '@tebeya/shared';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  IndianRupee,
  ChevronRight,
} from 'lucide-react';

export function EventsView() {
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CateringEvent | null>(null);

  const {
    data: events = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.events.all,
    queryFn: () => eventsApi.list(),
  });

  const filteredEvents = events.filter((e) => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  const filterTabs: Array<{ label: string; value: EventStatus | 'all' }> = [
    { label: 'All Shifts', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div>
      <Header
        title="Events & Rosters"
        subtitle="Schedule catering shifts, monitor server capacity, and track attendance."
        action={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Shift
          </Button>
        }
      />

      <div className="px-6 sm:px-8 pt-8 pb-12 space-y-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-1.5 bg-[#f7f4ef] p-1.5 rounded-2xl">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === tab.value
                    ? 'bg-[#598A31] text-white shadow-md shadow-[#598A31]/20'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-stone-500">
            Showing {filteredEvents.length} shift(s)
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-stone-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl shadow-sm">
            <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-stone-900">No events found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              There are currently no events matching this filter. Create a new shift to publish it to staff.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-xl border-0 bg-[#f7f4ef] text-stone-800 shadow-xs hover:bg-[#eee9df]"
              >
                Create Event
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEvents.map((evt) => {
              const fillPct = Math.min(
                100,
                Math.round((evt.filledCount / (evt.headcount || 1)) * 100)
              );
              const isFull = evt.filledCount >= evt.headcount;

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all p-5 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Title + Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-base font-black text-stone-900 group-hover:text-[#598A31] transition-colors line-clamp-1">
                          {evt.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <SlotBadge slot={evt.slot} />
                          <StatusBadge status={evt.status} />
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-[#598A31] transition-colors flex-shrink-0" />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5 text-xs text-stone-600 my-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#598A31] flex-shrink-0" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#598A31] flex-shrink-0" />
                        <span>
                          {evt.startTime} - {evt.endTime}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#598A31] flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{evt.venue.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Bar & Pay Footer */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 font-semibold text-stone-500">
                        <Users className="w-3.5 h-3.5" />
                        Headcount
                      </span>
                      <span
                        className={`font-black ${
                          isFull ? 'text-emerald-700' : 'text-stone-900'
                        }`}
                      >
                        {evt.filledCount} / {evt.headcount} ({fillPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#f4f0ea] rounded-full h-2 overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull ? 'bg-emerald-600' : 'bg-[#598A31]'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-gray-500">Base Pay:</span>
                      <span className="font-extrabold text-gray-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {evt.payPerPerson} / server
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEventUpdated={() => refetch()}
      />
    </div>
  );
}
