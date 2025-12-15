import { IconSymbol } from '@/components/ui/icon-symbol';
import { Story } from '@/db/schema';
import { generateStoryMock } from '@/services/ai';
import { format } from 'date-fns';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
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
      <TouchableOpacity className="mb-8 mx-6 bg-white p-6 rounded-sm shadow-sm active:opacity-90 border border-gray-50">
        <Text 
          className="text-xl text-sumi-gray mb-3 leading-8"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'serif', fontWeight: 'bold' }}
        >
          {item.title}
        </Text>
        <View className="flex-row items-center mb-4">
          <View className="h-[1px] w-8 bg-gray-200 mr-2" />
          <Text className="text-gray-400 text-xs tracking-wider">
            {format(new Date(item.created_at), 'yyyy.MM.dd')}
          </Text>
        </View>
        <Text 
          className="text-gray-600 text-sm leading-7" 
          numberOfLines={3}
          style={{ fontFamily: Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'serif' }}
        >
          {item.content}
        </Text>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView className="flex-1 bg-off-white" edges={['top']}>
      <Text className="text-center py-4 text-gray-400 text-sm tracking-[0.2em] font-medium">
        物語
      </Text>
      
      <View className="px-6 mb-6">
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={generating}
          className={`flex-row items-center justify-center py-4 rounded-full shadow-sm ${
            generating ? 'bg-gray-100' : 'bg-sumi-gray'
          }`}
        >
          {generating ? (
            <Text className="text-gray-400 font-medium tracking-widest">物語を紡いでいます...</Text>
          ) : (
            <>
              <IconSymbol name="sparkles" size={18} color="#fff" />
              <Text className="text-white font-medium ml-3 tracking-widest">物語を紡ぐ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#333" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-30">
             <Text 
              className="text-sumi-gray text-sm tracking-widest"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'serif' }}
            >
              まだ、物語は生まれていません。
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
