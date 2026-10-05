import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { staffApi, type StaffListItem } from '../../api/staff.api';
import type { UserStatus } from '@tebeya/shared';
import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserCheck,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface StaffDetailModalProps {
  staff: StaffListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function StaffDetailModal({
  staff,
  isOpen,
  onClose,
  onUpdated,
}: StaffDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  if (!staff) return null;

  const handleUpdateStatus = async (newStatus: UserStatus) => {
    setIsUpdating(true);
    setFeedback(null);
    try {
      await staffApi.updateStatus(staff.id, { status: newStatus });
      setFeedback({
        type: 'success',
        message: `Staff status updated to ${newStatus.replace('_', ' ')}.`,
      });
      onUpdated();
    } catch (err: unknown) {
      setFeedback({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to update status',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePhoneVerification = async () => {
    setIsUpdating(true);
    setFeedback(null);
    try {
      await staffApi.updateStatus(staff.id, {
        phoneVerified: !staff.phoneVerified,
      });
      setFeedback({
        type: 'success',
        message: `Phone verification set to ${!staff.phoneVerified ? 'Verified' : 'Unverified'}.`,
      });
      onUpdated();
    } catch (err: unknown) {
      setFeedback({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to update phone verification',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staff.name}
      description={`Staff ID: ${staff.id.slice(-8)} · Registered on ${new Date(staff.createdAt).toLocaleDateString()}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}

        {/* Top Status & Metrics Grid */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500 font-medium block">Account Status</span>
            <div className="mt-1">
              <StatusBadge status={staff.status} />
            </div>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Phone Verification</span>
            <div className="mt-1 font-semibold text-gray-900 flex items-center gap-1">
              {staff.phoneVerified ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="text-amber-700">Unverified</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Completed Shifts</span>
            <div className="mt-1 font-bold text-gray-900 text-sm">
              {staff.completedCount ?? 0}
            </div>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">No-Show Flags</span>
            <div className={`mt-1 font-bold text-sm ${((staff.noShowCount ?? 0) > 0) ? 'text-rose-600' : 'text-gray-900'}`}>
              {staff.noShowCount ?? 0}
            </div>
          </div>
        </div>

        {/* Contact & Address Information */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
          <h4 className="font-bold text-gray-900 text-sm mb-2">Staff Profile & Contact</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-gray-500 block">Mobile Phone:</span>
              <span className="font-mono text-gray-900 font-semibold">{staff.phone}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Email Address:</span>
              <span className="text-gray-900">{staff.email}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-stone-500 block">Registered Address (for travel radius):</span>
            <div className="flex items-center gap-1.5 text-stone-800 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#598A31] flex-shrink-0" />
              <span>{staff.address?.text || 'No address confirmed'}</span>
            </div>
          </div>
        </div>

        {/* Private KYC ID Proof Review */}
        <div className="bg-white p-4 rounded-2xl border border-[#dad0c3] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#598A31]" />
              Government ID Proof (Private KYC Asset)
            </h4>
            <span className="text-[11px] bg-[#e6f0dc] text-[#487226] border border-[#cee2be] px-2.5 py-0.5 rounded-full font-bold">
              Rule 4 Compliant
            </span>
          </div>

          {staff.idProofUrl ? (
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden border border-[#dad0c3] bg-[#f7f4ef] p-2 text-center">
                <img
                  src={staff.idProofUrl}
                  alt="Staff ID Proof"
                  className="max-h-60 mx-auto rounded-xl object-contain"
                />
              </div>
              <div className="flex justify-end">
                <a
                  href={staff.idProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#598A31] hover:underline font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Original Document
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
              No ID proof document uploaded yet.
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePhoneVerification}
            isLoading={isUpdating}
            icon={UserCheck}
          >
            {staff.phoneVerified ? 'Revoke Phone Verification' : 'Verify Phone Number'}
          </Button>

          <div className="flex items-center gap-2">
            {staff.status === 'pending_verification' && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle}
                isLoading={isUpdating}
                onClick={() => handleUpdateStatus('active')}
              >
                Approve & Activate Staff
              </Button>
            )}

            {staff.status === 'active' && (
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                isLoading={isUpdating}
                onClick={() => handleUpdateStatus('suspended')}
              >
                Suspend Account
              </Button>
            )}

            {staff.status === 'suspended' && (
              <Button
                variant="primary"
                size="sm"
                icon={ShieldCheck}
                isLoading={isUpdating}
                onClick={() => handleUpdateStatus('active')}
              >
                Reactivate Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
