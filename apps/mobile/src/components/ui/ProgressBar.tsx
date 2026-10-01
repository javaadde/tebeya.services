import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabels?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabels = true,
}) => {
  const percentage = Math.min(100, Math.round((current / (total || 1)) * 100));

  const getBarColor = () => {
    if (percentage >= 100) return 'bg-rose-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-indigo-600';
  };

  return (
    <View className="w-full">
      {showLabels && (
        <View className="flex-row justify-between items-center mb-1.5">
          <Text className="text-xs font-medium text-slate-600">
            {current} / {total} spots filled
          </Text>
          <Text className="text-xs font-semibold text-slate-700">
            {percentage}%
          </Text>
        </View>
      )}
      <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};
