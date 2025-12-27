import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { Soliloquy } from "@/db/schema";
import { useColorScheme } from "@/hooks/use-color-scheme";
import cx from "clsx";
import { format } from "date-fns";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const [history, setHistory] = useState<Soliloquy[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const rows = await db.getAllAsync<Soliloquy>(
        "SELECT * FROM soliloquies ORDER BY created_at DESC"
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
      <TouchableOpacity
        className={cx(
          "mb-6 mx-6 pb-6 active:opacity-70",
          isDark ? "border-b border-gray-800" : "border-b border-gray-100"
        )}
      >
        <View className="flex-row items-baseline mb-2">
          <Text className="text-xs text-gray-400 font-medium tracking-wider mr-3">
            {format(new Date(item.created_at), "yyyy.MM.dd")}
          </Text>
          <Text className="text-xs text-gray-300">
            {format(new Date(item.created_at), "HH:mm")}
          </Text>
        </View>

        <Text
          className={cx(
            "text-base leading-7 mb-3",
            isDark ? "text-gray-100" : "text-sumi-gray"
          )}
          numberOfLines={3}
          style={{
            fontFamily:
              Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
          }}
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
    <SafeAreaView
      className={cx("flex-1", isDark ? "bg-neutral-950" : "bg-off-white")}
      edges={["top"]}
    >
      <View className="px-6 py-4 flex-row items-center">
        <View style={{ width: 32 }} />
        <Text className="flex-1 text-center text-gray-400 text-sm tracking-[0.2em] font-medium">
          記憶
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/modal")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 32, alignItems: "flex-end" }}
        >
          <IconSymbol name="gearshape" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-32 opacity-30">
            <Text
              className={cx(
                "text-sm tracking-widest",
                isDark ? "text-gray-100" : "text-sumi-gray"
              )}
              style={{
                fontFamily:
                  Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
              }}
            >
              まだ、何もありません。
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
