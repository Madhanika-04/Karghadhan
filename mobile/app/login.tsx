import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');

  const handleLogin = () => {
    // Navigate to dashboard
    router.replace('/(tabs)');
  };

  const handleBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to Karghadhan',
        fallbackLabel: 'Use PIN',
      });
      if (result.success) {
        handleLogin();
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 px-6 justify-center"
      >
        <View className="items-center mb-8">
          <View className="bg-blue-100 p-4 rounded-full mb-4">
            <MaterialCommunityIcons name="lock-outline" size={48} color="#2563eb" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">{t('login.welcome_back')}</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-2">{t('login.enter_phone')}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">{t('login.phone_number')}</Text>
          <View className="flex-row items-center border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-slate-800">
            <Text className="text-gray-500 text-lg mr-2">+91</Text>
            <TextInput
              className="flex-1 text-lg text-gray-900 dark:text-white"
              placeholder="00000 00000"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-blue-600 p-4 rounded-xl items-center shadow-lg shadow-blue-500/30 mb-4"
        >
          <Text className="text-white text-lg font-bold">{t('login.get_otp')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBiometric}
          className="flex-row justify-center items-center p-4 border border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50 dark:bg-blue-900/20"
        >
          <MaterialCommunityIcons name="fingerprint" size={24} color="#2563eb" />
          <Text className="text-blue-600 dark:text-blue-400 text-lg font-bold ml-2">{t('login.login_biometric')}</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-600 dark:text-gray-400">{t('login.no_account')} </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text className="text-blue-600 dark:text-blue-400 font-bold">{t('login.register_now')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
