import { IconSymbol } from '@/components/ui/icon-symbol';
import { Story } from '@/db/schema';
import { generateStoryMock } from '@/services/ai';
import { format } from 'date-fns';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StoriesScreen() {
  const db = useSQLiteContext();
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadStories = useCallback(async () => {
    try {
      const rows = await db.getAllAsync<Story>(
        'SELECT * FROM stories ORDER BY created_at DESC'
      );
      setStories(rows);
    } catch (error) {
      console.error(error);
    }
  }, [db]);

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
    const result = await generateStoryMock(db);
    setGenerating(false);

    if (result) {
      Alert.alert('生成完了', '新しい物語が作成されました。');
      loadStories();
    } else {
      Alert.alert('エラー', 'ひとりごとが足りないか、エラーが発生しました。');
    }
  };

  const renderItem = ({ item }: { item: Story }) => (
    <Link href={`/story/${item.id}`} asChild>
      <TouchableOpacity className="bg-white p-4 mb-3 rounded-lg shadow-sm mx-4 border border-gray-100">
        <Text className="text-lg font-bold text-sumi-gray mb-1">
          {item.title}
        </Text>
        <Text className="text-gray-400 text-xs mb-3">
          {format(new Date(item.created_at), 'yyyy/MM/dd')} 作成
        </Text>
        <Text className="text-sumi-gray text-base leading-6" numberOfLines={3}>
          {item.content}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView className="flex-1 bg-off-white" edges={['top']}>
      <View className="px-4 mb-4 pt-4">
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
    </SafeAreaView>
  );
}
