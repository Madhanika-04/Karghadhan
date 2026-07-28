import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function InsuranceScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-slate-900">
      <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{t('insurance.insurance')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-1">{t('insurance.insurance_desc')}</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {/* Banner */}
        <View className="bg-purple-600 rounded-3xl p-6 mb-6 shadow-lg shadow-purple-500/30">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="shield-star" size={24} color="#fcd34d" />
            <Text className="text-white font-bold text-lg ml-2">{t('insurance.active_policies')}</Text>
          </View>
          <Text className="text-purple-100 text-sm mb-4">{t('insurance.active_desc')}</Text>
          <View className="bg-white/20 p-4 rounded-xl">
            <Text className="text-white font-bold">PM Suraksha Bima Yojana</Text>
            <Text className="text-purple-100 text-xs mt-1">{t('insurance.valid_till')}</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('insurance.recommended_plans')}</Text>
        {[
          { title: t('insurance.weaver_health'), desc: t('insurance.weaver_health_desc'), premium: t('insurance.premium_150'), icon: 'heart-pulse', color: 'bg-rose-50 dark:bg-rose-900/20', iconColor: '#e11d48' },
          { title: t('insurance.loom_protection'), desc: t('insurance.loom_protection_desc'), premium: t('insurance.premium_50'), icon: 'tools', color: 'bg-amber-50 dark:bg-amber-900/20', iconColor: '#d97706' },
        ].map((plan, i) => (
          <TouchableOpacity key={i} className={`${plan.color} rounded-2xl p-5 mb-4 flex-row items-center border border-gray-100 dark:border-gray-800`}>
            <View className="bg-white dark:bg-slate-800 p-3 rounded-xl mr-4 shadow-sm">
              <MaterialCommunityIcons name={plan.icon as any} size={28} color={plan.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white font-bold text-base mb-1">{plan.title}</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-xs mb-2">{plan.desc}</Text>
              <Text className="text-blue-600 dark:text-blue-400 font-bold">{plan.premium}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
