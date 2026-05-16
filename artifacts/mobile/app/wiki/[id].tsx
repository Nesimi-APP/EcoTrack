import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/context/LanguageContext";
import { WIKI_ARTICLES } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";

const CATEGORY_MAP: Record<string, string> = {
  "E-Tullantı":          "eWaste",
  "Bərpa Olunan Enerji": "renewable",
  "Plastiksiz Həyat":    "plasticFree",
  "Karbon İzi":          "carbonFootprint",
};

export default function WikiArticleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = WIKI_ARTICLES.find((a) => a.id === id);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!article) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>
          {t.wiki.all === "Hamısı" ? "Məqalə tapılmadı" : t.wiki.all === "All" ? "Article not found" : "Makale bulunamadı"}
        </Text>
      </View>
    );
  }

  const catKey = CATEGORY_MAP[article.category];
  const displayCategory = catKey
    ? t.wiki.categories[catKey as keyof typeof t.wiki.categories]
    : article.category;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={[styles.catBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={styles.catText}>{displayCategory}</Text>
        </View>
        <Text style={styles.title}>{article.title}</Text>
        <View style={styles.meta}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.readTime}>{article.readTime} {t.wiki.readTimeSuffix}</Text>
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
