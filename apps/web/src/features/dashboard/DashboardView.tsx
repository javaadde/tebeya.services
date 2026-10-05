import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import { invitesApi } from '../../api/invites.api';
import { staffApi } from '../../api/staff.api';
import { queryKeys } from '../../api/queryKeys';
import { StatCard } from '../../components/ui/StatCard';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SlotBadge } from '../../components/ui/Badge';
import { CreateEventModal } from '../events/CreateEventModal';
import { GenerateInviteModal } from '../invites/GenerateInviteModal';
import { EventDetailModal } from '../events/EventDetailModal';
import type { CateringEvent, EventStatus } from '@tebeya/shared';
import type { NavItemKey } from '../../components/layout/Sidebar';
import {
  CalendarDays,
  Users,
  KeyRound,
  ShieldAlert,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Briefcase,
  UserCheck,
  ChevronDown,
  MoreHorizontal,
  Minus,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavItemKey) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isGenerateInviteOpen, setIsGenerateInviteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CateringEvent | null>(null);
  const [tableFilter, setTableFilter] = useState<EventStatus | 'all'>('all');
  const [activeMonthIndex, setActiveMonthIndex] = useState(new Date().getMonth());

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: queryKeys.events.all,
    queryFn: () => eventsApi.list(),
  });

  const { data: invites = [], refetch: refetchInvites } = useQuery({
    queryKey: queryKeys.invites.list('active'),
    queryFn: () => invitesApi.list('active'),
  });

  const { data: staffList = [] } = useQuery({
    queryKey: queryKeys.staff.list(),
    queryFn: () => staffApi.list(),
  });

  const upcomingEvents = events.filter((e) => e.status !== 'completed' && e.status !== 'cancelled');
  const totalHeadcount = upcomingEvents.reduce((acc, curr) => acc + (curr.headcount || 0), 0);
  const totalFilled = upcomingEvents.reduce((acc, curr) => acc + (curr.filledCount || 0), 0);
  const fillRatePct =
    totalHeadcount > 0 ? Math.round((totalFilled / totalHeadcount) * 100) : 100;

  const pendingKYCStaff = staffList.filter((s) => s.status === 'pending_verification');
  const understaffedEvents = upcomingEvents.filter(
    (e) => e.status === 'published' && e.filledCount < e.headcount
  );

  const filteredTableEvents = events.filter((e) => {
    if (tableFilter === 'all') return true;
    return e.status === tableFilter;
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthlyStats = monthNames.map((month, idx) => {
    const monthEvents = events.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return !isNaN(d.getTime()) && d.getMonth() === idx;
    });
    const capacity = monthEvents.reduce((acc, curr) => acc + (curr.headcount || 0), 0);
    const filled = monthEvents.reduce((acc, curr) => acc + (curr.filledCount || 0), 0);
    return {
      month,
      capacity,
      filled,
      highlightText: filled > 0 ? `${filled} filled` : undefined,
    };
  });

  const maxCapacity = Math.max(1, ...monthlyStats.map((m) => m.capacity));

  return (
    <div className="pb-10">
      <Header
        title="Dashboard"
        subtitle="Plan, prioritize, and accomplish your event staffing with ease."
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={KeyRound}
              onClick={() => setIsGenerateInviteOpen(true)}
              className="rounded-xl border-0 bg-white text-stone-700 hover:bg-[#f7f4ef] shadow-xs"
            >
              Issue Pass
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateEventOpen(true)}
              className="rounded-xl"
            >
              + New Shift
            </Button>
          </div>
        }
      />

      <div className="px-6 sm:px-8 py-3 space-y-6 w-full">
        {/* TOP ROW: Quick Stats Section (Matching Jobgio inspiration) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Quick Stats Header */}
            <div className="lg:w-48 flex-shrink-0">
              <h3 className="text-xl font-black text-stone-900 tracking-tight">Quick Stats</h3>
              <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">
                Live statistics for 7-day operations window.
              </p>
            </div>

            {/* Quick Stats Horizontal Pill Cards Row */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              <StatCard
                label="Total Shifts"
                value={events.length || '0'}
                subtext="All rosters"
                icon={CalendarDays}
                layout="vertical"
                variant="default"
                onClick={() => onNavigate('events')}
              />
              <StatCard
                label="Active Staff"
                value={staffList.length || '0'}
                subtext="Registered banquet staff"
                icon={Users}
                layout="vertical"
                variant="default"
                onClick={() => onNavigate('staff')}
              />
              {/* Featured Pill Card in primary #598A31 */}
              <StatCard
                label="Active Shifts"
                value={upcomingEvents.length || '0'}
                subtext="Current period"
                icon={Briefcase}
                layout="vertical"
                variant="featured"
                onClick={() => onNavigate('events')}
              />
              <StatCard
                label="Roster Fill"
                value={`${fillRatePct}%`}
                subtext={`${totalFilled}/${totalHeadcount} filled`}
                icon={UserCheck}
                layout="vertical"
                variant="default"
                onClick={() => onNavigate('events')}
              />
              <StatCard
                label="Pending KYC"
                value={pendingKYCStaff.length || '0'}
                subtext="ID proofs to verify"
                icon={ShieldAlert}
                layout="vertical"
                variant={pendingKYCStaff.length > 0 ? 'amber' : 'default'}
                onClick={() => onNavigate('staff')}
              />
              <StatCard
                label="Invite Passes"
                value={invites.length || '0'}
                subtext="Active codes"
                icon={KeyRound}
                layout="vertical"
                variant="default"
                onClick={() => onNavigate('invites')}
              />
            </div>
          </div>
        </div>

        {/* Operational Attention Banner */}
        {understaffedEvents.length > 0 && (
          <div className="bg-[#e6f0dc] rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-[#598A31] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#598A31]/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    {understaffedEvents.length} Shift(s) Require Server Allocation
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5 font-medium">
                    Published events have unfilled server slots. Staff will see these as priority shifts on their mobile app.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-stone-800 hover:bg-[#f7f4ef] rounded-xl flex-shrink-0 shadow-xs border-0"
                onClick={() => onNavigate('events')}
              >
                Inspect Rosters
              </Button>
            </div>
          </div>
        )}

        {/* MIDDLE ROW: Statistics Chart & Pending Approvals (2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Card: Statistics Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              {/* Header with Title & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                <div>
                  <h3 className="text-lg font-black text-stone-900 tracking-tight">Statistics</h3>
                  <p className="text-xs text-stone-500 font-medium">Roster demand & staff fulfillment</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-900" />
                    <span>Jobs Posted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#dad0c3]" />
                    <span>Applications</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Canvas inspired by Jobgio */}
              <div className="pt-8 pb-4">
                <div className="flex items-end justify-between gap-1 sm:gap-2 h-52 px-2 relative">
                  {/* Y-axis guide labels */}
                  <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] text-stone-400 font-medium pointer-events-none -ml-2">
                    <span>8K</span>
                    <span>6K</span>
                    <span>4K</span>
                    <span>2K</span>
                    <span>0</span>
                  </div>

                  {monthlyStats.map((item, idx) => {
                    const isSelected = activeMonthIndex === idx;
                    return (
                      <div
                        key={item.month}
                        onClick={() => setActiveMonthIndex(idx)}
                        className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                      >
                        {/* Floating Tooltip Pill for Highlighted/Active Month */}
                        {isSelected && item.capacity > 0 && (
                          <div className="absolute -top-7 flex flex-col items-center z-10 animate-in fade-in zoom-in duration-200">
                            <div className="bg-stone-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                              {item.highlightText || `${item.filled}/${item.capacity}`}
                            </div>
                            <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 -mt-0.5" />
                          </div>
                        )}

                        {/* Dual Vertical Bars */}
                        <div className="flex items-end gap-1 w-full justify-center">
                          {/* Main Dark Bar */}
                          <div
                            style={{ height: `${item.capacity > 0 ? Math.max(8, (item.capacity / maxCapacity) * 100) : 4}%` }}
                            className={`w-2.5 sm:w-3.5 rounded-full transition-all duration-300 ${
                              item.capacity === 0
                                ? 'bg-stone-200'
                                : isSelected
                                ? 'bg-[#598A31] shadow-md shadow-[#598A31]/30'
                                : 'bg-stone-900 group-hover:bg-stone-700'
                            }`}
                          />
                          {/* Secondary Sand Bar */}
                          <div
                            style={{ height: `${item.filled > 0 ? Math.max(6, (item.filled / maxCapacity) * 100) : 4}%` }}
                            className={`w-1.5 sm:w-2 rounded-full transition-all duration-300 ${
                              item.filled === 0 ? 'bg-stone-200' : 'bg-[#dad0c3] group-hover:bg-[#c7baa8]'
                            }`}
                          />
                        </div>

                        {/* Month Label */}
                        <span
                          className={`text-[11px] font-semibold mt-3 transition-colors ${
                            isSelected ? 'text-[#598A31] font-bold' : 'text-stone-400 group-hover:text-stone-700'
                          }`}
                        >
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>
                {events.length > 0
                  ? 'Roster demand dynamically calculated from scheduled shifts.'
                  : 'No shifts scheduled yet. Click "+ New Shift" to publish event rosters.'}
              </span>
              <button
                onClick={() => onNavigate('events')}
                className="text-[#598A31] hover:text-[#487226] font-bold inline-flex items-center gap-1"
              >
                View Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Card: Pending Approvals (1 col) */}
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-stone-900 tracking-tight">Pending Approvals</h3>
                  <span className="w-6 h-6 rounded-full bg-[#e6f0dc] text-[#598A31] text-xs font-black flex items-center justify-center">
                    {pendingKYCStaff.length}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#f7f4ef] text-stone-400 flex items-center justify-center">
                  <Minus className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Pending Approvals List matching Jobgio */}
              <div className="pt-4 space-y-3.5">
                {pendingKYCStaff.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-400">
                    <UserCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    All registered staff KYC verified!
                  </div>
                ) : (
                  pendingKYCStaff.slice(0, 4).map((staff) => (
                    <div
                      key={staff.id}
                      onClick={() => onNavigate('staff')}
                      className="p-3 rounded-2xl bg-[#fbf9f6] hover:bg-[#f7f4ef] transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {staff.name ? staff.name[0].toUpperCase() : 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 group-hover:text-[#598A31] transition-colors">
                            {staff.name}
                          </p>
                          <p className="text-[11px] text-stone-500 font-medium">
                            {staff.phone || 'Uploaded ID Proof'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-stone-700 bg-white px-3 py-1 rounded-full shadow-xs">
                        Pending
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold rounded-xl border-0 bg-[#f7f4ef] text-stone-800 hover:bg-[#eee9df] shadow-xs"
                onClick={() => onNavigate('staff')}
              >
                Inspect All Verification Queues
              </Button>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Manage Jobs / Shifts Table (Matching Jobgio Bottom Section) */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900 tracking-tight">Manage Shifts</h3>
              <p className="text-xs text-stone-500 font-medium">Scheduled catering events and server rosters</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Filter Dropdown Pill */}
              <div className="relative">
                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value as EventStatus | 'all')}
                  className="appearance-none bg-[#f7f4ef] text-stone-800 text-xs font-bold rounded-2xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#598A31]/20 cursor-pointer shadow-xs"
                >
                  <option value="all">Status ▾</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-3 pointer-events-none" />
              </div>

              {/* Action Button matching Jobgio */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateEventOpen(true)}
                icon={Plus}
                className="rounded-2xl px-4 py-2 text-xs font-bold"
              >
                New Shift
              </Button>
            </div>
          </div>

          {/* Table Content */}
          <div className="pt-4 overflow-x-auto">
            {filteredTableEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                No shifts match the selected status.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-stone-700">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-stone-400 pb-2">
                    <th className="py-3 px-3">Shift Title</th>
                    <th className="py-3 px-3">Venue & Slot</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Capacity</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTableEvents.slice(0, 6).map((evt) => {
                    const fillPct = Math.min(
                      100,
                      Math.round((evt.filledCount / (evt.headcount || 1)) * 100)
                    );
                    return (
                      <tr
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className="hover:bg-[#faf8f5] transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-3 font-bold text-stone-900 group-hover:text-[#598A31] transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#e6f0dc] text-[#598A31] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="truncate max-w-[200px]">{evt.title}</span>
                          </div>
                        </td>

                        <td className="py-4 px-3 text-xs text-stone-600">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-semibold text-stone-800 line-clamp-1">
                              <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{evt.venue.text}</span>
                            </div>
                            <SlotBadge slot={evt.slot} />
                          </div>
                        </td>

                        <td className="py-4 px-3 text-xs text-stone-600">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-stone-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-stone-400" />
                              {evt.date}
                            </span>
                            <span className="text-stone-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {evt.startTime} - {evt.endTime}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <div className="w-28 space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                              <span>{evt.filledCount}/{evt.headcount}</span>
                              <span className="text-[10px] text-stone-400 font-normal">{fillPct}%</span>
                            </div>
                            <div className="w-full bg-[#f4f0ea] rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  fillPct >= 100 ? 'bg-emerald-600' : 'bg-[#598A31]'
                                }`}
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <StatusBadge status={evt.status} />
                        </td>

                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(evt);
                            }}
                            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#dad0c3]/40 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSuccess={() => refetchEvents()}
      />

      <GenerateInviteModal
        isOpen={isGenerateInviteOpen}
        onClose={() => setIsGenerateInviteOpen(false)}
        onSuccess={() => refetchInvites()}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEventUpdated={() => refetchEvents()}
      />
    </div>
  );
}
