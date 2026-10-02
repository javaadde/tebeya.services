import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  backgroundColor?: string;
  keyboardAvoiding?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  className = '',
  backgroundColor = 'bg-[#d4d5d6]',
  keyboardAvoiding = true,
}) => {
  const insets = useSafeAreaInsets();
  // Ensure Android status bar height and camera cutouts are fully cleared
  const androidStatus = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;
  const topInset = Math.max(insets.top, androidStatus);

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      className="flex-1"
    >
      <View className={`flex-1 ${className}`}>{children}</View>
    </ScrollView>
  ) : (
    <View className={`flex-1 ${className}`}>{children}</View>
  );

  return (
    <View
      className={`flex-1 ${backgroundColor}`}
      style={{
        paddingTop: topInset,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#d4d5d6" translucent={true} />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
};
