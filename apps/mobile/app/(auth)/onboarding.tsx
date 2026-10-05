import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { CateringStaffIllustration } from '../../src/components/auth/CateringStaffIllustration';
import { SocialAuthBlock } from '../../src/components/auth/SocialAuthBlock';
import { Button } from '../../src/components/ui/Button';

const SLIDES = [
  {
    title: 'Elite Catering Staff',
    subtitle: 'Join premier banquet and event teams at five-star venues across the city.',
  },
  {
    title: 'Transparent Earnings',
    subtitle: 'Guaranteed hourly wages with automatic distance travel allowances.',
  },
  {
    title: 'Fast Weekly Payouts',
    subtitle: 'Direct shift confirmation with attendance logging and prompt payouts.',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const slide = SLIDES[currentSlide];

  return (
    <ScreenWrapper
      scrollable
      backgroundColor="bg-white"
      className="px-6 py-4 justify-between"
    >
      <View className="flex-1 justify-between">
        <View className="items-center pt-2">
          {/* Top Skip Button */}
          <View className="w-full flex-row justify-end mb-2">
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              className="py-1 px-3"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-xs font-semibold text-neutral-400">Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Meaningful Catering Staff Illustration */}
          <View className="items-center my-4">
            <CateringStaffIllustration width={220} height={175} />
          </View>

          {/* Title & Subtitle */}
          <Text className="text-2xl font-black text-neutral-900 text-center tracking-tight mb-2">
            {slide.title}
          </Text>
          <Text className="text-xs font-normal text-neutral-500 text-center px-4 leading-5 mb-6">
            {slide.subtitle}
          </Text>

          {/* 3 Horizontal Pill Dash Indicators (Brand Primary Active) */}
          <View className="flex-row items-center justify-center space-x-2 w-full px-2 mb-8">
            {SLIDES.map((_, idx) => {
              const isLit = idx <= currentSlide || (currentSlide === 0 && idx < 2);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setCurrentSlide(idx)}
                  activeOpacity={0.7}
                  className="flex-1 py-1"
                >
                  <View
                    className={`h-[4px] rounded-full mx-1 ${
                      isLit ? 'bg-[#598A31]' : 'bg-neutral-200'
                    }`}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Primary Action Button */}
          <Button
            title="Enter Invite Code & Sign Up"
            variant="primary"
            pill
            size="lg"
            onPress={() => router.push('/(auth)/signup')}
            className="w-full h-[52px] mb-3"
          />

          {/* Google Sign-In Option */}
          <SocialAuthBlock />
        </View>

        {/* Footer Navigation */}
        <View className="items-center py-6 mt-4">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="flex-row items-center py-2"
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <Text className="text-[13px] text-neutral-600">Already have an account? </Text>
            <Text className="text-[13px] font-black text-[#598A31]">Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
