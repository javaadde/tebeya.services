import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { invitesApi } from '../../api/invites.api';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

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
  const [expiresInMinutes, setExpiresInMinutes] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await invitesApi.generate({
        count: Number(count),
        expiresInMinutes: Number(expiresInMinutes),
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
      description="Issue fast-expiring access codes required for staff onboarding."
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
          <label className="block text-xs font-bold text-stone-700 mb-2">
            Code Validity (TTL)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setExpiresInMinutes(1)}
              className={cn(
                'py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center',
                expiresInMinutes === 1
                  ? 'bg-[#598A31] text-white shadow-sm'
                  : 'bg-[#f7f4ef] text-stone-700 hover:bg-[#ede8e1]'
              )}
            >
              1 Minute
            </button>
            <button
              type="button"
              onClick={() => setExpiresInMinutes(2)}
              className={cn(
                'py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center',
                expiresInMinutes === 2
                  ? 'bg-[#598A31] text-white shadow-sm'
                  : 'bg-[#f7f4ef] text-stone-700 hover:bg-[#ede8e1]'
              )}
            >
              2 Minutes (Default)
            </button>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5">
            The code will be automatically deleted from the database after expiration.
          </p>
        </div>

        <div className="bg-[#e6f0dc] p-3.5 rounded-2xl text-xs text-[#213514] flex items-start gap-2.5 shadow-2xs">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#598A31]" />
          <span>
            <strong className="font-bold">Security Rule:</strong> Each invite code is strictly single-use and will automatically be deleted from the database once the {expiresInMinutes}-minute TTL elapses.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
          <Button variant="outline" type="button" onClick={onClose} className="rounded-xl border-0 bg-[#f7f4ef] text-stone-700 hover:bg-[#eee9df]">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading} icon={KeyRound} className="rounded-xl">
            Generate {count > 1 ? `${count} Codes` : 'Code'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
