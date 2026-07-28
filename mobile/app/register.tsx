import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 p-6 justify-center">
      <View className="items-center mb-8">
        <MaterialCommunityIcons name="account-plus-outline" size={64} color="#2563eb" />
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-4 text-center">{t('register.join_karghadhan')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">{t('register.empowering_weavers')}</Text>
      </View>
      <TouchableOpacity
        onPress={() => router.replace('/(tabs)')}
        className="bg-blue-600 p-4 rounded-xl items-center shadow-lg shadow-blue-500/30"
      >
        <Text className="text-white text-lg font-bold">{t('register.mock_register')}</Text>
      </TouchableOpacity>
      <View className="flex-row justify-center mt-8">
        <Text className="text-gray-600 dark:text-gray-400">{t('register.already_account')} </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 dark:text-blue-400 font-bold">{t('login.login')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
