import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WIKI_ARTICLES } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";

export default function WikiArticleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = WIKI_ARTICLES.find((a) => a.id === id);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!article) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Məqalə tapılmadı</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={[styles.catBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={styles.catText}>{article.category}</Text>
        </View>
        <Text style={styles.title}>{article.title}</Text>
        <View style={styles.meta}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.readTime}>{article.readTime} oxuma</Text>
        </View>
      </View>

      <View style={styles.body}>
        {article.content.split("\n\n").map((para, i) => (
          <Text key={i} style={[styles.paragraph, { color: colors.foreground }]}>
            {para}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  header: {
    padding: 24,
    paddingBottom: 28,
    gap: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  catText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", lineHeight: 32 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  readTime: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  body: { padding: 20, gap: 16 },
  paragraph: { fontSize: 15, lineHeight: 24 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16 },
});
