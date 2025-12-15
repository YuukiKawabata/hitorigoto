import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { db } from '@/db/db';
import { Story } from '@/db/schema';
import { generateStoryMock } from '@/services/ai';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function StoriesScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadStories = useCallback(() => {
    try {
      const rows = db.getAllSync<Story>(
        'SELECT * FROM stories ORDER BY created_at DESC'
      );
      setStories(rows);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [loadStories])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStories();
    setRefreshing(false);
  }, [loadStories]);

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await generateStoryMock();
    setGenerating(false);

    if (result) {
      Alert.alert('生成完了', '新しい物語が作成されました。');
      loadStories();
    } else {
      Alert.alert('エラー', 'ひとりごとが足りないか、エラーが発生しました。');
    }
  };

  const renderItem = ({ item }: { item: Story }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm mx-4 border border-gray-100">
      <Text className="text-lg font-bold text-sumi-gray mb-1">
        {item.title}
      </Text>
      <Text className="text-gray-400 text-xs mb-3">
        {format(new Date(item.created_at), 'yyyy/MM/dd')} 作成
      </Text>
      <Text className="text-sumi-gray text-base leading-6" numberOfLines={3}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-off-white pt-4">
      <View className="px-4 mb-4">
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={generating}
          className={`flex-row items-center justify-center py-3 rounded-lg ${
            generating ? 'bg-gray-300' : 'bg-sumi-gray'
          }`}
        >
          <IconSymbol name="sparkles" size={20} color="white" />
          <Text className="text-white font-bold ml-2">
            {generating ? '生成中...' : '物語を紡ぐ'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-gray-400">作成された物語はまだありません。</Text>
          </View>
        }
      />
    </View>
  );
}
