import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  IndianRupee,
  CalendarCheck2,
  ClockAlert,
  ArrowUpRight,
} from 'lucide-react-native';
import { EarningsSummary } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Header } from '../../src/components/layout/Header';
import { AttendanceBadge, PayoutBadge, SlotBadge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/layout/EmptyState';
import { earningsApi } from '../../src/api/earnings.api';

export default function EarningsScreen() {
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
    isRefetching: isSummaryRefetching,
  } = useQuery<EarningsSummary>({
    queryKey: ['earnings-summary'],
    queryFn: () => earningsApi.getSummary(),
  });

  const {
    data: history = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
    isRefetching: isHistoryRefetching,
  } = useQuery({
    queryKey: ['earnings-history', selectedMonth],
    queryFn: () => earningsApi.getHistory(selectedMonth),
  });

  const onRefresh = () => {
    refetchSummary();
    refetchHistory();
  };

  const isRefreshing = isSummaryRefetching || isHistoryRefetching;

  return (
    <ScreenWrapper>
      <Header title="History & Earnings" />

      <FlatList
        data={history}
        keyExtractor={(item) => item.booking.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="mb-6">
            {/* Financial Overview Cards Grid (FR-17) */}
            <View className="flex-row mb-3">
              <View className="flex-1 bg-indigo-600 rounded-2xl p-4 mr-2 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-semibold text-indigo-200">
                    Total Lifetime
                  </Text>
                  <Wallet size={16} color="#c7d2fe" />
                </View>
                <Text className="text-2xl font-black text-white">
                  ₹{summary?.totalEarnings?.toLocaleString() || '0'}
                </Text>
                <Text className="text-[11px] text-indigo-200 mt-1">
                  Across all verified shifts
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-4 ml-2 border border-slate-200 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-semibold text-slate-500">
                    This Month
                  </Text>
                  <IndianRupee size={16} color="#10b981" />
                </View>
                <Text className="text-2xl font-black text-slate-900">
                  ₹{summary?.currentMonthEarnings?.toLocaleString() || '0'}
                </Text>
                <Text className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Current payout cycle
                </Text>
              </View>
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 bg-white rounded-2xl p-3.5 mr-2 border border-slate-200">
                <View className="flex-row items-center mb-1">
                  <CalendarCheck2 size={14} color="#6366f1" />
                  <Text className="text-xs font-semibold text-slate-500 ml-1.5">
                    Shifts Completed
                  </Text>
                </View>
                <Text className="text-lg font-black text-slate-900">
                  {summary?.totalEventsWorked || 0}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-3.5 ml-2 border border-slate-200">
                <View className="flex-row items-center mb-1">
                  <ClockAlert size={14} color="#f59e0b" />
                  <Text className="text-xs font-semibold text-slate-500 ml-1.5">
                    Pending Payouts
                  </Text>
                </View>
                <Text className="text-lg font-black text-slate-900">
                  ₹{summary?.pendingPayouts?.toLocaleString() || '0'}
                </Text>
              </View>
            </View>

            {/* Shift History Section Header */}
            <View className="flex-row justify-between items-center mt-2 mb-2">
              <Text className="text-base font-bold text-slate-900">
                Past Shifts & Wages
              </Text>
              <Text className="text-xs text-slate-500">
                {history.length} {history.length === 1 ? 'Record' : 'Records'}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-200 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-bold text-slate-500">
                {item.event.date}
              </Text>
              <View className="flex-row space-x-1.5">
                <AttendanceBadge status={item.booking.attendance} />
                <View className="w-1.5" />
                <PayoutBadge status={item.booking.payoutStatus} />
              </View>
            </View>

            <Text className="text-base font-bold text-slate-900 mb-1">
              {item.event.title}
            </Text>

            <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-slate-100">
              <SlotBadge slot={item.event.slot} />
              <View className="items-end">
                <Text className="text-base font-black text-indigo-700">
                  ₹{item.booking.payoutAmount || item.event.payPerPerson}
                </Text>
                <Text className="text-[10px] text-slate-500">
                  Total Earned
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isHistoryLoading ? (
            <EmptyState
              title="No Past Shift History"
              description="Completed shifts, verified attendance, and weekly payments will appear here."
            />
          ) : null
        }
      />
    </ScreenWrapper>
  );
}
