import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function PaymentsScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-slate-900">
      <View className="p-4 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">{t('payments.payments')}</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">{t('payments.upi_id')}</Text>
        </View>
        <TouchableOpacity className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full">
          <MaterialCommunityIcons name="qrcode" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
        {/* Main Action - Scan & Pay */}
        <View className="px-4 mb-6">
          <TouchableOpacity className="bg-blue-600 rounded-3xl p-6 items-center shadow-lg shadow-blue-500/30 flex-row justify-center">
            <MaterialCommunityIcons name="qrcode-scan" size={32} color="white" />
            <Text className="text-white text-xl font-bold ml-3">{t('payments.scan_any_qr')}</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Options */}
        <View className="px-4 mb-8">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('payments.transfer_money')}</Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              { icon: 'account', label: t('payments.to_mobile'), color: 'bg-indigo-100', iconColor: '#4f46e5' },
              { icon: 'bank', label: t('payments.to_bank'), color: 'bg-emerald-100', iconColor: '#059669' },
              { icon: 'account-convert', label: t('payments.to_self'), color: 'bg-purple-100', iconColor: '#9333ea' },
              { icon: 'account-group', label: t('payments.split_bill'), color: 'bg-orange-100', iconColor: '#ea580c' },
            ].map((action, index) => (
              <TouchableOpacity key={index} className="items-center mb-4 w-[22%]">
                <View className={`${action.color} p-4 rounded-2xl mb-2 items-center justify-center w-full aspect-square`}>
                  <MaterialCommunityIcons name={action.icon as any} size={28} color={action.iconColor} />
                </View>
                <Text className="text-xs text-center text-gray-700 dark:text-gray-300 font-medium" numberOfLines={1}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-4 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('payments.recent')}</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 dark:text-blue-400 font-medium">{t('payments.view_all')}</Text>
            </TouchableOpacity>
          </View>

          {[
            { name: t('payments.karthik_yarn'), date: t('payments.today'), amount: '-₹ 4,500', isDebit: true },
            { name: t('payments.handloom_coop'), date: t('payments.yesterday'), amount: '+₹ 12,000', isDebit: false },
            { name: t('payments.electricity_bill'), date: t('payments.date_may'), amount: '-₹ 850', isDebit: true },
          ].map((txn, index) => (
            <View key={index} className="flex-row items-center mb-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
              <View className={`${txn.isDebit ? 'bg-red-100' : 'bg-green-100'} p-3 rounded-full mr-4`}>
                <MaterialCommunityIcons name={txn.isDebit ? 'arrow-up' : 'arrow-down'} size={20} color={txn.isDebit ? '#dc2626' : '#16a34a'} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 dark:text-white font-bold text-base">{txn.name}</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs">{txn.date}</Text>
              </View>
              <Text className={`font-bold text-base ${txn.isDebit ? 'text-gray-900 dark:text-white' : 'text-green-600 dark:text-green-400'}`}>
                {txn.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
