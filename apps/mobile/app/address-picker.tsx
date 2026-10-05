import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, ChevronLeft } from 'lucide-react-native';
import { ScreenWrapper } from '../src/components/layout/ScreenWrapper';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { profileApi } from '../src/api/profile.api';
import { useAuthStore } from '../src/store/authStore';

export default function AddressPickerScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [addressText, setAddressText] = useState(user?.address?.text || '');
  const [lat, setLat] = useState(user?.address?.lat ? String(user.address.lat) : '12.9716');
  const [lng, setLng] = useState(user?.address?.lng ? String(user.address.lng) : '77.5946');
  const [loading, setLoading] = useState(false);

  const handleSaveAddress = async () => {
    if (!addressText.trim()) {
      Alert.alert('Address Required', 'Please enter your street or area address.');
      return;
    }

    try {
      setLoading(true);
      const parsedLat = parseFloat(lat) || 12.9716;
      const parsedLng = parseFloat(lng) || 77.5946;

      await profileApi.updateAddress({
        text: addressText.trim(),
        lat: parsedLat,
        lng: parsedLng,
        confirmed: true,
      });

      updateUser({
        address: {
          text: addressText.trim(),
          lat: parsedLat,
          lng: parsedLng,
          confirmed: true,
        },
      });

      Alert.alert(
        'Address Saved',
        'Your home location has been updated. Distance travel allowances will calculate automatically for shift venues.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update address.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper className="px-4">
      {/* Top Header */}
      <View className="flex-row items-center justify-between pt-2 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={22} color="#201d1e" />
        </TouchableOpacity>

        <Text className="text-base font-black text-neutral-900 tracking-tight">
          Home Address Pin
        </Text>

        <View className="w-12" />
      </View>

      <View className="bg-white rounded-[28px] p-5 shadow-sm border border-white/50 mb-4">
        <View className="flex-row items-center mb-2">
          <Navigation size={16} color="#598A31" />
          <Text className="text-xs font-bold text-neutral-800 ml-1.5">
            Distance Travel Allowance
          </Text>
        </View>
        <Text className="text-xs text-neutral-500 leading-5 mb-4">
          Your home address determines distance travel bonuses. Shifts situated beyond the 10 km buffer receive extra travel pay!
        </Text>

        <Input
          label="Home Street Address & Area"
          placeholder="e.g. 14th Cross, Indiranagar, Bangalore"
          value={addressText}
          onChangeText={setAddressText}
          leftIcon={<MapPin size={18} color="#94a3b8" />}
        />

        <View className="flex-row space-x-3 mb-4">
          <View className="flex-1 mr-2">
            <Input
              label="Latitude"
              placeholder="12.9716"
              value={lat}
              onChangeText={setLat}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1 ml-2">
            <Input
              label="Longitude"
              placeholder="77.5946"
              value={lng}
              onChangeText={setLng}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Button
          title="Save Home Address"
          onPress={handleSaveAddress}
          loading={loading}
          variant="primary"
          size="lg"
        />
      </View>
    </ScreenWrapper>
  );
}
