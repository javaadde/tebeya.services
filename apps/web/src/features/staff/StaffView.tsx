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

      <div className="px-6 sm:px-8 py-3 space-y-6 pb-12">
        {/* Top Controls Bar */}
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

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-[#598A31]/20"
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
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
                        <div className="w-8 h-8 rounded-xl bg-[#e6f0dc] text-[#598A31] flex items-center justify-center font-bold text-xs">
                          {staff.name ? staff.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-sm">
                            {staff.name}
                          </div>
                          <div className="text-xs text-stone-400">{staff.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-stone-600">{staff.phone}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={staff.status} />
                    </TableCell>
                    <TableCell>
                      {staff.phoneVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-stone-800">
                        {staff.completedCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold ${
                          (staff.noShowCount ?? 0) > 0 ? 'text-rose-600' : 'text-stone-400'
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
                        className="inline-flex items-center gap-1 text-xs text-[#598A31] font-bold hover:underline"
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
        <div className="p-4 bg-[#f7f4ef] rounded-2xl shadow-xs text-xs text-stone-600 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#598A31] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-stone-900">Private Storage Compliance (Rule 4):</strong> Staff government ID proof images are stored in Cloudinary authenticated mode. Signed temporary links expire automatically to protect candidate privacy.
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
