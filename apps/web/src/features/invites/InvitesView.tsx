import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invitesApi } from '../../api/invites.api';
import { queryKeys } from '../../api/queryKeys';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableEmpty } from '../../components/ui/Table';
import { Header } from '../../components/layout/Header';
import { GenerateInviteModal } from './GenerateInviteModal';
import type { InviteCodeStatus } from '@tebeya/shared';
import { Plus, Copy, Check, ShieldAlert, KeyRound } from 'lucide-react';

export function InvitesView() {
  const [statusFilter, setStatusFilter] = useState<InviteCodeStatus | 'all'>('all');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const {
    data: codes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.invites.list(statusFilter === 'all' ? undefined : statusFilter),
    queryFn: () =>
      invitesApi.list(statusFilter === 'all' ? undefined : (statusFilter as InviteCodeStatus)),
    refetchInterval: 5000,
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this invite code? It will no longer be redeemable.')) {
      return;
    }
    try {
      await invitesApi.revoke(id);
      refetch();
    } catch {
      alert('Failed to revoke code');
    }
  };

  const filterTabs: Array<{ label: string; value: InviteCodeStatus | 'all' }> = [
    { label: 'All Codes', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Used', value: 'used' },
    { label: 'Expired', value: 'expired' },
    { label: 'Revoked', value: 'revoked' },
  ];

  return (
    <div>
      <Header
        title="Invite Codes Governance"
        subtitle="Manage restricted, single-use onboarding access codes for catering service staff."
        action={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsGenerateModalOpen(true)}
          >
            Generate Codes
          </Button>
        }
      />

      <div className="px-6 sm:px-8 py-3 space-y-6 pb-12">
        {/* Info Banner */}
        <div className="bg-white p-5 rounded-3xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-[#e6f0dc] rounded-2xl text-[#598A31] flex-shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-stone-900">
              Invite-Only Registration Policy Active
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              New catering staff cannot register without an active, unexpired invite code issued by an administrator.
              Each code is single-use and expires after the configured duration.
            </p>
          </div>
        </div>

        {/* Filter bar */}
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
            Showing {codes.length} code(s)
          </div>
        </div>

        {/* Codes Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Invite Code</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Expires At (TTL)</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-stone-400">
                    Loading invite codes...
                  </td>
                </tr>
              </tbody>
            ) : codes.length === 0 ? (
              <TableEmpty message="No invite codes found for this filter." />
            ) : (
              <tbody>
                {codes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-stone-900 tracking-wider bg-[#f7f4ef] px-2.5 py-1 rounded-xl">
                          {item.code}
                        </span>
                        <button
                          onClick={() => handleCopy(item.code)}
                          className="p-1 text-stone-400 hover:text-[#598A31] rounded transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === item.code ? (
                            <Check className="w-4 h-4 text-[#598A31]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-stone-700 font-medium">
                        {new Date(item.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleRevoke(item.id)}
                          icon={ShieldAlert}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            )}
          </Table>
        </div>
      </div>

      <GenerateInviteModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
