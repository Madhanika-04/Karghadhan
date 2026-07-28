import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function DashboardScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Header / Hero */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('dashboard.good_morning')}</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Arun Kumar</Text>
          </View>
          <TouchableOpacity className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm">
            <Ionicons name="notifications-outline" size={24} color="#1f2937" className="dark:color-white" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View className="bg-blue-600 rounded-2xl p-6 mb-6 shadow-lg shadow-blue-500/30">
          <Text className="text-blue-100 text-sm font-medium mb-1">{t('dashboard.total_balance')}</Text>
          <Text className="text-white text-3xl font-bold mb-4">₹ 42,500</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-full flex-row items-center">
              <MaterialCommunityIcons name="arrow-up" size={16} color="white" />
              <Text className="text-white font-medium ml-1">{t('dashboard.send')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-full flex-row items-center">
              <MaterialCommunityIcons name="arrow-down" size={16} color="white" />
              <Text className="text-white font-medium ml-1">{t('dashboard.receive')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-full flex-row items-center">
              <MaterialCommunityIcons name="history" size={16} color="white" />
              <Text className="text-white font-medium ml-1">{t('dashboard.history')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('dashboard.quick_actions')}</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {[
            { icon: 'qrcode-scan', label: t('dashboard.scan_qr'), color: 'bg-emerald-100', iconColor: '#059669' },
            { icon: 'bank-transfer', label: t('dashboard.bank_transfer'), color: 'bg-blue-100', iconColor: '#2563eb' },
            { icon: 'hand-coin', label: t('dashboard.self_transfer'), color: 'bg-purple-100', iconColor: '#9333ea' },
            { icon: 'cellphone', label: t('dashboard.recharge'), color: 'bg-orange-100', iconColor: '#ea580c' },
          ].map((action, index) => (
            <TouchableOpacity key={index} className="items-center mb-4 w-[22%]">
              <View className={`${action.color} p-4 rounded-2xl mb-2 items-center justify-center w-full aspect-square`}>
                <MaterialCommunityIcons name={action.icon as any} size={28} color={action.iconColor} />
              </View>
              <Text className="text-xs text-center text-gray-700 dark:text-gray-300 font-medium" numberOfLines={2}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Government Schemes Banner */}
        <TouchableOpacity className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 mb-8 flex-row items-center justify-between shadow-md">
          <View className="flex-1">
            <Text className="text-white font-bold text-lg mb-1">Weaver Mudra Loan</Text>
            <Text className="text-white/80 text-sm">{t('dashboard.apply_now_desc')}</Text>
          </View>
          <View className="bg-white/20 p-3 rounded-full ml-4">
            <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
