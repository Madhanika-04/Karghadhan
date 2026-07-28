import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView className="flex-1 p-4">
        {/* Header Profile Info */}
        <View className="bg-white dark:bg-slate-800 p-6 flex-row items-center rounded-3xl mb-6 border border-gray-100 dark:border-gray-800">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm">
            <MaterialCommunityIcons name="account" size={40} color="#2563eb" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Arun Kumar</Text>
            <View className="flex-row items-center mt-1">
              <MaterialCommunityIcons name="check-decagram" size={16} color="#059669" />
              <Text className="text-emerald-600 dark:text-emerald-400 font-medium ml-1">{t('profile.verified_weaver')}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-slate-800 rounded-3xl p-2 mb-6 border border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.push('/language')} className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700/50">
            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
              <MaterialCommunityIcons name="translate" size={24} color="#2563eb" />
            </View>
            <Text className="flex-1 text-lg text-gray-700 dark:text-gray-200 ml-4">{t('profile.language')}</Text>
            <Text className="text-gray-400 mr-2">{t('profile.english')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700/50">
            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
              <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#2563eb" />
            </View>
            <Text className="flex-1 text-lg text-gray-700 dark:text-gray-200 ml-4">{t('profile.privacy')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4">
            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
              <MaterialCommunityIcons name="help-circle-outline" size={24} color="#2563eb" />
            </View>
            <Text className="flex-1 text-lg text-gray-700 dark:text-gray-200 ml-4">{t('profile.help_support')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => router.replace('/login')}
          className="flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/50"
        >
          <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
          <Text className="text-red-500 font-bold text-lg ml-2">{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
