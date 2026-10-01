import React from 'react';
import { View, Text } from 'react-native';
import { CalendarX } from 'lucide-react-native';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
  icon,
}) => {
  return (
    <View className="flex-1 items-center justify-center p-6 my-10">
      <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-4">
        {icon || <CalendarX size={32} color="#64748b" />}
      </View>
      <Text className="text-lg font-bold text-slate-800 text-center mb-1.5">
        {title}
      </Text>
      <Text className="text-sm text-slate-500 text-center mb-6 leading-5">
        {description}
      </Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} variant="outline" size="sm" />
      )}
    </View>
  );
};
