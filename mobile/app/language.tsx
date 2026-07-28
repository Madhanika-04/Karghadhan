import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'hi', name: 'Hindi', native: 'हिंदी' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language || 'en');

  const handleContinue = () => {
    i18n.changeLanguage(selected);
    router.push('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 p-6">
      <View className="items-center mt-8 mb-8">
        <View className="bg-blue-100 p-4 rounded-full mb-4">
          <MaterialCommunityIcons name="translate" size={48} color="#2563eb" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          {t('language.choose_language')}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
          {t('language.language_desc')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="flex-row flex-wrap justify-between">
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              onPress={() => setSelected(lang.id)}
              className={`w-[48%] p-4 rounded-2xl mb-4 border-2 flex-col items-center ${
                selected === lang.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800'
              }`}
            >
              <Text
                className={`text-2xl font-bold mb-1 ${
                  selected === lang.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                }`}
              >
                {lang.native}
              </Text>
              <Text
                className={`text-sm ${
                  selected === lang.id ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleContinue}
        className="bg-blue-600 p-4 rounded-full items-center mt-4 shadow-lg shadow-blue-500/30"
      >
        <Text className="text-white text-lg font-bold">{t('language.continue')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
