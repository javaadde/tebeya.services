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
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react-native';
import { EarningsSummary } from '@tebeya/shared';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { AppTopHeader } from '../../src/components/layout/AppTopHeader';
import { earningsApi } from '../../src/api/earnings.api';

export default function HistoryOverviewScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'pending'>('all');

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
    <ScreenWrapper className="px-5" backgroundColor="bg-[#f4f3f3]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#598A31']}
            tintColor="#598A31"
          />
        }
      >
        <View className="mt-2" />
        <AppTopHeader
          subtitle="Check your"
          title="History & Overview"
          rightIcon={<FileText size={20} color="#ffffff" strokeWidth={2} />}
        />

        {/* Shift Overview Card */}
        <View className="bg-[#221f20] rounded-[26px] p-4 mt-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-lg font-bold">Shift Overview</Text>
            <View className="flex-row items-center bg-[#2a3c24] px-3 py-1.5 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-[#65b356] mr-1.5" />
              <Text className="text-[#65b356] text-xs font-semibold">Active</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-6">
            <View className="items-start flex-1">
              <Text className="text-white text-2xl font-black">{summary?.totalEventsWorked || 34}</Text>
              <Text className="text-neutral-400 text-xs mt-1">Shifts Completed</Text>
            </View>
            <View className="w-[1px] h-10 bg-neutral-700 mx-2" />
            <View className="items-start flex-1 pl-2">
              <Text className="text-white text-2xl font-black">100%</Text>
              <Text className="text-neutral-400 text-xs mt-1">Punctuality</Text>
            </View>
            <View className="w-[1px] h-10 bg-neutral-700 mx-2" />
            <View className="items-start flex-1 pl-2">
              <Text className="text-white text-lg font-black mt-1">₹{summary?.totalEarnings?.toLocaleString() || '48,500'}</Text>
              <Text className="text-neutral-400 text-xs mt-1.5">Total Earnings</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between border-t border-neutral-700 pt-4">
            <View>
              <Text className="text-neutral-400 text-[10px] mb-0.5">Agency</Text>
              <Text className="text-white text-xs font-bold">Tebeya Services</Text>
            </View>
            <View className="flex-1 px-2">
              <Text className="text-neutral-400 text-[10px] mb-0.5">Last Shift</Text>
              <Text className="text-white text-xs font-bold" numberOfLines={1}>{history[0]?.event.title || 'Grand Hyatt Banquet'}</Text>
            </View>
            <View>
              <Text className="text-neutral-400 text-[10px] mb-0.5">Pending Payout</Text>
              <Text className="text-white text-xs font-bold">₹{summary?.pendingPayouts?.toLocaleString() || '2,700'}</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Section */}
        <Text className="text-neutral-800 text-lg font-black mt-6 mb-4">Upcoming</Text>
        
        <View className="bg-white rounded-[24px] p-4 flex-row items-center shadow-sm justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-[52px] h-[58px] bg-[#598a31] rounded-[20px] items-center justify-center mr-4">
              <Text className="text-white/80 text-[11px] font-bold uppercase mb-0.5">Oct</Text>
              <Text className="text-white text-xl font-bold leading-7">18</Text>
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 text-sm font-bold mb-1" numberOfLines={1}>Taj Mahal Palace Wedding</Text>
              <Text className="text-neutral-500 text-xs mb-0.5">6:00 PM – 12:00 AM</Text>
              <Text className="text-neutral-500 text-xs">Role: Banquet Server</Text>
            </View>
          </View>
          <TouchableOpacity className="w-11 h-11 bg-[#f4f3f3] rounded-full items-center justify-center ml-2">
            <ArrowUpRight size={20} color="#598a31" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity Section */}
        <View className="mt-8 mb-4">
          <Text className="text-neutral-800 text-lg font-black mb-1">Recent Activity</Text>
          <Text className="text-neutral-500 text-xs">Track your latest completed shifts</Text>
        </View>

        <View className="flex-row items-center mb-5">
          <TouchableOpacity
            onPress={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full mr-3 ${
              activeFilter === 'all' ? 'bg-[#221f20]' : 'bg-white'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'all' ? 'text-white' : 'text-neutral-900'
              }`}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-full mr-3 ${
              activeFilter === 'completed' ? 'bg-[#221f20]' : 'bg-white'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'completed' ? 'text-white' : 'text-neutral-900'
              }`}
            >
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-full ${
              activeFilter === 'pending' ? 'bg-[#221f20]' : 'bg-white'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeFilter === 'pending' ? 'text-white' : 'text-neutral-900'
              }`}
            >
              Pending
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity List */}
        <View className="space-y-3">
          {history.length > 0 ? history.slice(0, 5).map((item, idx) => (
            <View key={item.booking.id || idx} className="bg-white rounded-full p-2 pr-4 flex-row items-center shadow-sm justify-between mb-2">
              <View className="flex-row items-center flex-1 pr-2">
                <View className="w-11 h-11 rounded-full bg-[#e6f0dc] items-center justify-center mr-4">
                  {item.booking.status === 'confirmed' ? (
                    <CheckCircle2 size={20} color="#598a31" />
                  ) : (
                    <Clock size={20} color="#598a31" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-900 text-sm font-bold mb-0.5" numberOfLines={1}>{item.event.title}</Text>
                  <Text className="text-neutral-500 text-xs" numberOfLines={1}>
                    {item.event.date} • {item.booking.status === 'confirmed' ? 'Completed successfully' : 'Pending'}
                  </Text>
                </View>
              </View>
              <ArrowUpRight size={18} color="#598a31" />
            </View>
          )) : (
            <>
              <View className="bg-white rounded-full p-2 pr-4 flex-row items-center shadow-sm justify-between mb-2">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-11 h-11 rounded-full bg-[#e6f0dc] items-center justify-center mr-4">
                    <CheckCircle2 size={20} color="#598a31" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 text-sm font-bold mb-0.5" numberOfLines={1}>Grand Hyatt Banquet</Text>
                    <Text className="text-neutral-500 text-xs" numberOfLines={1}>Oct 12, 2023 • Completed successfully</Text>
                  </View>
                </View>
                <ArrowUpRight size={18} color="#598a31" />
              </View>

              <View className="bg-white rounded-full p-2 pr-4 flex-row items-center shadow-sm justify-between mb-2">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-11 h-11 rounded-full bg-[#e6f0dc] items-center justify-center mr-4">
                    <Clock size={20} color="#598a31" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-900 text-sm font-bold mb-0.5" numberOfLines={1}>Royal Orchid Wedding</Text>
                    <Text className="text-neutral-500 text-xs" numberOfLines={1}>Oct 15, 2023 • Pending Payout</Text>
                  </View>
                </View>
                <ArrowUpRight size={18} color="#598a31" />
              </View>
            </>
          )}
        </View>
        <View className="h-6" />
      </ScrollView>
    </ScreenWrapper>
  );
}
