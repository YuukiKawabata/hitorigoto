import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { Story } from "@/db/schema";
import { useColorScheme } from "@/hooks/use-color-scheme";
import cx from "clsx";
import { format } from "date-fns";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
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
        "SELECT * FROM stories WHERE id = ?",
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
    Alert.alert("削除", "この物語を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await db.runAsync("DELETE FROM stories WHERE id = ?", Number(id));
            router.back();
          } catch (error) {
            console.error(error);
            Alert.alert("エラー", "削除に失敗しました。");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        className={cx(
          "flex-1 justify-center items-center",
          isDark ? "bg-neutral-950" : "bg-off-white"
        )}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </SafeAreaView>
    );
  }

  if (!story) {
    return (
      <SafeAreaView
        className={cx(
          "flex-1 justify-center items-center",
          isDark ? "bg-neutral-950" : "bg-off-white"
        )}
      >
        <Text className={cx(isDark ? "text-gray-300" : "text-gray-500")}>
          データが見つかりませんでした。
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={cx("flex-1", isDark ? "bg-neutral-950" : "bg-off-white")}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: "物語",
          headerBackTitle: "戻る",
          headerTintColor: theme.text,
          headerTitleStyle: { color: theme.text },
          headerStyle: { backgroundColor: theme.background },
          headerRight: () => (
            <TouchableOpacity onPress={handleShare}>
              <IconSymbol
                name="square.and.arrow.up"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text
          className={cx(
            "text-2xl font-bold mb-2 text-center",
            isDark ? "text-gray-100" : "text-sumi-gray"
          )}
        >
          {story.title}
        </Text>
        <Text className="text-gray-400 text-xs mb-8 text-center">
          {format(new Date(story.created_at), "yyyy/MM/dd")} 作成
        </Text>

        <Text
          className={cx(
            "text-lg leading-9 mb-10 font-serif",
            isDark ? "text-gray-100" : "text-sumi-gray"
          )}
        >
          {story.content}
        </Text>

        <TouchableOpacity
          onPress={handleDelete}
          className={cx(
            "flex-row items-center justify-center py-3 rounded-lg mt-8",
            isDark ? "bg-gray-900" : "bg-gray-100"
          )}
        >
          <IconSymbol name="trash" size={20} color={theme.icon} />
          <Text
            className={cx(
              "font-bold ml-2",
              isDark ? "text-gray-300" : "text-gray-600"
            )}
          >
            この物語を削除
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
