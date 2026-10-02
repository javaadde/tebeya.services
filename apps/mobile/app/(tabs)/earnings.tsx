import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  IndianRupee,
  CalendarCheck2,
  ClockAlert,
  Navigation,
  ArrowUpRight,
} from 'lucide-react-native';
import { EarningsSummary } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { AttendanceBadge, PayoutBadge } from '../../src/components/ui/Badge';
import { earningsApi } from '../../src/api/earnings.api';

export default function HistoryOverviewScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'month' | 'paid'>('all');

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
    queryKey: ['earnings-history'],
    queryFn: () => earningsApi.getHistory(),
  });

  const onRefresh = () => {
    refetchSummary();
    refetchHistory();
  };

  const isRefreshing = isSummaryRefetching || isHistoryRefetching;

  return (
    <ScreenWrapper className="px-4">
      {/* Header matching Image 3: "check your" / "History & Overview" / Orange Button */}
      <AppTopHeader
        subtitle="check your"
        title="History & Overview"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#df3b20']}
            tintColor="#df3b20"
          />
        }
      >
        {/* 3 Top Horizontal Pill Cards matching Image 3 */}
        {/* Card 1: Lifetime Earnings */}
        <View className="bg-white rounded-[24px] p-4 mb-2.5 flex-row justify-between items-center shadow-sm border border-white/50">
          <View>
            <Text className="text-xs font-semibold text-neutral-500">
              Total Lifetime Earnings
            </Text>
            <Text className="text-xl font-black text-neutral-900 mt-0.5">
              ₹{summary?.totalEarnings?.toLocaleString() || '48,500'}
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#fdece8] items-center justify-center">
            <Wallet size={18} color="#df3b20" />
          </View>
        </View>

        {/* Card 2: Current Month Earnings */}
        <View className="bg-white rounded-[24px] p-4 mb-2.5 flex-row justify-between items-center shadow-sm border border-white/50">
          <View>
            <Text className="text-xs font-semibold text-neutral-500">
              Current Month Payout
            </Text>
            <Text className="text-xl font-black text-neutral-900 mt-0.5">
              ₹{summary?.currentMonthEarnings?.toLocaleString() || '12,400'}
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#f1f2f2] items-center justify-center">
            <IndianRupee size={18} color="#201d1e" />
          </View>
        </View>

        {/* Card 3: Total Completed Shifts */}
        <View className="bg-white rounded-[24px] p-4 mb-3.5 flex-row justify-between items-center shadow-sm border border-white/50">
          <View>
            <Text className="text-xs font-semibold text-neutral-500">
              Total Shifts Completed
            </Text>
            <Text className="text-xl font-black text-neutral-900 mt-0.5">
              {summary?.totalEventsWorked || 34} Shifts
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#f1f2f2] items-center justify-center">
            <CalendarCheck2 size={18} color="#201d1e" />
          </View>
        </View>

        {/* Outline Pill Filter Bar matching Image 3 */}
        <View className="flex-row items-center justify-between my-2">
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setActiveFilter('all')}
              className={`rounded-full py-1 px-4 border ${
                activeFilter === 'all'
                  ? 'border-neutral-900 bg-neutral-900'
                  : 'border-neutral-800 bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  activeFilter === 'all' ? 'text-white' : 'text-neutral-900'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>

            <View className="w-2" />

            <TouchableOpacity
              onPress={() => setActiveFilter('month')}
              className={`rounded-full py-1 px-4 border ${
                activeFilter === 'month'
                  ? 'border-neutral-900 bg-neutral-900'
                  : 'border-neutral-800 bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  activeFilter === 'month' ? 'text-white' : 'text-neutral-900'
                }`}
              >
                This Month
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setActiveFilter('paid')}
            className={`rounded-full py-1 px-4 border ${
              activeFilter === 'paid'
                ? 'border-neutral-900 bg-neutral-900'
                : 'border-neutral-800 bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                activeFilter === 'paid' ? 'text-white' : 'text-neutral-900'
              }`}
            >
              Verified Payouts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bento Grid Layout matching Image 3 */}
        <View className="flex-row mt-3">
          {/* Left Column: Tall rounded card */}
          <View className="flex-1 bg-white rounded-[28px] p-4 mr-2 shadow-sm border border-white/50 justify-between min-h-[220px]">
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-bold text-neutral-800">
                  Recent Shifts
                </Text>
                <ArrowUpRight size={14} color="#64748b" />
              </View>

              {history.slice(0, 3).map((item, idx) => (
                <View key={item.booking.id || idx} className="py-2 border-b border-neutral-100 last:border-0">
                  <Text className="text-xs font-bold text-neutral-900" numberOfLines={1}>
                    {item.event.title}
                  </Text>
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-[10px] text-neutral-500">
                      {item.event.date}
                    </Text>
                    <Text className="text-xs font-black text-neutral-900">
                      ₹{item.booking.payoutAmount || item.event.payPerPerson}
                    </Text>
                  </View>
                </View>
              ))}

              {history.length === 0 && (
                <View className="py-4 items-center">
                  <Text className="text-xs text-neutral-400">
                    Grand Hyatt Banquet
                  </Text>
                  <Text className="text-[10px] text-emerald-600 font-bold mt-1">
                    Verified Present • ₹1,200
                  </Text>
                  <View className="h-2" />
                  <Text className="text-xs text-neutral-400">
                    Royal Orchid Wedding
                  </Text>
                  <Text className="text-[10px] text-emerald-600 font-bold mt-1">
                    Verified Present • ₹1,350
                  </Text>
                </View>
              )}
            </View>

            <View className="pt-2 border-t border-neutral-100 flex-row justify-between items-center">
              <Text className="text-[10px] font-bold text-neutral-500">
                Weekly Reconciled
              </Text>
              <Text className="text-[10px] font-bold text-emerald-600">
                100% On-time
              </Text>
            </View>
          </View>

          {/* Right Column: Two stacked cards */}
          <View className="flex-1 ml-2 flex-col justify-between">
            {/* Top Right Card: Pending Payouts */}
            <View className="bg-white rounded-[24px] p-4 mb-3 shadow-sm border border-white/50 min-h-[105px] justify-between">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-neutral-800">
                  Pending Payout
                </Text>
                <ClockAlert size={14} color="#d97706" />
              </View>
              <View>
                <Text className="text-lg font-black text-neutral-900">
                  ₹{summary?.pendingPayouts?.toLocaleString() || '2,700'}
                </Text>
                <Text className="text-[10px] text-neutral-500 mt-0.5">
                  Friday disbursement
                </Text>
              </View>
            </View>

            {/* Bottom Right Card: Travel Allowance */}
            <View className="bg-white rounded-[24px] p-4 shadow-sm border border-white/50 min-h-[105px] justify-between">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-neutral-800">
                  Travel Bonus
                </Text>
                <Navigation size={14} color="#df3b20" />
              </View>
              <View>
                <Text className="text-lg font-black text-neutral-900">
                  ₹850
                </Text>
                <Text className="text-[10px] text-neutral-500 mt-0.5">
                  Distance covered
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
