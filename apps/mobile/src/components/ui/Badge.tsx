import React from 'react';
import { View, Text } from 'react-native';
import { EventSlot, AttendanceStatus, PayoutStatus, UserStatus } from '@tebeya/shared';
import { SLOT_INFO } from '../../constants/config';

interface SlotBadgeProps {
  slot: EventSlot;
}

export const SlotBadge: React.FC<SlotBadgeProps> = ({ slot }) => {
  const info = SLOT_INFO[slot] || SLOT_INFO.custom;
  return (
    <View className={`px-2.5 py-1 rounded-full border ${info.badgeClass}`}>
      <Text className={`text-xs font-semibold ${info.textClass}`}>
        {info.label}
      </Text>
    </View>
  );
};

interface AttendanceBadgeProps {
  status: AttendanceStatus;
}

export const AttendanceBadge: React.FC<AttendanceBadgeProps> = ({ status }) => {
  switch (status) {
    case 'present':
      return (
        <View className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200">
          <Text className="text-xs font-semibold text-emerald-800">Present</Text>
        </View>
      );
    case 'late':
      return (
        <View className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200">
          <Text className="text-xs font-semibold text-amber-800">Late</Text>
        </View>
      );
    case 'absent':
      return (
        <View className="px-2.5 py-1 rounded-full bg-rose-100 border border-rose-200">
          <Text className="text-xs font-semibold text-rose-800">Absent</Text>
        </View>
      );
    case 'pending':
    default:
      return (
        <View className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
          <Text className="text-xs font-semibold text-slate-700">Pending</Text>
        </View>
      );
  }
};

interface PayoutBadgeProps {
  status: PayoutStatus;
}

export const PayoutBadge: React.FC<PayoutBadgeProps> = ({ status }) => {
  if (status === 'paid') {
    return (
      <View className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200">
        <Text className="text-xs font-semibold text-emerald-800">Paid</Text>
      </View>
    );
  }
  return (
    <View className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
      <Text className="text-xs font-semibold text-slate-700">Unpaid</Text>
    </View>
  );
};

interface UserStatusBadgeProps {
  status: UserStatus;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'active':
      return (
        <View className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
          <Text className="text-xs font-medium text-emerald-700">Active</Text>
        </View>
      );
    case 'pending_verification':
      return (
        <View className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
          <Text className="text-xs font-medium text-amber-700">Verification Pending</Text>
        </View>
      );
    case 'suspended':
      return (
        <View className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
          <Text className="text-xs font-medium text-rose-700">Suspended</Text>
        </View>
      );
    default:
      return null;
  }
};
