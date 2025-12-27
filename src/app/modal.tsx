import { StyleSheet, Switch, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorSchemePreference } from "@/hooks/use-color-scheme";

export default function ModalScreen() {
  const { colorScheme, toggleColorScheme } = useColorSchemePreference();
  const isDark = colorScheme === "dark";

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">設定</ThemedText>

      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#111827" : "#ffffff",
            borderColor: isDark ? "#1f2937" : "#e5e7eb",
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <ThemedText type="defaultSemiBold">ダークモード</ThemedText>
            <ThemedText style={styles.subText}>
              {isDark ? "オン" : "オフ"}
            </ThemedText>
          </View>
          <Switch value={isDark} onValueChange={toggleColorScheme} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 32,
  },
  card: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  textBlock: {
    flexDirection: "column",
    gap: 4,
  },
  subText: {
    opacity: 0.6,
  },
});
