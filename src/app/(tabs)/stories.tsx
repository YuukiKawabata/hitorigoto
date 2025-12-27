import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { Story } from "@/db/schema";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { generateStoryMock } from "@/services/ai";
import cx from "clsx";
import { format } from "date-fns";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoriesScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadStories = useCallback(async () => {
    try {
      const rows = await db.getAllAsync<Story>(
        "SELECT * FROM stories ORDER BY created_at DESC"
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
      Alert.alert("生成完了", "新しい物語が作成されました。");
      loadStories();
    } else {
      Alert.alert("エラー", "ひとりごとが足りないか、エラーが発生しました。");
    }
  };

  const renderItem = ({ item }: { item: Story }) => (
    <Link href={`/story/${item.id}`} asChild>
      <TouchableOpacity
        className={cx(
          "mb-8 mx-6 p-6 rounded-sm shadow-sm active:opacity-90 border",
          isDark ? "bg-neutral-900 border-gray-800" : "bg-white border-gray-50"
        )}
      >
        <Text
          className={cx(
            "text-xl mb-3 leading-8",
            isDark ? "text-gray-100" : "text-sumi-gray"
          )}
          style={{
            fontFamily:
              Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
            fontWeight: "bold",
          }}
        >
          {item.title}
        </Text>
        <View className="flex-row items-center mb-4">
          <View
            className={cx(
              "h-[1px] w-8 mr-2",
              isDark ? "bg-gray-700" : "bg-gray-200"
            )}
          />
          <Text className="text-gray-400 text-xs tracking-wider">
            {format(new Date(item.created_at), "yyyy.MM.dd")}
          </Text>
        </View>
        <Text
          className={cx(
            "text-sm leading-7",
            isDark ? "text-gray-300" : "text-gray-600"
          )}
          numberOfLines={3}
          style={{
            fontFamily:
              Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
          }}
        >
          {item.content}
        </Text>
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
          物語
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/modal")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 32, alignItems: "flex-end" }}
        >
          <IconSymbol name="gearshape" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <View className="px-6 mb-6">
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={generating}
          className={`flex-row items-center justify-center py-4 rounded-full shadow-sm ${
            generating
              ? isDark
                ? "bg-gray-800"
                : "bg-gray-100"
              : "bg-sumi-gray"
          }`}
        >
          {generating ? (
            <Text
              className={cx(
                "font-medium tracking-widest",
                isDark ? "text-gray-300" : "text-gray-400"
              )}
            >
              物語を紡いでいます...
            </Text>
          ) : (
            <>
              <IconSymbol name="sparkles" size={18} color="#fff" />
              <Text className="text-white font-medium ml-3 tracking-widest">
                物語を紡ぐ
              </Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-30">
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
              まだ、物語は生まれていません。
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
