import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Pentagon, CalendarSearch, History, Hexagon, Circle } from 'lucide-react-native';

interface TabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  descriptors: Record<string, any>;
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string) => void;
  };
}

const SettingsIcon = ({ size, color }: { size: number; color: string }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Hexagon size={size} color={color} />
    <Circle size={size * 0.35} color={color} strokeWidth={3} style={{ position: 'absolute' }} />
  </View>
);

const HomeIcon = ({ size, color }: { size: number; color: string }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Pentagon size={size} color={color} />
    <View
      style={{
        position: 'absolute',
        bottom: size * 0.22,
        width: 2,
        height: size * 0.25,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
  </View>
);

function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const icons: Record<string, React.ComponentType<any>> = {
    index: HomeIcon,
    shifts: CalendarSearch,
    earnings: History,
    profile: SettingsIcon,
  };

  return (
    <View style={styles.tabBarWrapper} pointerEvents="box-none">
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const IconComponent = icons[route.name] || HomeIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
              ]}
            >
              <IconComponent
                size={26}
                color={isFocused ? '#ffffff' : '#f5f5f5'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: any) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="shifts" options={{ title: 'Upcoming' }} />
      <Tabs.Screen name="earnings" options={{ title: 'History' }} />
      <Tabs.Screen name="profile" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#201d1e',
    width: '70%',
    maxWidth: 270,
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: '#598A31',
  },
});
