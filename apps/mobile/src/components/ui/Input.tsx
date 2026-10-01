import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  style,
  ...props
}) => {
  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
      )}
      <View
        className={`flex-row items-center border rounded-xl bg-white px-3.5 py-3 ${
          error ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-indigo-600'
        }`}
      >
        {leftIcon && <View className="mr-2.5">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-base text-slate-900"
          placeholderTextColor="#94a3b8"
          {...props}
        />
        {rightIcon && <View className="ml-2.5">{rightIcon}</View>}
      </View>
      {error ? (
        <Text className="text-xs text-rose-600 mt-1">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-slate-500 mt-1">{helperText}</Text>
      ) : null}
    </View>
  );
};
