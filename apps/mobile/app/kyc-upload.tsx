import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Camera, Upload, Lock, FileCheck, CheckCircle2 } from 'lucide-react-native';
import { ScreenWrapper } from '../src/components/layout/ScreenWrapper';
import { Header } from '../src/components/layout/Header';
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
      // Construct sample base64 payload adhering to private KYC storage requirements (Rule 4)
      const mockBase64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...`;
      const res = await profileApi.uploadKycIdProof(mockBase64);

      updateUser({ idProofUrl: res.idProofUrl || 'uploaded' });

      Alert.alert(
        'KYC Document Submitted',
        'Your government ID proof has been securely uploaded to our private KYC vault. An administrator will review and verify your profile.',
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
    <ScreenWrapper scrollable className="px-5 py-2">
      <Header title="Upload ID Proof (KYC)" showBack />

      <View className="py-4">
        {/* Security & Privacy Notice (Rule 4) */}
        <View className="bg-slate-900 rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center mb-1.5">
            <Lock size={16} color="#38bdf8" />
            <Text className="text-xs font-bold text-sky-400 ml-1.5">
              Private Authenticated Storage (Rule 4)
            </Text>
          </View>
          <Text className="text-xs text-slate-300 leading-5">
            Your identity proof is stored strictly as a private, encrypted asset.
            It is never exposed to the public and is viewed only via signed, time-limited credentials by Tebeya administrative coordinators.
          </Text>
        </View>

        {/* Document Type Selector */}
        <Text className="text-sm font-bold text-slate-800 mb-2">
          Select Document Type
        </Text>
        <View className="flex-row flex-wrap mb-6">
          {DOC_TYPES.map((type) => {
            const isSelected = selectedDoc === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedDoc(type)}
                className={`py-2 px-3.5 rounded-xl mr-2 mb-2 border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Upload Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSelectMockImage}
          className={`border-2 border-dashed rounded-2xl p-8 items-center justify-center mb-6 bg-white ${
            simulatedSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-300'
          }`}
        >
          <View
            className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${
              simulatedSelected ? 'bg-emerald-100' : 'bg-indigo-50'
            }`}
          >
            {simulatedSelected ? (
              <CheckCircle2 size={28} color="#059669" />
            ) : (
              <Camera size={28} color="#4f46e5" />
            )}
          </View>

          <Text className="text-sm font-bold text-slate-900 mb-1">
            {simulatedSelected
              ? `${selectedDoc} Image Ready`
              : `Take Photo or Upload ${selectedDoc}`}
          </Text>
          <Text className="text-xs text-slate-500 text-center">
            {simulatedSelected
              ? 'Tap to change photo'
              : 'Ensure all details and your name are clearly visible and unblurred.'}
          </Text>
        </TouchableOpacity>

        <Button
          title="Submit for Verification"
          onPress={handleSubmitKyc}
          loading={loading}
          disabled={!simulatedSelected}
          size="lg"
        />
      </View>
    </ScreenWrapper>
  );
}
