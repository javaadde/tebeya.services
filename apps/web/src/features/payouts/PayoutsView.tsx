import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import { rosterApi } from '../../api/roster.api';
import { wageApi } from '../../api/wage.api';
import { queryKeys } from '../../api/queryKeys';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableEmpty } from '../../components/ui/Table';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/ui/StatCard';
import { Alert } from '../../components/ui/Alert';
import type { AttendanceStatus, PayoutStatus } from '@tebeya/shared';
import { CreditCard, CheckCircle2, IndianRupee, RefreshCw } from 'lucide-react';

interface PayoutRowItem {
  bookingId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  staffName: string;
  staffPhone: string;
  attendance: AttendanceStatus;
  payoutAmount: number;
  payoutStatus: PayoutStatus;
}

export function PayoutsView() {
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Fetch all events and their rosters
  const {
    data: payoutItems = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['payouts', 'all-items'],
    queryFn: async (): Promise<PayoutRowItem[]> => {
      const events = await eventsApi.list();
      const rows: PayoutRowItem[] = [];

      for (const event of events) {
        try {
          const rosterRes = await rosterApi.getRoster(event.id);
          rosterRes.roster.forEach((r) => {
            rows.push({
              bookingId: r.bookingId,
              eventId: event.id,
              eventTitle: event.title,
              eventDate: event.date,
              staffName: r.user.name,
              staffPhone: r.user.phone,
              attendance: r.attendance,
              payoutAmount: r.payoutAmount || event.payPerPerson,
              payoutStatus: r.payoutStatus,
            });
          });
        } catch {
          // If roster fetch fails for an individual draft, skip
        }
      }

      return rows;
    },
  });

  const { data: wageRule } = useQuery({
    queryKey: queryKeys.wages.rule,
    queryFn: () => wageApi.getWageRule(),
  });

  const pendingItems = payoutItems.filter(
    (p) => (p.attendance === 'present' || p.attendance === 'late') && p.payoutStatus === 'pending'
  );

  const totalPendingAmount = pendingItems.reduce((acc, curr) => acc + curr.payoutAmount, 0);
  const totalPaidAmount = payoutItems
    .filter((p) => p.payoutStatus === 'paid')
    .reduce((acc, curr) => acc + curr.payoutAmount, 0);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBookingIds(pendingItems.map((p) => p.bookingId));
    } else {
      setSelectedBookingIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedBookingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleMarkSelectedPaid = async () => {
    if (selectedBookingIds.length === 0) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await wageApi.markPaid(selectedBookingIds);
      setFeedback({
        type: 'success',
        message: `${res.markedCount} booking(s) marked as paid.`,
      });
      setSelectedBookingIds([]);
      refetch();
    } catch (err: unknown) {
      setFeedback({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to mark bookings paid',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkSinglePaid = async (bookingId: string) => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      await wageApi.markPaid([bookingId]);
      setFeedback({
        type: 'success',
        message: 'Payout marked as paid.',
      });
      refetch();
    } catch (err: unknown) {
      setFeedback({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to mark payout',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Header
        title="Payments & Payouts Ledger"
        subtitle="Review verified attendance, calculate distance-based wages, and record server payouts."
        action={
          selectedBookingIds.length > 0 && (
            <Button
              variant="primary"
              icon={CheckCircle2}
              isLoading={isProcessing}
              onClick={handleMarkSelectedPaid}
            >
              Mark {selectedBookingIds.length} as Paid
            </Button>
          )
        }
      />

      <div className="p-8 space-y-6">
        {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            label="Pending Disbursements"
            value={`₹${totalPendingAmount.toLocaleString()}`}
            subtext={`${pendingItems.length} shift payouts awaiting payment`}
            icon={CreditCard}
            variant="amber"
          />
          <StatCard
            label="Total Settled Payouts"
            value={`₹${totalPaidAmount.toLocaleString()}`}
            subtext="Disbursed to servers"
            icon={IndianRupee}
            variant="emerald"
          />
          <StatCard
            label="Active Travel Wage Rule"
            value={`₹${wageRule?.basePay ?? 800} Base`}
            subtext={`+₹${wageRule?.perKmRate ?? 10}/km above ${wageRule?.freeKm ?? 15}km`}
            icon={RefreshCw}
            variant="blue"
          />
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Shift Attendance & Compensation Records
            </h3>
            <span className="text-xs text-gray-400">
              Total {payoutItems.length} record(s)
            </span>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      pendingItems.length > 0 &&
                      selectedBookingIds.length === pendingItems.length
                    }
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </TableHeader>
                <TableHeader>Staff Member</TableHeader>
                <TableHeader>Event Shift</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Attendance</TableHeader>
                <TableHeader>Payout Amount</TableHeader>
                <TableHeader>Payout Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-gray-400">
                    Loading payout ledger...
                  </td>
                </tr>
              </tbody>
            ) : payoutItems.length === 0 ? (
              <TableEmpty message="No shift bookings or attendance records available." />
            ) : (
              <tbody>
                {payoutItems.map((item) => {
                  const isEligibleForPay =
                    item.attendance === 'present' || item.attendance === 'late';
                  const isPending = item.payoutStatus === 'pending';

                  return (
                    <TableRow key={item.bookingId}>
                      <TableCell>
                        {isEligibleForPay && isPending && (
                          <input
                            type="checkbox"
                            checked={selectedBookingIds.includes(item.bookingId)}
                            onChange={() => handleToggleSelect(item.bookingId)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900">{item.staffName}</div>
                        <div className="font-mono text-xs text-gray-400">{item.staffPhone}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-800 text-xs">
                          {item.eventTitle}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">{item.eventDate}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.attendance} />
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900 text-sm">
                          ₹{item.payoutAmount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.payoutStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        {isEligibleForPay && isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            onClick={() => handleMarkSinglePaid(item.bookingId)}
                            isLoading={isProcessing}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}
