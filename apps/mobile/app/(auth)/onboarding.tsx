import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { UtensilsCrossed, IndianRupee, ShieldCheck } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { Button } from '../../src/components/ui/Button';

const SLIDES = [
  {
    title: 'Premium Catering Shifts',
    description:
      'Discover high-profile banquet, wedding, and corporate shifts across premier venues in your city.',
    icon: <UtensilsCrossed size={48} color="#4f46e5" />,
    badge: 'Step 1 of 3',
  },
  {
    title: 'Transparent Earnings & Travel Allowance',
    description:
      'Clear per-event wages with automatic distance-based travel allowances calculated from your home.',
    icon: <IndianRupee size={48} color="#10b981" />,
    badge: 'Step 2 of 3',
  },
  {
    title: 'Reliable Scheduling & Verification',
    description:
      'Direct shift confirmation with attendance logging, punctuality tracking, and prompt weekly payouts.',
    icon: <ShieldCheck size={48} color="#6366f1" />,
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
    <ScreenWrapper className="px-6 py-8 justify-between">
      {/* Top Brand Header */}
      <View className="flex-row justify-between items-center pt-2">
        <Text className="text-xl font-black text-indigo-700 tracking-wider">
          TEBEYA SERVICES
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-sm font-semibold text-slate-500">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Card */}
      <View className="items-center py-10">
        <View className="w-24 h-24 rounded-3xl bg-indigo-50 border border-indigo-100 items-center justify-center mb-8 shadow-sm">
          {slide.icon}
        </View>

        <View className="bg-indigo-100/60 px-3 py-1 rounded-full mb-4">
          <Text className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
            {slide.badge}
          </Text>
        </View>

        <Text className="text-2xl font-black text-slate-900 text-center mb-3 leading-8">
          {slide.title}
        </Text>

        <Text className="text-base text-slate-600 text-center leading-6 px-4">
          {slide.description}
        </Text>
      </View>

      {/* Footer & Navigation Controls */}
      <View className="space-y-6">
        {/* Pagination Dots */}
        <View className="flex-row justify-center items-center space-x-2 mb-6">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 transition-all ${
                index === currentSlide
                  ? 'w-8 bg-indigo-600'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </View>

        <Button
          title={currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
        />

        <View className="flex-row justify-center items-center mt-3">
          <Text className="text-sm text-slate-600">Already registered? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-sm font-bold text-indigo-600">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
