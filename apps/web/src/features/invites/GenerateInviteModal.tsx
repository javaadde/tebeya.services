import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { invitesApi } from '../../api/invites.api';
import { KeyRound, ShieldAlert } from 'lucide-react';

interface GenerateInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GenerateInviteModal({
  isOpen,
  onClose,
  onSuccess,
}: GenerateInviteModalProps) {
  const [count, setCount] = useState(1);
  const [expiresInHours, setExpiresInHours] = useState(48);
  const [lockedTarget, setLockedTarget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await invitesApi.generate({
        count: Number(count),
        expiresInHours: Number(expiresInHours),
        lockedPhoneOrEmail: lockedTarget || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate invite codes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Single-Use Invite Codes"
      description="Issue restricted access codes required for staff onboarding."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <Input
            label="Quantity of Codes"
            type="number"
            min={1}
            max={50}
            required
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            helperText="Generate 1 for an individual or batch generate up to 50 for orientation."
          />
        </div>

        <div>
          <Input
            label="Code Validity (Hours)"
            type="number"
            min={1}
            max={720}
            required
            value={expiresInHours}
            onChange={(e) => setExpiresInHours(Number(e.target.value))}
            helperText="Default: 48 hours. Code becomes invalid after expiration."
          />
        </div>

        <div>
          <Input
            label="Lock to Phone or Email (Optional)"
            placeholder="e.g. +91 98765 43210 or user@example.com"
            value={lockedTarget}
            onChange={(e) => setLockedTarget(e.target.value)}
            helperText="Prevents sharing: only this phone or email will be accepted during registration."
          />
        </div>

        <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Security Rule:</strong> Each invite code is strictly single-use and will be permanently retired once redeemed by a candidate.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading} icon={KeyRound}>
            Generate {count > 1 ? `${count} Codes` : 'Code'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
