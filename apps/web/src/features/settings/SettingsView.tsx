import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { wageApi } from '../../api/wage.api';
import { queryKeys } from '../../api/queryKeys';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Header } from '../../components/layout/Header';
import { Sliders, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function SettingsView() {
  const { data: wageRule, refetch } = useQuery({
    queryKey: queryKeys.wages.rule,
    queryFn: () => wageApi.getWageRule(),
  });

  const [basePay, setBasePay] = useState(800);
  const [freeKm, setFreeKm] = useState(15);
  const [perKmRate, setPerKmRate] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  useEffect(() => {
    if (wageRule) {
      setBasePay(wageRule.basePay ?? 800);
      setFreeKm(wageRule.freeKm ?? 15);
      setPerKmRate(wageRule.perKmRate ?? 10);
    }
  }, [wageRule]);

  const handleSaveWageRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await wageApi.updateWageRule({
        basePay: Number(basePay),
        freeKm: Number(freeKm),
        perKmRate: Number(perKmRate),
      });
      setFeedback({
        type: 'success',
        message: 'Global wage and travel allowance rule updated successfully.',
      });
      refetch();
    } catch (err: unknown) {
      setFeedback({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to update wage rules',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Settings & System Policies"
        subtitle="Configure default server wage structures, travel allowances, and operational parameters."
      />

      <div className="px-6 sm:px-8 py-3 max-w-4xl space-y-6 pb-12">
        {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}

        {/* Wage Rules Configuration */}
        <Card>
          <CardHeader
            title="Standard Server Wage & Travel Allowances"
            subtitle="Defines baseline shift compensation and per-kilometer travel reimbursement above the threshold."
          />

          <form onSubmit={handleSaveWageRule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Base Pay Per Shift (₹)"
                type="number"
                min={0}
                required
                value={basePay}
                onChange={(e) => setBasePay(Number(e.target.value))}
                helperText="Baseline pay before travel additions"
              />
              <Input
                label="Free Travel Buffer (km)"
                type="number"
                min={0}
                required
                value={freeKm}
                onChange={(e) => setFreeKm(Number(e.target.value))}
                helperText="Distance included in base pay"
              />
              <Input
                label="Per-KM Travel Rate (₹)"
                type="number"
                min={0}
                required
                value={perKmRate}
                onChange={(e) => setPerKmRate(Number(e.target.value))}
                helperText="Reimbursement per extra kilometer"
              />
            </div>

            {/* Travel Formula Box */}
            <div className="p-4 bg-[#f7f4ef] rounded-2xl shadow-xs text-xs text-stone-900">
              <h5 className="font-bold mb-1 flex items-center gap-1.5 text-stone-900">
                <Sliders className="w-3.5 h-3.5 text-[#598A31]" />
                Live Travel Calculation Formula
              </h5>
              <p className="font-mono text-stone-800 bg-white/90 p-2.5 rounded-xl shadow-xs my-1.5 font-bold">
                Total Payout = ₹{basePay} + Max(0, Distance - {freeKm} km) × ₹{perKmRate}/km
              </p>
              <p className="text-[11px] text-stone-600">
                Example: A server traveling 25 km to a banquet receives ₹{basePay} + (10 km × ₹{perKmRate}) = ₹{basePay + 10 * perKmRate}.
              </p>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                type="submit"
                isLoading={isSaving}
                icon={CheckCircle2}
                className="rounded-xl px-5 py-2 font-bold"
              >
                Save Wage Rule
              </Button>
            </div>
          </form>
        </Card>

        {/* Architectural Policies & Compliance Card */}
        <Card>
          <CardHeader
            title="Monorepo Operating Invariants & Guardrails"
            subtitle="Core operational invariants enforced by the backend API and honored by the admin portal."
          />

          <div className="space-y-3 text-xs text-stone-600">
            <div className="flex items-start gap-3 p-3.5 bg-[#f7f4ef] rounded-2xl shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#598A31] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block font-bold">Rule 1: Shared Domain Contracts</strong>
                All entity schemas (CateringEvent, Booking, User, InviteCode) originate from @tebeya/shared.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#f7f4ef] rounded-2xl shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#598A31] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block font-bold">Rule 2: Server-Side Clash & Capacity Authority</strong>
                Hard overlap checks (startA &lt; endB and startB &lt; endA), daily 2-event maximums, and atomic seat increments are strictly enforced by the backend API.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#f7f4ef] rounded-2xl shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#598A31] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block font-bold">Rule 3: Restricted Invite-Only Onboarding</strong>
                Open self-registration is disabled. Mobile staff signups require valid, single-use, admin-issued invite codes.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#f7f4ef] rounded-2xl shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#598A31] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block font-bold">Rule 4: Private KYC Document Storage</strong>
                Staff Government ID proof documents are stored in Cloudinary authenticated mode and viewed using short-lived signed URLs.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
