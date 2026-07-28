import React from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function LoansScreen() {
  const { t } = useTranslation();

  const LOANS = [
    { id: '1', title: 'Weaver Mudra Loan', amount: t('loans.amount_range_1'), interest: t('loans.rate_6'), tag: t('loans.tag_govt'), color: 'bg-emerald-50 dark:bg-emerald-900/30', tagColor: 'bg-emerald-500' },
    { id: '2', title: t('loans.loan_raw_material'), amount: t('loans.amount_range_2'), interest: t('loans.rate_8'), tag: t('loans.tag_quick'), color: 'bg-blue-50 dark:bg-blue-900/30', tagColor: 'bg-blue-500' },
    { id: '3', title: t('loans.loan_loom_upgrade'), amount: t('loans.amount_range_3'), interest: t('loans.rate_7_5'), tag: t('loans.tag_subsidized'), color: 'bg-purple-50 dark:bg-purple-900/30', tagColor: 'bg-purple-500' },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-slate-900">
      <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{t('loans.loan_marketplace')}</Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-1">{t('loans.loan_desc')}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {LOANS.map(loan => (
          <TouchableOpacity key={loan.id} className={`${loan.color} rounded-2xl p-5 mb-4 border border-gray-100 dark:border-gray-800 shadow-sm`}>
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">{loan.title}</Text>
                <Text className="text-gray-600 dark:text-gray-400 text-sm">{loan.amount}</Text>
              </View>
              <View className={`${loan.tagColor} px-2 py-1 rounded-md`}>
                <Text className="text-white text-xs font-bold">{loan.tag}</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
              <View>
                <Text className="text-xs text-gray-500 dark:text-gray-400">{t('loans.interest_rate')}</Text>
                <Text className="text-sm font-bold text-gray-900 dark:text-white">{loan.interest}</Text>
              </View>
              <View className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                <Text className="text-blue-600 dark:text-blue-400 font-bold">{t('loans.apply_btn')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
