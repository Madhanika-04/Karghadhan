import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: any;
}) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

function MaterialIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: any;
}) {
  return <MaterialCommunityIcons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', // Blue primary
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: t('tabs.loans'),
          tabBarIcon: ({ color }) => <MaterialIcon name="cash-multiple" color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: t('tabs.pay'),
          tabBarIcon: ({ color }) => (
            <View className="bg-blue-600 rounded-full p-2 -mt-4 shadow-lg shadow-blue-500/50">
              <MaterialIcon name="qrcode-scan" color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insurance"
        options={{
          title: t('tabs.protect'),
          tabBarIcon: ({ color }) => <MaterialIcon name="shield-check" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t('tabs.ai'),
          tabBarIcon: ({ color }) => <MaterialIcon name="robot" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
