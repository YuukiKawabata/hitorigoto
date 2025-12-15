import { IconSymbol } from '@/components/ui/icon-symbol';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SoliloquyScreen() {
  const db = useSQLiteContext();
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: ja }));
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitSoliloquy = async () => {
    if (!content.trim() && !imageUri) {
      return;
    }

    try {
      await db.runAsync(
        'INSERT INTO soliloquies (content, image_uri, created_at) VALUES (?, ?, ?)',
        content,
        imageUri,
        Date.now()
      );
      setContent('');
      setImageUri(null);
      Alert.alert('記録', 'ひとりごとを心に留めました。');
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', '記録に失敗しました。');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-off-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-gray-400 text-sm font-medium tracking-widest text-center">
            {today}
          </Text>
        </View>

        {/* Input Area */}
        <View className="flex-1 px-6 pt-2">
          <TextInput
            className="flex-1 text-lg text-sumi-gray leading-8"
            placeholder="今日はどんな一日でしたか？"
            placeholderTextColor="#d1d5db"
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            style={{ fontFamily: Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'serif' }}
          />

          {imageUri && (
            <View className="mb-4 relative rounded-xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
              <Image source={{ uri: imageUri }} className="w-full h-48" resizeMode="cover" />
              <TouchableOpacity 
                onPress={() => setImageUri(null)}
                className="absolute top-2 right-2 bg-black/40 rounded-full p-1"
              >
                <IconSymbol name="xmark" size={16} color="white" /> 
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Toolbar */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-off-white border-t border-gray-100">
          <TouchableOpacity 
            onPress={pickImage} 
            className="p-3 rounded-full hover:bg-gray-100 active:bg-gray-100"
          >
            <IconSymbol name="photo" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={submitSoliloquy}
            disabled={!content.trim() && !imageUri}
            className={`px-6 py-2 rounded-full ${
              (!content.trim() && !imageUri) ? 'bg-gray-200' : 'bg-sumi-gray'
            }`}
          >
            <Text className={`font-bold ${
              (!content.trim() && !imageUri) ? 'text-gray-400' : 'text-white'
            }`}>
              残す
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
