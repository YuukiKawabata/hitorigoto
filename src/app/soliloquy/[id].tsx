import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { Soliloquy } from "@/db/schema";
import { useColorScheme } from "@/hooks/use-color-scheme";
import cx from "clsx";
import { format } from "date-fns";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SoliloquyDetailScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
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
        "SELECT * FROM soliloquies WHERE id = ?",
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
    Alert.alert("削除", "このひとりごとを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await db.runAsync(
              "DELETE FROM soliloquies WHERE id = ?",
              Number(id)
            );
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

  if (!soliloquy) {
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
          title: "ひとりごと詳細",
          headerBackTitle: "戻る",
          headerTintColor: theme.text,
          headerTitleStyle: { color: theme.text },
          headerStyle: { backgroundColor: theme.background },
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-gray-400 text-sm mb-4 text-center">
          {format(new Date(soliloquy.created_at), "yyyy/MM/dd HH:mm")}
        </Text>

        {soliloquy.image_uri && (
          <Image
            source={{ uri: soliloquy.image_uri }}
            className="w-full h-64 rounded-xl mb-6 shadow-sm"
            resizeMode="cover"
          />
        )}

        <Text
          className={cx(
            "text-lg leading-8 mb-10",
            isDark ? "text-gray-100" : "text-sumi-gray"
          )}
        >
          {soliloquy.content}
        </Text>

        <TouchableOpacity
          onPress={handleDelete}
          className={cx(
            "flex-row items-center justify-center py-3 rounded-lg border",
            isDark ? "bg-red-950/30 border-red-900" : "bg-red-50 border-red-100"
          )}
        >
          <IconSymbol name="trash" size={20} color="#ef4444" />
          <Text className="text-red-500 font-bold ml-2">削除する</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
