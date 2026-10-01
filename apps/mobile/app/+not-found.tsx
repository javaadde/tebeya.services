import React from 'react';
import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-slate-50">
        <Text className="text-xl font-bold text-slate-900 mb-2">This screen doesn't exist.</Text>
        <Link href="/(tabs)" className="text-indigo-600 font-semibold py-2">
          Go to home screen
        </Link>
      </View>
    </>
  );
}
