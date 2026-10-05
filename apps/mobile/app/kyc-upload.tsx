import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Lock, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import { ScreenWrapper } from '../src/components/layout/ScreenWrapper';
import { Button } from '../src/components/ui/Button';
import { profileApi } from '../src/api/profile.api';
import { useAuthStore } from '../src/store/authStore';

const DOC_TYPES = [
  'Aadhaar Card',
  'Voter ID Card',
  'Driving License',
  'Passport',
];

export default function KycUploadScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [selectedDoc, setSelectedDoc] = useState(DOC_TYPES[0]);
  const [simulatedSelected, setSimulatedSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelectMockImage = () => {
    setSimulatedSelected(true);
    Alert.alert(
      'Document Selected',
      `${selectedDoc} image prepared for secure upload.`
    );
  };

  const handleSubmitKyc = async () => {
    if (!simulatedSelected) {
      Alert.alert('Document Required', 'Please select or capture a photo of your ID proof.');
      return;
    }

    try {
      setLoading(true);
      const mockBase64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...`;
      const res = await profileApi.uploadKycIdProof(mockBase64);

      updateUser({ idProofUrl: res.idProofUrl || 'uploaded' });

      Alert.alert(
        'KYC Document Submitted',
        'Your government ID proof has been securely uploaded to our private vault. An administrator will review and verify your profile.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'KYC upload failed.';
      Alert.alert('Upload Error', msg);
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
          Upload ID Proof
        </Text>

        <View className="w-12" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Privacy Note (Rule 4) */}
        <View className="bg-white rounded-[28px] p-5 mb-3.5 shadow-sm border border-white/50">
          <View className="flex-row items-center mb-1.5">
            <Lock size={16} color="#598A31" />
            <Text className="text-xs font-bold text-[#598A31] ml-1.5">
              Private Authenticated Storage (Rule 4)
            </Text>
          </View>
          <Text className="text-xs text-neutral-600 leading-5">
            Your identity proof is stored strictly as a private, encrypted asset. It is never exposed publicly and is accessed only via short-lived signed URLs by coordinators.
          </Text>
        </View>

        {/* Document Selection Card */}
        <View className="bg-white rounded-[28px] p-5 mb-3.5 shadow-sm border border-white/50">
          <Text className="text-xs font-bold text-neutral-800 mb-3">
            Select Government Document
          </Text>
          <View className="flex-row flex-wrap">
            {DOC_TYPES.map((type) => {
              const isSelected = selectedDoc === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedDoc(type)}
                  className={`py-2 px-3.5 rounded-xl mr-2 mb-2 border ${
                    isSelected
                      ? 'bg-[#201d1e] border-[#201d1e]'
                      : 'bg-[#f1f2f2] border-neutral-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-neutral-700'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Photo Upload Zone */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSelectMockImage}
          className={`border-2 border-dashed rounded-[28px] p-8 items-center justify-center mb-5 bg-white ${
            simulatedSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-neutral-300'
          }`}
        >
          <View
            className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${
              simulatedSelected ? 'bg-emerald-100' : 'bg-[#f4f8ef]'
            }`}
          >
            {simulatedSelected ? (
              <CheckCircle2 size={28} color="#059669" />
            ) : (
              <Camera size={26} color="#598A31" />
            )}
          </View>

          <Text className="text-sm font-bold text-neutral-900 mb-1">
            {simulatedSelected
              ? `${selectedDoc} Image Ready`
              : `Tap to Select ${selectedDoc}`}
          </Text>
          <Text className="text-xs text-neutral-500 text-center">
            {simulatedSelected
              ? 'Tap again to select another image'
              : 'Ensure all details and your name are clear and unblurred.'}
          </Text>
        </TouchableOpacity>

        <Button
          title="Submit for Verification"
          onPress={handleSubmitKyc}
          loading={loading}
          disabled={!simulatedSelected}
          variant="primary"
          size="lg"
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
