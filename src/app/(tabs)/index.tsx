import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '@/db/db';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SoliloquyScreen() {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

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
      db.runSync(
        'INSERT INTO soliloquies (content, image_uri, created_at) VALUES (?, ?, ?)',
        content,
        imageUri,
        Date.now()
      );
      setContent('');
      setImageUri(null);
      Alert.alert('ひとりごと', '記録しました。');
    } catch (error) {
      console.error(error);
      Alert.alert('エラー', '記録に失敗しました。');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-off-white"
    >
      <View className="flex-1 p-6 justify-center">
        <Text className="text-2xl font-bold text-sumi-gray mb-8 text-center tracking-widest">
          ひとりごと
        </Text>

        <TextInput
          className="bg-white p-4 rounded-xl border border-gray-200 text-lg text-sumi-gray min-h-[150px] mb-4"
          placeholder="今の気持ちは..."
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        {imageUri && (
          <View className="mb-4 relative">
            <Image source={{ uri: imageUri }} className="w-full h-48 rounded-lg" resizeMode="cover" />
            <TouchableOpacity 
              onPress={() => setImageUri(null)}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
            >
              <IconSymbol name="xmark" size={20} color="white" /> 
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={pickImage} className="p-3 bg-white rounded-full border border-gray-200">
            <IconSymbol name="photo" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={submitSoliloquy}
          className="bg-sumi-gray py-4 rounded-full items-center shadow-lg active:opacity-90"
        >
          <Text className="text-white text-lg font-bold tracking-widest">
            ひとりごとボタン
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
