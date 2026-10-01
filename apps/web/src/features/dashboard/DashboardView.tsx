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
import type { CateringEvent } from '@tebeya/shared';
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
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavItemKey) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isGenerateInviteOpen, setIsGenerateInviteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CateringEvent | null>(null);

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

  return (
    <div>
      <Header
        title="Admin Operations Dashboard"
        subtitle="Real-time capacity tracking, event scheduling, and restricted staff onboarding."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={KeyRound}
              onClick={() => setIsGenerateInviteOpen(true)}
            >
              Issue Invite
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateEventOpen(true)}
            >
              New Shift
            </Button>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Upcoming Events"
            value={upcomingEvents.length}
            subtext="Active catering shifts"
            icon={CalendarDays}
            variant="default"
          />
          <StatCard
            label="Server Headcount Filled"
            value={`${fillRatePct}%`}
            subtext={`${totalFilled} of ${totalHeadcount} positions filled`}
            icon={Users}
            variant="emerald"
          />
          <StatCard
            label="Active Invite Codes"
            value={invites.length}
            subtext="Unredeemed onboarding passes"
            icon={KeyRound}
            variant="blue"
          />
          <StatCard
            label="Pending KYC Reviews"
            value={pendingKYCStaff.length}
            subtext="Candidate ID proofs to verify"
            icon={ShieldAlert}
            variant={pendingKYCStaff.length > 0 ? 'amber' : 'default'}
          />
        </div>

        {/* Operational Attention & Understaffed Shifts Banner */}
        {understaffedEvents.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    {understaffedEvents.length} Shift(s) Require Server Allocation
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    These published events currently have unfilled server slots. Staff will see these as priority shifts on the mobile app.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 flex-shrink-0"
                onClick={() => onNavigate('events')}
              >
                Inspect All Rosters
              </Button>
            </div>
          </div>
        )}

        {/* Main 2-Column Section: Upcoming Shifts & Staff Verification Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Shifts (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Upcoming Shifts</h3>
                <p className="text-xs text-gray-500">Scheduled catering banquet events</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('events')}
                className="text-emerald-700 hover:text-emerald-800"
              >
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No active events scheduled. Click "New Shift" above to add one.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 4).map((evt) => {
                  const fillPct = Math.min(
                    100,
                    Math.round((evt.filledCount / (evt.headcount || 1)) * 100)
                  );
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {evt.title}
                          </h4>
                          <SlotBadge slot={evt.slot} />
                          <StatusBadge status={evt.status} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {evt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {evt.startTime} - {evt.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="line-clamp-1">{evt.venue.text}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-gray-900">
                          {evt.filledCount} / {evt.headcount}
                        </span>
                        <div className="w-20 bg-gray-100 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-full rounded-full ${
                              fillPct >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Staff Verification Queue (1 col) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">KYC Verification Queue</h3>
                  <p className="text-xs text-gray-500">Review pending staff signups</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('staff')}
                  className="text-emerald-700 hover:text-emerald-800"
                >
                  View All
                </Button>
              </div>

              {pendingKYCStaff.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  All registered staff members have been verified!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingKYCStaff.slice(0, 4).map((staff) => (
                    <div
                      key={staff.id}
                      onClick={() => onNavigate('staff')}
                      className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {staff.name ? staff.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{staff.name}</p>
                          <p className="text-[11px] text-gray-500">{staff.phone}</p>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Review
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => onNavigate('invites')}
                icon={KeyRound}
              >
                Issue More Invite Codes
              </Button>
            </div>
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
