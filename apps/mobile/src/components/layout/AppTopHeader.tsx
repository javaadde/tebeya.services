import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

interface AppTopHeaderProps {
  mode?: 'user' | 'title';
  subtitle?: string;
  title?: string;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
}

export const AppTopHeader: React.FC<AppTopHeaderProps> = ({
  mode = 'title',
  subtitle,
  title,
  rightIcon,
  onRightPress,
}) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const defaultAvatar =
    user?.profileImageUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const handleAction = () => {
    if (onRightPress) {
      onRightPress();
    } else {
      router.push('/notifications');
    }
  };

  return (
    <View className="flex-row items-center justify-between pt-2 pb-4 px-1">
      {mode === 'user' ? (
        <View className="flex-row items-center flex-1 mr-3">
          <View className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-neutral-300 border border-neutral-300">
            <Image
              source={{ uri: defaultAvatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-neutral-600">
              {subtitle || 'Good Morning !'}
            </Text>
            <Text className="text-2xl font-black text-neutral-900 tracking-tight" numberOfLines={1}>
              {title || user?.name || 'Jude Bellingham'}
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-1 mr-3">
          {subtitle && (
            <Text className="text-sm font-semibold text-neutral-600 mb-0.5">
              {subtitle}
            </Text>
          )}
          <Text className="text-3xl font-black text-neutral-900 tracking-tight" numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      {/* Primary circular button matching nav bar active indicator */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAction}
        className="w-12 h-12 rounded-full bg-[#598A31] items-center justify-center shadow-sm"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {rightIcon || <Bell size={22} color="#ffffff" />}
      </TouchableOpacity>
    </View>
  );
};
