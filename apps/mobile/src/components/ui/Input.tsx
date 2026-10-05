import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, Platform } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pill?: boolean;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  pill = false,
  containerClassName = '',
  secureTextEntry,
  className,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = secureTextEntry && !showPassword;

  return (
    <View className={`w-full mb-3.5 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-semibold text-neutral-700 mb-1.5 ml-1">{label}</Text>
      )}
      <View
        className={`flex-row items-center border bg-white ${
          pill ? 'rounded-full px-5 h-[52px]' : 'rounded-2xl px-4 h-[52px]'
        } ${
          error
            ? 'border-rose-400 bg-rose-50/20'
            : 'border-neutral-200 focus:border-[#598A31]'
        }`}
      >
        {leftIcon && <View className="mr-3 items-center justify-center">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-[15px] font-medium text-neutral-900 h-full"
          style={[
            {
              color: '#171717',
              fontSize: 15,
              paddingVertical: 0,
              ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
            },
            style,
          ]}
          placeholderTextColor="#9ca3af"
          selectionColor="#598A31"
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="p-1 -mr-1 items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={18} color="#9ca3af" />
            ) : (
              <Eye size={18} color="#9ca3af" />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="ml-2.5 items-center justify-center">{rightIcon}</View>
        )}
      </View>
      {error ? (
        <Text className="text-xs text-rose-600 mt-1 ml-2 font-medium">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-neutral-500 mt-1 ml-2">{helperText}</Text>
      ) : null}
    </View>
  );
};
