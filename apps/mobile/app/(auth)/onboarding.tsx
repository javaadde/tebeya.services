import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { UtensilsCrossed, IndianRupee, ShieldCheck } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Button } from '../../src/components/ui/Button';

const SLIDES = [
  {
    title: 'Premium Catering Shifts',
    description:
      'Discover high-profile banquet, wedding, and corporate shifts across premier venues in your city.',
    icon: <UtensilsCrossed size={42} color="#df3b20" />,
    badge: 'Step 1 of 3',
  },
  {
    title: 'Transparent Earnings & Travel Bonus',
    description:
      'Clear per-event wages with automatic distance-based travel allowances calculated from your home.',
    icon: <IndianRupee size={42} color="#df3b20" />,
    badge: 'Step 2 of 3',
  },
  {
    title: 'Reliable Scheduling & Verification',
    description:
      'Direct shift confirmation with attendance logging, punctuality tracking, and prompt weekly payouts.',
    icon: <ShieldCheck size={42} color="#df3b20" />,
    badge: 'Step 3 of 3',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/signup');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <ScreenWrapper className="px-5 py-6 justify-between">
      {/* Top Header */}
      <View className="flex-row justify-between items-center pt-2">
        <Text className="text-lg font-black text-neutral-900 tracking-wider">
          TEBEYA SERVICES
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          className="px-3 py-1.5 rounded-full bg-white/70"
        >
          <Text className="text-xs font-bold text-neutral-600">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Card */}
      <View className="bg-white rounded-[32px] p-8 items-center shadow-sm border border-white/50 my-6">
        <View className="w-24 h-24 rounded-[26px] bg-[#fdece8] items-center justify-center mb-6">
          {slide.icon}
        </View>

        <View className="bg-[#f1f2f2] px-3 py-1 rounded-full mb-3">
          <Text className="text-[11px] font-bold text-neutral-700 uppercase tracking-wide">
            {slide.badge}
          </Text>
        </View>

        <Text className="text-2xl font-black text-neutral-900 text-center mb-2 leading-7">
          {slide.title}
        </Text>

        <Text className="text-xs text-neutral-500 text-center leading-5 px-2">
          {slide.description}
        </Text>
      </View>

      {/* Footer Controls */}
      <View className="space-y-4">
        {/* Pagination Dots */}
        <View className="flex-row justify-center items-center mb-4">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentSlide
                  ? 'w-8 bg-[#df3b20]'
                  : 'w-2 bg-neutral-300'
              }`}
            />
          ))}
        </View>

        <Button
          title={currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
        />

        <View className="flex-row justify-center items-center mt-3">
          <Text className="text-xs text-neutral-600">Already registered? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-xs font-black text-[#df3b20]">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
