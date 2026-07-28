import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function AiScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { id: 1, text: t('ai.ai_greeting'), isBot: true },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, isBot: false }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text: t('ai.ai_mock_response'), isBot: true }]);
    }, 1000);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-slate-900">
      <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex-row items-center">
        <View className="bg-blue-100 p-2 rounded-full mr-3">
          <MaterialCommunityIcons name="robot-outline" size={24} color="#2563eb" />
        </View>
        <View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">{t('ai.ai_title')}</Text>
          <Text className="text-emerald-500 text-xs font-bold">{t('ai.online')}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map(msg => (
            <View key={msg.id} className={`max-w-[80%] mb-4 ${msg.isBot ? 'self-start' : 'self-end'}`}>
              <View className={`p-4 rounded-2xl ${msg.isBot ? 'bg-gray-100 dark:bg-slate-800 rounded-tl-sm' : 'bg-blue-600 rounded-tr-sm'}`}>
                <Text className={`${msg.isBot ? 'text-gray-900 dark:text-white' : 'text-white'} text-base leading-6`}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 flex-row items-center">
          <TouchableOpacity className="p-3 bg-gray-100 dark:bg-slate-800 rounded-full mr-2">
            <MaterialCommunityIcons name="microphone" size={24} color="#2563eb" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-3 text-gray-900 dark:text-white"
            placeholder={t('ai.type_message')}
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage} className="p-3 bg-blue-600 rounded-full ml-2">
            <MaterialCommunityIcons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
