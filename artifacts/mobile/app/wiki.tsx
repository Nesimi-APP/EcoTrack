import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WIKI_ARTICLES } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["Hamısı", "E-Tullantı", "Bərpa Olunan Enerji", "Plastiksiz Həyat", "Karbon İzi"];

const CATEGORY_ICONS: Record<string, string> = {
  "E-Tullantı": "recycle",
  "Bərpa Olunan Enerji": "solar-panel",
  "Plastiksiz Həyat": "leaf",
  "Karbon İzi": "molecule-co2",
};

export default function WikiScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("Hamısı");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = filter === "Hamısı"
    ? WIKI_ARTICLES
    : WIKI_ARTICLES.filter((a) => a.category === filter);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === cat ? colors.primary : colors.secondary,
                borderColor: filter === cat ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterText, { color: filter === cat ? "#FFFFFF" : colors.foreground }]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Articles */}
      <View style={styles.articles}>
        {filtered.map((article) => (
          <Pressable
            key={article.id}
            style={({ pressed }) => [
              styles.articleCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => router.push({ pathname: "/wiki/[id]", params: { id: article.id } })}
          >
            <View style={[styles.catBadge, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons
                name={(CATEGORY_ICONS[article.category] || "book-open") as any}
                size={12}
                color={colors.primary}
              />
              <Text style={[styles.catText, { color: colors.primary }]}>{article.category}</Text>
            </View>
            <Text style={[styles.articleTitle, { color: colors.foreground }]}>{article.title}</Text>
            <Text style={[styles.articleSummary, { color: colors.mutedForeground }]}>{article.summary}</Text>
            <View style={styles.articleFooter}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={[styles.readTime, { color: colors.mutedForeground }]}>{article.readTime}</Text>
              <View style={{ flex: 1 }} />
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  filterRow: { gap: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  articles: { gap: 12 },
  articleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  catText: { fontSize: 11, fontWeight: "600" },
  articleTitle: { fontSize: 16, fontWeight: "700" },
  articleSummary: { fontSize: 13, lineHeight: 19 },
  articleFooter: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  readTime: { fontSize: 12 },
});
