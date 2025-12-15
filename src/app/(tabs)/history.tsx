import { Soliloquy } from '@/db/schema';
import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const [history, setHistory] = useState<Soliloquy[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const rows = await db.getAllAsync<Soliloquy>(
        'SELECT * FROM soliloquies ORDER BY created_at DESC'
      );
      setHistory(rows);
    } catch (error) {
      console.error(error);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const renderItem = ({ item }: { item: Soliloquy }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm mx-4 border border-gray-100">
      <Text className="text-gray-400 text-xs mb-2">
        {format(new Date(item.created_at), 'yyyy/MM/dd HH:mm')}
      </Text>
      <Text className="text-sumi-gray text-base leading-6 mb-2">
        {item.content}
      </Text>
      {item.image_uri && (
        <Image 
          source={{ uri: item.image_uri }} 
          className="w-full h-48 rounded-md mt-2"
          resizeMode="cover"
        />
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-off-white" edges={['top']}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-gray-400">まだ、ひとりごとはありません。</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

