import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarStyle = Platform.OS === 'web' 
    ? { height: 'auto' }
    : {};

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0F',
          borderTopColor: '#1a1a2e',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          ...tabBarStyle
        },
        tabBarActiveTintColor: '#00F0FF',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => <FontAwesome6 name="house" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="nodes"
        options={{
          title: '节点',
          tabBarIcon: ({ color }) => <FontAwesome6 name="server" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: '订阅',
          tabBarIcon: ({ color }) => <FontAwesome6 name="link" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: '规则',
          tabBarIcon: ({ color }) => <FontAwesome6 name="list-check" size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color }) => <FontAwesome6 name="gear" size={20} color={color} />
        }}
      />
    </Tabs>
  );
}
