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
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'forest' | 'lime' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  pill?: boolean;
  textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  pill = false,
  textClassName = '',
  disabled,
  style,
  className = '',
  ...props
}) => {
  const getContainerStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#598A31] active:bg-[#487226] border-transparent';
      case 'secondary':
        return 'bg-[#201d1e] active:bg-black border-transparent';
      case 'forest':
        return 'bg-[#153215] active:bg-[#0f240f] border-transparent';
      case 'lime':
        return 'bg-[#96e552] active:bg-[#85d342] border-transparent';
      case 'soft':
        return 'bg-[#f3f4f2] active:bg-[#e7e8e6] border-transparent';
      case 'outline':
        return 'bg-transparent border border-neutral-300 active:bg-neutral-100';
      case 'danger':
        return 'bg-rose-600 active:bg-rose-700 border-transparent';
      case 'ghost':
        return 'bg-transparent active:bg-neutral-100';
      default:
        return 'bg-[#598A31] border-transparent';
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'soft':
        return '#171717';
      case 'lime':
        return '#171717';
      case 'outline':
      case 'ghost':
        return '#171717';
      case 'primary':
      case 'secondary':
      case 'forest':
      case 'danger':
      default:
        return '#ffffff';
    }
  };

  const getTextVariantClasses = () => {
    switch (variant) {
      case 'soft':
      case 'lime':
      case 'outline':
      case 'ghost':
        return 'text-neutral-900 font-bold';
      case 'primary':
      case 'secondary':
      case 'forest':
      case 'danger':
      default:
        return 'text-white font-bold';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-[15px]';
      case 'md':
      default:
        return 'text-sm';
    }
  };

  const getContainerPadding = () => {
    // If a custom height like h-[52px] is passed in className, avoid conflicting heavy py
    if (className.includes('h-') || className.includes('h[')) {
      return 'px-5';
    }
    switch (size) {
      case 'sm':
        return 'py-2 px-3';
      case 'lg':
        return 'py-3.5 px-6';
      case 'md':
      default:
        return 'py-3 px-5';
    }
  };

  const isDisabled = disabled || loading;
  const textColor = getTextColor();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${
        pill ? 'rounded-full' : 'rounded-xl'
      } ${getContainerStyles()} ${getContainerPadding()} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2.5 items-center justify-center">{icon}</View>}
          <Text
            className={`text-center tracking-tight ${getTextVariantClasses()} ${getTextSizeClasses()} ${textClassName}`}
            style={{ color: textColor }}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
