import { IconSymbol } from '@/components/ui/icon-symbol';
import { Soliloquy } from '@/db/schema';
import { format } from 'date-fns';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SoliloquyDetailScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const [soliloquy, setSoliloquy] = useState<Soliloquy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSoliloquy();
    }
  }, [id]);

  const loadSoliloquy = async () => {
    try {
      // id is string from params, need to cast for query if needed, but sqlite handles string params usually.
      // Better to cast to number safely.
      const soliloquyId = Number(id);
      const result = await db.getFirstAsync<Soliloquy>(
        'SELECT * FROM soliloquies WHERE id = ?',
        soliloquyId
      );
      setSoliloquy(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '削除',
      'このひとりごとを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM soliloquies WHERE id = ?', Number(id));
              router.back();
            } catch (error) {
              console.error(error);
              Alert.alert('エラー', '削除に失敗しました。');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-off-white justify-center items-center">
        <ActivityIndicator size="large" color="#333" />
      </SafeAreaView>
    );
  }

  if (!soliloquy) {
    return (
      <SafeAreaView className="flex-1 bg-off-white justify-center items-center">
        <Text className="text-gray-500">データが見つかりませんでした。</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-off-white" edges={['bottom']}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'ひとりごと詳細',
        headerBackTitle: '戻る',
        headerTintColor: '#333',
        headerStyle: { backgroundColor: '#F9F9F9' },
      }} />
      
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-gray-400 text-sm mb-4 text-center">
          {format(new Date(soliloquy.created_at), 'yyyy/MM/dd HH:mm')}
        </Text>

        {soliloquy.image_uri && (
          <Image 
            source={{ uri: soliloquy.image_uri }} 
            className="w-full h-64 rounded-xl mb-6 shadow-sm"
            resizeMode="cover"
          />
        )}

        <Text className="text-sumi-gray text-lg leading-8 mb-10">
          {soliloquy.content}
        </Text>

        <TouchableOpacity 
          onPress={handleDelete}
          className="flex-row items-center justify-center bg-red-50 py-3 rounded-lg border border-red-100"
        >
          <IconSymbol name="trash" size={20} color="#ef4444" />
          <Text className="text-red-500 font-bold ml-2">削除する</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
