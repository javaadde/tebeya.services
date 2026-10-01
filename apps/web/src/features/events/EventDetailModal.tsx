import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SlotBadge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Table, TableHead, TableHeader, TableRow, TableCell } from '../../components/ui/Table';
import { eventsApi } from '../../api/events.api';
import { rosterApi, type EventRosterResponse } from '../../api/roster.api';
import type { CateringEvent, AttendanceStatus, RosterItem } from '@tebeya/shared';
import {
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Send,
  XCircle,
  Download,
  CheckCircle,
} from 'lucide-react';

interface EventDetailModalProps {
  event: CateringEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEventUpdated,
}: EventDetailModalProps) {
  const [rosterData, setRosterData] = useState<EventRosterResponse | null>(null);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    if (event && isOpen) {
      loadRoster(event.id);
    } else {
      setRosterData(null);
      setAttendanceState({});
      setFeedback(null);
    }
  }, [event, isOpen]);

  const loadRoster = async (eventId: string) => {
    setIsLoadingRoster(true);
    try {
      const data = await rosterApi.getRoster(eventId);
      setRosterData(data);
      const initial: Record<string, AttendanceStatus> = {};
      data.roster.forEach((r) => {
        initial[r.bookingId] = r.attendance;
      });
      setAttendanceState(initial);
    } catch {
      // Failed to load roster
    } finally {
      setIsLoadingRoster(false);
    }
  };

  if (!event) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    setFeedback(null);
    try {
      await eventsApi.publish(event.id);
      setFeedback({
        type: 'success',
        message: 'Event published! Staff mobile apps have been notified via push broadcast.',
      });
      onEventUpdated();
    } catch (err: unknown) {
      setFeedback({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to publish event',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this event? All joined staff will be notified.')) {
      return;
    }
    setIsCancelling(true);
    setFeedback(null);
    try {
      await eventsApi.cancel(event.id);
      setFeedback({
        type: 'success',
        message: 'Event cancelled. All active bookings have been voided.',
      });
      onEventUpdated();
    } catch (err: unknown) {
      setFeedback({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to cancel event',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    setFeedback(null);
    try {
      const items = Object.entries(attendanceState).map(([bookingId, attendance]) => ({
        bookingId,
        attendance,
      }));
      await rosterApi.markAttendance(event.id, items);
      setFeedback({
        type: 'success',
        message: 'Attendance recorded successfully.',
      });
      loadRoster(event.id);
      onEventUpdated();
    } catch (err: unknown) {
      setFeedback({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to save attendance',
      });
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const fillPercentage = Math.min(
    100,
    Math.round((event.filledCount / (event.headcount || 1)) * 100)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      description={`Scheduled on ${event.date} · Slot: ${event.slot}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}

        {/* Top Metric Bar */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500 font-medium block">Current Status</span>
            <div className="mt-1">
              <StatusBadge status={event.status} />
            </div>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Meal Slot</span>
            <div className="mt-1">
              <SlotBadge slot={event.slot} />
            </div>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Base Pay / Server</span>
            <div className="mt-1 font-bold text-gray-900 text-sm flex items-center">
              <IndianRupee className="w-3.5 h-3.5" />
              {event.payPerPerson}
            </div>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Headcount Capacity</span>
            <div className="mt-1 font-bold text-gray-900 text-sm">
              {event.filledCount} / {event.headcount} ({fillPercentage}%)
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 text-sm mb-2">Schedule & Venue</h4>
            <p className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{event.date}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>
                {event.startTime} - {event.endTime} (24h)
              </span>
            </p>
            <p className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{event.venue.text}</span>
            </p>
          </div>

          <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 text-sm mb-2">Banquet Operations</h4>
            {event.dressCode && (
              <p className="text-gray-600">
                <span className="font-semibold text-gray-700">Dress Code:</span>{' '}
                {event.dressCode}
              </p>
            )}
            {event.contactPerson?.name && (
              <p className="text-gray-600">
                <span className="font-semibold text-gray-700">Coordinator:</span>{' '}
                {event.contactPerson.name} ({event.contactPerson.phone})
              </p>
            )}
            {event.notes && (
              <p className="text-gray-600">
                <span className="font-semibold text-gray-700">Notes:</span> {event.notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {event.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                isLoading={isPublishing}
                onClick={handlePublish}
              >
                Publish to Staff Mobile App
              </Button>
            )}
            {event.status !== 'cancelled' && event.status !== 'completed' && (
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                isLoading={isCancelling}
                onClick={handleCancel}
              >
                Cancel Shift
              </Button>
            )}
          </div>

          <a
            href={rosterApi.getExportCsvUrl(event.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            Export Roster CSV
          </a>
        </div>

        {/* Live Roster Table */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Live Server Roster ({rosterData?.roster.length || 0} joined)
              </h4>
              <p className="text-xs text-gray-500">
                Mark shift attendance to authorize wage payouts.
              </p>
            </div>
            {rosterData && rosterData.roster.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle}
                isLoading={isSavingAttendance}
                onClick={handleSaveAttendance}
              >
                Save Attendance
              </Button>
            )}
          </div>

          {isLoadingRoster ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading roster...</div>
          ) : !rosterData || rosterData.roster.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No staff members have joined this shift yet.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Staff Member</TableHeader>
                  <TableHeader>Mobile</TableHeader>
                  <TableHeader>Booking Status</TableHeader>
                  <TableHeader>Attendance Status</TableHeader>
                  <TableHeader>Payout Status</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {rosterData.roster.map((item: RosterItem) => (
                  <TableRow key={item.bookingId}>
                    <TableCell>
                      <div className="font-semibold text-gray-900">{item.user.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-gray-600">
                        {item.user.phone || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <select
                        value={attendanceState[item.bookingId] || item.attendance}
                        onChange={(e) =>
                          setAttendanceState((prev) => ({
                            ...prev,
                            [item.bookingId]: e.target.value as AttendanceStatus,
                          }))
                        }
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="present">Present (Eligible)</option>
                        <option value="late">Late (Eligible)</option>
                        <option value="absent">Absent (No-Show)</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.payoutStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </Modal>
  );
}
