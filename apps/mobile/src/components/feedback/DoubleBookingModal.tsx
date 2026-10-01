import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { AlertTriangle, CheckSquare, Square } from 'lucide-react-native';
import { Button } from '../ui/Button';

interface DoubleBookingModalProps {
  visible: boolean;
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DoubleBookingModal: React.FC<DoubleBookingModalProps> = ({
  visible,
  eventTitle,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleConfirm = () => {
    if (acknowledged) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setAcknowledged(false);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-5">
        <View className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
          <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mb-4 self-center">
            <AlertTriangle size={26} color="#d97706" />
          </View>

          <Text className="text-xl font-bold text-slate-900 text-center mb-2">
            Second Shift Confirmation
          </Text>

          <Text className="text-sm text-slate-600 text-center mb-4 leading-5">
            You are committing to take a second event today ({eventTitle}). You must be present at both shifts. Absence or lateness may have consequences.
          </Text>

          {/* Mandatory Acknowledgment Checkbox (FR-12) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAcknowledged(!acknowledged)}
            className="flex-row items-center bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 mb-6"
          >
            {acknowledged ? (
              <CheckSquare size={22} color="#d97706" />
            ) : (
              <Square size={22} color="#94a3b8" />
            )}
            <Text className="ml-3 text-sm font-medium text-slate-800 flex-1">
              I understand and commit to attend both shifts.
            </Text>
          </TouchableOpacity>

          <View className="space-y-2">
            <Button
              title="Confirm & Join Shift"
              onPress={handleConfirm}
              disabled={!acknowledged}
              loading={loading}
              variant="primary"
            />
            <View className="h-2" />
            <Button
              title="Go Back"
              onPress={handleCancel}
              variant="outline"
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
