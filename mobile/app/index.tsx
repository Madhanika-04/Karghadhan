import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Simulate loading/auth check
    const timer = setTimeout(() => {
      // For now, redirect to language selection
      router.replace('/language');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-blue-600 justify-center items-center">
      <View className="items-center">
        <View className="bg-white p-4 rounded-full mb-4 shadow-lg">
          <MaterialCommunityIcons name="tshirt-crew" size={64} color="#2563eb" />
        </View>
        <Text className="text-white text-4xl font-bold mb-2">{t('splash.app_name')}</Text>
        <Text className="text-blue-100 text-lg mb-8">{t('splash.slogan')}</Text>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </SafeAreaView>
  );
}
