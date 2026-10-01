import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { staffApi, type StaffListItem } from '../../api/staff.api';
import { queryKeys } from '../../api/queryKeys';
import { StatusBadge } from '../../components/ui/Badge';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableEmpty } from '../../components/ui/Table';
import { Header } from '../../components/layout/Header';
import { StaffDetailModal } from './StaffDetailModal';
import type { UserStatus } from '@tebeya/shared';
import { Search, UserCheck, ShieldAlert, ChevronRight } from 'lucide-react';

export function StaffView() {
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffListItem | null>(null);

  const {
    data: staffList = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.staff.list({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
    }),
    queryFn: () =>
      staffApi.list({
        status: statusFilter === 'all' ? undefined : (statusFilter as UserStatus),
        search: search || undefined,
      }),
  });

  const filterTabs: Array<{ label: string; value: UserStatus | 'all' }> = [
    { label: 'All Staff', value: 'all' },
    { label: 'Pending Verification', value: 'pending_verification' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
  ];

  return (
    <div>
      <Header
        title="Staff Management & KYC"
        subtitle="Verify catering server profiles, review government ID proofs, and manage deployment status."
      />

      <div className="p-8 space-y-6">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === tab.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Staff Member</TableHeader>
                <TableHeader>Mobile</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Phone Verified</TableHeader>
                <TableHeader>Completed Shifts</TableHeader>
                <TableHeader>No-Shows</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-400">
                    Loading staff directory...
                  </td>
                </tr>
              </tbody>
            ) : staffList.length === 0 ? (
              <TableEmpty message="No staff members found matching your search or filters." />
            ) : (
              <tbody>
                {staffList.map((staff) => (
                  <TableRow
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {staff.name ? staff.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {staff.name}
                          </div>
                          <div className="text-xs text-gray-400">{staff.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-gray-600">{staff.phone}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={staff.status} />
                    </TableCell>
                    <TableCell>
                      {staff.phoneVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                          <UserCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-gray-800">
                        {staff.completedCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold ${
                          (staff.noShowCount ?? 0) > 0 ? 'text-rose-600' : 'text-gray-400'
                        }`}
                      >
                        {staff.noShowCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStaff(staff);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                      >
                        Review Profile
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            )}
          </Table>
        </div>

        {/* Security / KYC Advisory */}
        <div className="p-4 bg-gray-100/70 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Private Storage Compliance (Rule 4):</strong> Staff government ID proof images are stored in Cloudinary authenticated mode. Signed temporary links expire automatically to protect candidate privacy.
          </div>
        </div>
      </div>

      <StaffDetailModal
        staff={selectedStaff}
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        onUpdated={() => refetch()}
      />
    </div>
  );
}
