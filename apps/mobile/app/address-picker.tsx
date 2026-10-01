import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react-native';
import { ScreenWrapper } from '../src/components/layout/ScreenWrapper';
import { Header } from '../src/components/layout/Header';
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

      const updatedUser = await profileApi.updateAddress({
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
        'Your home location has been updated. Distance-based travel allowances will now be calculated automatically for all shift venues.',
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
    <ScreenWrapper className="px-5 py-2">
      <Header title="Set Home Address" showBack />

      <View className="py-4">
        <View className="bg-indigo-50/70 p-4 rounded-2xl mb-5 border border-indigo-100">
          <View className="flex-row items-center mb-1">
            <Navigation size={16} color="#4f46e5" />
            <Text className="text-xs font-bold text-indigo-900 ml-1.5">
              Distance Travel Allowance
            </Text>
          </View>
          <Text className="text-xs text-indigo-800 leading-5">
            Your home location is used to calculate distance to venue locations.
            Shifts further than the free travel buffer automatically receive distance allowances!
          </Text>
        </View>

        <Input
          label="Home Street Address & Area"
          placeholder="e.g. 14th Cross, Indiranagar, Bangalore"
          value={addressText}
          onChangeText={setAddressText}
          leftIcon={<MapPin size={18} color="#94a3b8" />}
        />

        <View className="flex-row space-x-3 mb-6">
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
          size="lg"
        />
      </View>
    </ScreenWrapper>
  );
}
