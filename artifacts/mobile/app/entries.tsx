import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

function formatDate(iso: string, months: string[]) {
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function EntriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, deleteEntry } = useApp();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Full month names derived from dashboard short names — use a full set
  const fullMonths = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
    "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
  ];

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      deleteEntry(id);
      return;
    }
    Alert.alert(
      t.entries.deleteTitle,
      t.entries.deleteConfirm,
      [
        { text: t.entries.cancel, style: "cancel" },
        {
          text: t.entries.delete,
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteEntry(id);
          },
        },
      ]
    );
  };

  if (entries.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons
          name="leaf-circle-outline"
          size={56}
          color={colors.mutedForeground}
        />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          {t.entries.noEntries}
        </Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          {t.entries.noEntriesDesc}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: bottomPad + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: colors.primary }]}>
        <Text style={styles.summaryCount}>{entries.length} {t.entries.entries}</Text>
        <Text style={styles.summaryTotal}>
          {t.entries.total}: {entries.reduce((s, e) => s + e.total, 0).toFixed(1)} kq CO₂
        </Text>
      </View>

      {entries.map((entry) => {
        const d = new Date(entry.date);
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <View
            key={entry.id}
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.dateWrap}>
                {isToday && (
                  <View style={[styles.todayDot, { backgroundColor: colors.accent }]} />
                )}
                <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                  {formatDate(entry.date, fullMonths)}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDelete(entry.id)}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </Pressable>
            </View>

            <Text style={[styles.total, { color: colors.primary }]}>
              {entry.total.toFixed(2)} kq CO₂
            </Text>

            <View style={styles.breakdown}>
              {entry.transport > 0 && (
                <View style={[styles.breakItem, { backgroundColor: colors.secondary }]}>
                  <MaterialCommunityIcons name="car" size={13} color={colors.primary} />
                  <Text style={[styles.breakText, { color: colors.foreground }]}>
                    {entry.transport.toFixed(2)} kq
                  </Text>
                </View>
              )}
              {entry.energy > 0 && (
                <View style={[styles.breakItem, { backgroundColor: colors.secondary }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={13} color={colors.primary} />
                  <Text style={[styles.breakText, { color: colors.foreground }]}>
                    {entry.energy.toFixed(2)} kq
                  </Text>
                </View>
              )}
              {entry.food > 0 && (
                <View style={[styles.breakItem, { backgroundColor: colors.secondary }]}>
                  <MaterialCommunityIcons name="food-apple" size={13} color={colors.primary} />
                  <Text style={[styles.breakText, { color: colors.foreground }]}>
                    {entry.food.toFixed(2)} kq
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  summary: { borderRadius: 16, padding: 16, marginBottom: 4, gap: 4 },
  summaryCount: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  summaryTotal: { color: "rgba(255,255,255,0.75)", fontSize: 14 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  todayDot: { width: 7, height: 7, borderRadius: 4 },
  dateText: { fontSize: 12 },
  total: { fontSize: 20, fontWeight: "800" },
  breakdown: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  breakItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  breakText: { fontSize: 12, fontWeight: "600" },
});
