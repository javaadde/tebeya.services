import React from 'react';
import { View, Text, Modal } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { Button } from '../ui/Button';

interface ClashAlertModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export const ClashAlertModal: React.FC<ClashAlertModalProps> = ({
  visible,
  message,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-5">
        <View className="w-full max-w-sm bg-white rounded-[28px] p-6 shadow-xl">
          <View className="w-14 h-14 rounded-2xl bg-[#fdece8] items-center justify-center mb-4 self-center">
            <ShieldAlert size={28} color="#df3b20" />
          </View>

          <Text className="text-xl font-black text-neutral-900 text-center mb-2">
            Schedule Clash Detected
          </Text>

          <Text className="text-xs text-neutral-600 text-center mb-6 leading-5">
            {message}
          </Text>

          <Button
            title="Understood"
            onPress={onClose}
            variant="secondary"
          />
        </View>
      </View>
    </Modal>
  );
};
