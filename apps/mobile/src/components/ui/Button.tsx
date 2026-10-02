import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#df3b20] active:bg-[#c73017] text-white border-transparent';
      case 'secondary':
        return 'bg-[#201d1e] active:bg-black text-white border-transparent';
      case 'outline':
        return 'bg-transparent border border-neutral-300 active:bg-white text-neutral-800';
      case 'danger':
        return 'bg-rose-600 active:bg-rose-700 text-white border-transparent';
      case 'ghost':
        return 'bg-transparent text-neutral-700 active:bg-white/50';
      default:
        return 'bg-[#df3b20] text-white';
    }
  };

  const getTextVariantStyles = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return 'text-slate-800 font-semibold';
      case 'primary':
      case 'secondary':
      case 'danger':
      default:
        return 'text-white font-semibold';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-3 text-sm';
      case 'lg':
        return 'py-4 px-6 text-lg';
      case 'md':
      default:
        return 'py-3.5 px-5 text-base';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-xl ${getVariantStyles()} ${
        size === 'sm' ? 'py-2 px-3' : size === 'lg' ? 'py-4 px-6' : 'py-3.5 px-5'
      } ${isDisabled ? 'opacity-50' : ''}`}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#df3b20' : '#ffffff'}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`text-center font-semibold ${getTextVariantStyles()} ${getSizeStyles()}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
