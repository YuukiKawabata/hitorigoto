import { IconSymbol } from '@/components/ui/icon-symbol';
import { Story } from '@/db/schema';
import { format } from 'date-fns';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadStory();
    }
  }, [id]);

  const loadStory = async () => {
    try {
      const storyId = Number(id);
      const result = await db.getFirstAsync<Story>(
        'SELECT * FROM stories WHERE id = ?',
        storyId
      );
      setStory(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!story) return;
    try {
      await Share.share({
        message: `${story.title}\n\n${story.content}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = () => {
     Alert.alert(
       '削除',
       'この物語を削除しますか？',
       [
         { text: 'キャンセル', style: 'cancel' },
         { 
           text: '削除', 
           style: 'destructive',
           onPress: async () => {
             try {
               await db.runAsync('DELETE FROM stories WHERE id = ?', Number(id));
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

  if (!story) {
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
        title: '物語',
        headerBackTitle: '戻る',
        headerTintColor: '#333',
        headerStyle: { backgroundColor: '#F9F9F9' },
        headerRight: () => (
          <TouchableOpacity onPress={handleShare}>
            <IconSymbol name="square.and.arrow.up" size={24} color="#333" />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-2xl font-bold text-sumi-gray mb-2 text-center">
          {story.title}
        </Text>
        <Text className="text-gray-400 text-xs mb-8 text-center">
          {format(new Date(story.created_at), 'yyyy/MM/dd')} 作成
        </Text>

        <Text className="text-sumi-gray text-lg leading-9 mb-10 font-serif">
          {story.content}
        </Text>

         <TouchableOpacity 
           onPress={handleDelete}
           className="flex-row items-center justify-center bg-gray-100 py-3 rounded-lg mt-8"
         >
           <IconSymbol name="trash" size={20} color="#666" />
           <Text className="text-gray-600 font-bold ml-2">この物語を削除</Text>
         </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
