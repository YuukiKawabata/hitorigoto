import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import cx from "clsx";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SoliloquyScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(format(new Date(), "yyyy年MM月dd日 EEEE", { locale: ja }));
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Use original image
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
    }
  };

  const submitSoliloquy = async () => {
    if (!content.trim() && !imageUri) {
      return;
    }

    try {
      await db.runAsync(
        "INSERT INTO soliloquies (content, image_uri, created_at) VALUES (?, ?, ?)",
        content,
        imageUri,
        Date.now()
      );
      setContent("");
      setImageUri(null);
      Alert.alert("記録", "ひとりごとを心に留めました。");
    } catch (error) {
      console.error(error);
      Alert.alert("エラー", "記録に失敗しました。");
    }
  };

  return (
    <SafeAreaView
      className={cx("flex-1", isDark ? "bg-neutral-950" : "bg-off-white")}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center">
          <View style={{ width: 32 }} />
          <Text className="flex-1 text-gray-400 text-sm font-medium tracking-widest text-center">
            {today}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/modal")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ width: 32, alignItems: "flex-end" }}
          >
            <IconSymbol name="gearshape" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <View className="flex-1 px-6 pt-2">
          <TextInput
            className={cx(
              "flex-1 text-lg leading-8",
              isDark ? "text-gray-100" : "text-sumi-gray"
            )}
            placeholder="今日はどんな一日でしたか？"
            placeholderTextColor={isDark ? "#6b7280" : "#d1d5db"}
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            style={{
              fontFamily:
                Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
            }}
          />

          {imageUri && (
            <View
              className={cx(
                "mb-4 relative rounded-md overflow-hidden shadow-sm border mx-auto",
                isDark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-gray-100 border-gray-200"
              )}
              style={{ width: "100%", height: 320 }}
            >
              <Image
                source={{ uri: imageUri }}
                className="flex-1 w-full h-full"
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                className="absolute top-2 right-2 bg-black/40 rounded-full p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol name="xmark" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Toolbar */}
        <View
          className={cx(
            "flex-row items-center justify-between px-4 py-3 border-t",
            isDark
              ? "bg-neutral-950 border-gray-900"
              : "bg-off-white border-gray-100"
          )}
        >
          <TouchableOpacity
            onPress={pickImage}
            className="p-3 rounded-full hover:bg-gray-100 active:bg-gray-100"
          >
            <IconSymbol name="photo" size={24} color={theme.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={submitSoliloquy}
            disabled={!content.trim() && !imageUri}
            className={`px-6 py-2 rounded-full ${
              !content.trim() && !imageUri ? "bg-gray-200" : "bg-sumi-gray"
            }`}
          >
            <Text
              className={`font-bold ${
                !content.trim() && !imageUri ? "text-gray-400" : "text-white"
              }`}
            >
              残す
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
