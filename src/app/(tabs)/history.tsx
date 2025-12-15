import { Soliloquy } from '@/db/schema';
import { format } from 'date-fns';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
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
    <Link href={`/soliloquy/${item.id}`} asChild>
      <TouchableOpacity className="mb-6 mx-6 border-b border-gray-100 pb-6 active:opacity-70">
        <View className="flex-row items-baseline mb-2">
          <Text className="text-xs text-gray-400 font-medium tracking-wider mr-3">
            {format(new Date(item.created_at), 'yyyy.MM.dd')}
          </Text>
          <Text className="text-xs text-gray-300">
            {format(new Date(item.created_at), 'HH:mm')}
          </Text>
        </View>
        
        <Text 
          className="text-base text-sumi-gray leading-7 mb-3" 
          numberOfLines={3}
          style={{ fontFamily: Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'serif' }}
        >
          {item.content}
        </Text>
        
        {item.image_uri && (
          <Image 
            source={{ uri: item.image_uri }} 
            className="w-full h-40 rounded-sm opacity-90"
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView className="flex-1 bg-off-white" edges={['top']}>
      <Text className="text-center py-4 text-gray-400 text-sm tracking-[0.2em] font-medium">
        記憶
      </Text>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#333" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-32 opacity-30">
            <Text 
              className="text-sumi-gray text-sm tracking-widest"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'serif' }}
            >
              まだ、何もありません。
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
