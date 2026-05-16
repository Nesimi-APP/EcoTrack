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

import { useLanguage } from "@/context/LanguageContext";
import { WIKI_ARTICLES, WikiArticle } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";
import { Language } from "@/i18n/translations";

// Internal Azerbaijani category labels (used to filter WIKI_ARTICLES)
const CATEGORY_MAP = [
  { key: "all" as const,             azLabel: "" },
  { key: "eWaste" as const,          azLabel: "E-Tullantı" },
  { key: "renewable" as const,       azLabel: "Bərpa Olunan Enerji" },
  { key: "plasticFree" as const,     azLabel: "Plastiksiz Həyat" },
  { key: "carbonFootprint" as const, azLabel: "Karbon İzi" },
];

type CategoryKey = typeof CATEGORY_MAP[number]["key"];

const CATEGORY_ICONS: Record<string, string> = {
  "E-Tullantı":        "recycle",
  "Bərpa Olunan Enerji": "solar-panel",
  "Plastiksiz Həyat":  "leaf",
  "Karbon İzi":        "molecule-co2",
};

function getLocale(article: WikiArticle, lang: Language) {
  return article[lang] ?? article.az;
}

export default function WikiScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const [filterKey, setFilterKey] = useState<CategoryKey>("all");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const activeAzLabel = CATEGORY_MAP.find((c) => c.key === filterKey)?.azLabel ?? "";

  const filtered = filterKey === "all"
    ? WIKI_ARTICLES
    : WIKI_ARTICLES.filter((a) => a.category === activeAzLabel);

  function getCategoryLabel(key: CategoryKey): string {
    if (key === "all") return t.wiki.all;
    return t.wiki.categories[key];
  }

  function getArticleCategoryLabel(azLabel: string): string {
    const entry = CATEGORY_MAP.find((c) => c.azLabel === azLabel);
    if (!entry || entry.key === "all") return azLabel;
    return t.wiki.categories[entry.key];
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {CATEGORY_MAP.map((cat) => (
          <Pressable
            key={cat.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: filterKey === cat.key ? colors.primary : colors.secondary,
                borderColor: filterKey === cat.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilterKey(cat.key)}
          >
            <Text style={[styles.filterText, { color: filterKey === cat.key ? "#FFFFFF" : colors.foreground }]}>
              {getCategoryLabel(cat.key)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Articles */}
      <View style={styles.articles}>
        {filtered.map((article) => {
          const locale = getLocale(article, language);
          return (
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
                <Text style={[styles.catText, { color: colors.primary }]}>
                  {getArticleCategoryLabel(article.category)}
                </Text>
              </View>
              <Text style={[styles.articleTitle, { color: colors.foreground }]}>{locale.title}</Text>
              <Text style={[styles.articleSummary, { color: colors.mutedForeground }]}>{locale.summary}</Text>
              <View style={styles.articleFooter}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.readTime, { color: colors.mutedForeground }]}>{locale.readTime}</Text>
                <View style={{ flex: 1 }} />
                <Feather name="chevron-right" size={16} color={colors.primary} />
              </View>
            </Pressable>
          );
        })}
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
