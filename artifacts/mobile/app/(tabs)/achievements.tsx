import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function BadgeCard({
  badge,
}: {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    earned: boolean;
  };
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.badgeCard,
        {
          backgroundColor: badge.earned ? colors.card : colors.secondary,
          borderColor: badge.earned ? badge.color : colors.border,
          opacity: badge.earned ? 1 : 0.55,
        },
      ]}
    >
      <View
        style={[
          styles.badgeIconCircle,
          { backgroundColor: badge.earned ? badge.color + "22" : colors.muted },
        ]}
      >
        <Feather
          name={badge.icon as any}
          size={26}
          color={badge.earned ? badge.color : colors.mutedForeground}
        />
      </View>
      <Text
        style={[
          styles.badgeName,
          { color: badge.earned ? colors.foreground : colors.mutedForeground },
        ]}
      >
        {badge.name}
      </Text>
      <Text style={[styles.badgeDesc, { color: colors.mutedForeground }]}>
        {badge.description}
      </Text>
      {badge.earned && (
        <View style={[styles.earnedDot, { backgroundColor: badge.color }]} />
      )}
    </View>
  );
}

export default function AchievementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    userProfile,
    badges,
    entries,
    monthlyTotal,
    treesEquivalent,
    getWeeklyData,
  } = useApp();

  const earned = badges.filter((b) => b.earned).length;
  const weeklyData = getWeeklyData();
  const maxWeekly = Math.max(...weeklyData.map((d) => d.value), 1);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Next level progress
  const progressInLevel = entries.length % 5;
  const toNextLevel = progressInLevel === 0 && entries.length > 0 ? 5 : 5 - progressInLevel;
  const xpPercent = (progressInLevel / 5) * 100;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: bottomPad + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Level Card */}
      <View style={[styles.levelCard, { backgroundColor: colors.primary }]}>
        <View style={styles.levelRow}>
          <View>
            <Text style={styles.levelLabel}>Cari Səviyyə</Text>
            <Text style={styles.levelValue}>Səviyyə {userProfile.level}</Text>
          </View>
          <View style={styles.streakBox}>
            <Feather name="zap" size={18} color="#FFD700" />
            <Text style={styles.streakNum}>{userProfile.streak}</Text>
            <Text style={styles.streakLabel}>Ardıcıl gün</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpTrack}>
          <View
            style={[
              styles.xpFill,
              { width: `${entries.length === 0 ? 0 : xpPercent}%` },
            ]}
          />
        </View>

        {/* Next level hint */}
        <View style={styles.nextLevelRow}>
          <Text style={styles.xpHint}>
            {progressInLevel}/{5} giriş tamamlandı
          </Text>
          <View style={styles.nextLevelBadge}>
            <MaterialCommunityIcons name="arrow-up-circle" size={13} color="#A5D6A7" />
            <Text style={styles.nextLevelText}>
              {toNextLevel} giriş daha → Səviyyə {userProfile.level + 1}
            </Text>
          </View>
        </View>
      </View>

      {/* Eco Impact */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <MaterialCommunityIcons name="tree" size={28} color="#4CAF50" />
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {treesEquivalent}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Ağac qənaəti
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <MaterialCommunityIcons name="leaf" size={28} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {monthlyTotal.toFixed(0)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            kq CO₂ bu ay
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <MaterialCommunityIcons name="trophy" size={28} color="#FF9800" />
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {earned}/{badges.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Nişan
          </Text>
        </View>
      </View>

      {/* Weekly Progress */}
      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Həftəlik Karbon İzi
        </Text>
        <View style={styles.barChart}>
          {weeklyData.map((d, i) => {
            const barH = maxWeekly > 0 ? (d.value / maxWeekly) * 80 : 4;
            return (
              <View key={i} style={styles.barItem}>
                <Text style={[styles.barVal, { color: colors.mutedForeground }]}>
                  {d.value > 0 ? d.value.toFixed(0) : ""}
                </Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barH, 4),
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
                <Text
                  style={[styles.barLabel, { color: colors.mutedForeground }]}
                >
                  {d.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Badges */}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.foreground, paddingHorizontal: 2, marginBottom: 8 },
        ]}
      >
        Nişanlar
      </Text>
      <View style={styles.badgeGrid}>
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  levelCard: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  levelValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  streakBox: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 12,
    borderRadius: 14,
  },
  streakNum: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  streakLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
  xpTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 4 },
  nextLevelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpHint: { color: "rgba(255,255,255,0.65)", fontSize: 12 },
  nextLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nextLevelText: { color: "#A5D6A7", fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 100,
  },
  barItem: { alignItems: "center", flex: 1, gap: 4 },
  barVal: { fontSize: 9 },
  bar: { width: "55%", borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, fontWeight: "500" },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    gap: 6,
    alignItems: "center",
    position: "relative",
  },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeName: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  badgeDesc: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  earnedDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
