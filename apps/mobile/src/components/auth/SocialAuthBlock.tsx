import React from 'react';
import { View, Alert } from 'react-native';
import { Button } from '../ui/Button';
import { GoogleIcon } from './AuthIcons';

interface SocialAuthBlockProps {
  onGooglePress?: () => void;
  className?: string;
}

export const SocialAuthBlock: React.FC<SocialAuthBlockProps> = ({
  onGooglePress,
  className = '',
}) => {
  const handleDefaultGoogle = () => {
    Alert.alert(
      'Google Sign-In',
      'Google authentication for Tebeya Services staff is currently in preview. Please sign in with your email and password or use your admin invite code.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View className={`w-full ${className}`}>
      {/* Continue with Google */}
      <Button
        title="Continue with Google"
        variant="soft"
        pill
        size="lg"
        icon={<GoogleIcon size={19} />}
        onPress={onGooglePress || handleDefaultGoogle}
        className="h-[52px]"
      />
    </View>
  );
};
