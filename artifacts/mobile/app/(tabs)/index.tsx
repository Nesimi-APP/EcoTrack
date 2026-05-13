import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CircularProgress } from "@/components/CircularProgress";
import { useApp } from "@/context/AppContext";
import { MONTHLY_TARGET_KG } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";

function EntryRow({
  item,
}: {
  item: { id: string; date: string; total: number; transport: number; energy: number; food: number };
}) {
  const colors = useColors();
  const d = new Date(item.date);
  const dateStr = `${d.getDate()} ${["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"][d.getMonth()]}`;
  return (
    <View style={[styles.entryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.entryIcon, { backgroundColor: colors.secondary }]}>
        <MaterialCommunityIcons name="leaf" size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.entryLabel, { color: colors.foreground }]}>
          {dateStr} — Gündəlik giriş
        </Text>
        <Text style={[styles.entrySubLabel, { color: colors.mutedForeground }]}>
          Nəqliyyat {item.transport.toFixed(1)} · Enerji {item.energy.toFixed(1)} · Qida {item.food.toFixed(1)} kq
        </Text>
      </View>
      <Text style={[styles.entryValue, { color: colors.primary }]}>
        {item.total.toFixed(1)} kq
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, userProfile, todayTip, monthlyTotal, treesEquivalent, getWeeklyData } =
    useApp();
  const fabScale = useRef(new Animated.Value(1)).current;

  const weeklyData = getWeeklyData();
  const maxWeekly = Math.max(...weeklyData.map((d) => d.value), 1);

  const progressPercent = Math.round((monthlyTotal / MONTHLY_TARGET_KG) * 100);
  const recentEntries = entries.slice(0, 5);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleFabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => router.push("/(tabs)/calculator"));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, "#4CAF50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: topPad + 16 }]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Salam, {userProfile.name}</Text>
              <Text style={styles.subGreeting}>Səviyyə {userProfile.level} · {userProfile.streak} gün ard.</Text>
            </View>
            <Pressable onPress={() => router.push("/notifications")} style={styles.notifBtn}>
              <Feather name="bell" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Circular Progress Card */}
          <View style={styles.progressCard}>
            <CircularProgress
              value={monthlyTotal}
              max={MONTHLY_TARGET_KG}
              size={160}
              strokeWidth={14}
              color="#FFFFFF"
              bgColor="rgba(255,255,255,0.25)"
              label={`${monthlyTotal.toFixed(0)}`}
              sublabel="kq CO₂"
              fontSize={32}
            />
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Bu Ay</Text>
              <Text style={styles.progressPct}>{progressPercent}%</Text>
              <Text style={styles.progressSub}>Hədəfdən: {MONTHLY_TARGET_KG} kq</Text>
              <View style={styles.treesRow}>
                <MaterialCommunityIcons name="tree" size={16} color="#A5D6A7" />
                <Text style={styles.treesText}>{treesEquivalent} ağac qənaəti</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* AI Tip */}
        <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.tipBadge, { backgroundColor: colors.secondary }]}>
            <MaterialCommunityIcons name="lightbulb-outline" size={14} color={colors.primary} />
            <Text style={[styles.tipBadgeText, { color: colors.primary }]}>Günün məsləhəti</Text>
          </View>
          <Text style={[styles.tipText, { color: colors.foreground }]}>{todayTip}</Text>
        </View>

        {/* Weekly Bar Chart */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Həftəlik Karbon İzi</Text>
          <View style={styles.barChart}>
            {weeklyData.map((d, i) => {
              const barH = maxWeekly > 0 ? (d.value / maxWeekly) * 60 : 4;
              return (
                <View key={i} style={styles.barItem}>
                  <View style={[styles.bar, { height: Math.max(barH, 4), backgroundColor: colors.primary }]} />
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Son Girişlər</Text>
          {entries.length > 0 && (
            <Pressable onPress={() => router.push("/(tabs)/calculator")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Hamısı</Text>
            </Pressable>
          )}
        </View>

        {recentEntries.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="leaf-circle-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Hələ giriş yoxdur</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              İlk karbon girişinizi əlavə edin
            </Text>
          </View>
        ) : (
          recentEntries.map((entry) => <EntryRow key={entry.id} item={entry} />)
        )}
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }], bottom: 90 + insets.bottom }]}>
        <Pressable onPress={handleFabPress} style={[styles.fabBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={26} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  subGreeting: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  notifBtn: { padding: 8 },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 20,
    padding: 20,
  },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  progressPct: { fontSize: 36, fontWeight: "800", color: "#FFFFFF", marginTop: 2 },
  progressSub: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  treesRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  treesText: { fontSize: 13, color: "#A5D6A7", fontWeight: "500" },
  tipCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  tipBadgeText: { fontSize: 12, fontWeight: "600" },
  tipText: { fontSize: 14, lineHeight: 21, fontWeight: "400" },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  barChart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 72 },
  barItem: { alignItems: "center", flex: 1, gap: 4 },
  bar: { width: "60%", borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, fontWeight: "500" },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  seeAll: { fontSize: 14, fontWeight: "600" },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  entryIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  entryLabel: { fontSize: 14, fontWeight: "600" },
  entrySubLabel: { fontSize: 12, marginTop: 2 },
  entryValue: { fontSize: 15, fontWeight: "700" },
  emptyState: {
    margin: 16,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center" },
  fab: { position: "absolute", right: 20 },
  fabBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },
});
