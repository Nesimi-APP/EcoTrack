import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useApp,
  entriesNeededForLevel,
  getLevel,
  totalEntriesForLevel,
} from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { api, type ApiLeaderboardEntry } from "@/lib/api";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const TOTAL_LEVELS = 100;

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
          {
            backgroundColor: badge.earned
              ? badge.color + "22"
              : colors.muted,
          },
        ]}
      >
        <Feather
          name={badge.icon as any}
          size={32}
          color={badge.earned ? badge.color : colors.mutedForeground}
        />
      </View>
      {badge.earned && (
        <View style={[styles.earnedBanner, { backgroundColor: badge.color }]}>
          <Feather name="check" size={11} color="#fff" />
          <Text style={styles.earnedBannerText}>Qazanıldı</Text>
        </View>
      )}
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
    </View>
  );
}

function LevelCell({
  level,
  currentLevel,
  entryCount,
  onPress,
}: {
  level: number;
  currentLevel: number;
  entryCount: number;
  onPress: (level: number) => void;
}) {
  const colors = useColors();
  const reached = level < currentLevel;
  const isCurrent = level === currentLevel;
  const locked = level > currentLevel;

  let bg: string;
  let textColor: string;
  let borderColor: string;

  if (isCurrent) {
    bg = colors.primary;
    textColor = "#fff";
    borderColor = colors.primary;
  } else if (reached) {
    const shade = Math.min(0.95, 0.3 + (level / TOTAL_LEVELS) * 0.65);
    bg = `rgba(45,122,79,${shade})`;
    textColor = "#fff";
    borderColor = "transparent";
  } else {
    bg = colors.secondary;
    textColor = colors.mutedForeground;
    borderColor = colors.border;
  }

  return (
    <Pressable
      onPress={() => onPress(level)}
      style={({ pressed }) => [
        styles.levelCell,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isCurrent ? 2 : 1,
          opacity: pressed ? 0.75 : 1,
          transform: [{ scale: isCurrent ? 1.08 : 1 }],
        },
      ]}
    >
      {isCurrent && (
        <MaterialCommunityIcons
          name="star"
          size={8}
          color="rgba(255,255,255,0.8)"
          style={{ marginBottom: 1 }}
        />
      )}
      <Text
        style={[
          styles.levelCellText,
          { color: textColor, fontWeight: isCurrent ? "800" : "600" },
        ]}
      >
        {level}
      </Text>
      {locked && level <= currentLevel + 3 && (
        <Feather
          name="lock"
          size={7}
          color={colors.mutedForeground}
          style={{ marginTop: 1 }}
        />
      )}
    </Pressable>
  );
}

function LevelDetailSheet({
  level,
  currentLevel,
  entryCount,
  onClose,
  visible,
}: {
  level: number | null;
  currentLevel: number;
  entryCount: number;
  onClose: () => void;
  visible: boolean;
}) {
  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const colors = useColors();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (level === null) return null;

  const reached = level < currentLevel;
  const isCurrent = level === currentLevel;
  const locked = level > currentLevel;

  const cumulativeToReach = totalEntriesForLevel(level);
  const neededThisLevel = entriesNeededForLevel(level);
  const cumulativeToNext = totalEntriesForLevel(level + 1);
  const progressInLevel = Math.max(0, entryCount - cumulativeToReach);
  const xpPct = isCurrent
    ? Math.min(100, (progressInLevel / neededThisLevel) * 100)
    : reached
    ? 100
    : 0;

  const statusColor = reached
    ? "#4CAF50"
    : isCurrent
    ? colors.primary
    : colors.mutedForeground;
  const statusLabel = reached
    ? "Tamamlandı ✓"
    : isCurrent
    ? "Cari Səviyyə"
    : "Kilidli";

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sheetOverlay} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, transform: [{ translateY: slideY }] },
        ]}
      >
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

        <View style={styles.sheetHeader}>
          <View>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
              Səviyyə {level}
            </Text>
            <Text style={[styles.sheetStatus, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          <Pressable onPress={onClose} style={[styles.sheetClose, { backgroundColor: colors.secondary }]}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={styles.sheetBody}>
          <View style={[styles.sheetRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.sheetIcon, { backgroundColor: "#E8F5E9" }]}>
              <MaterialCommunityIcons name="flag-checkered" size={18} color="#4CAF50" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetRowLabel, { color: colors.mutedForeground }]}>
                Bu səviyyəyə çatmaq üçün
              </Text>
              <Text style={[styles.sheetRowValue, { color: colors.foreground }]}>
                {cumulativeToReach === 0 ? "Başlanğıc səviyyəsi" : `${cumulativeToReach} ümumi giriş`}
              </Text>
            </View>
          </View>

          <View style={[styles.sheetRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.sheetIcon, { backgroundColor: "#FFF3E0" }]}>
              <MaterialCommunityIcons name="arrow-up-circle" size={18} color="#FF9800" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetRowLabel, { color: colors.mutedForeground }]}>
                Növbəti səviyyəyə keçmək üçün
              </Text>
              <Text style={[styles.sheetRowValue, { color: colors.foreground }]}>
                {level < TOTAL_LEVELS ? `${neededThisLevel} giriş lazımdır` : "Maksimum səviyyə!"}
              </Text>
            </View>
          </View>

          <View style={[styles.sheetRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.sheetIcon, { backgroundColor: "#E3F2FD" }]}>
              <MaterialCommunityIcons name="database" size={18} color="#2196F3" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetRowLabel, { color: colors.mutedForeground }]}>
                Səviyyə aralığı
              </Text>
              <Text style={[styles.sheetRowValue, { color: colors.foreground }]}>
                {cumulativeToReach} – {cumulativeToNext} giriş
              </Text>
            </View>
          </View>

          {(isCurrent || reached) && (
            <View style={styles.sheetProgressSection}>
              <View style={styles.sheetProgressHeader}>
                <Text style={[styles.sheetRowLabel, { color: colors.mutedForeground }]}>
                  Tərəqqi
                </Text>
                <Text style={[styles.sheetRowLabel, { color: colors.primary }]}>
                  {Math.round(xpPct)}%
                </Text>
              </View>
              <View style={[styles.sheetProgressTrack, { backgroundColor: colors.secondary }]}>
                <View
                  style={[
                    styles.sheetProgressFill,
                    {
                      width: `${xpPct}%` as any,
                      backgroundColor: statusColor,
                    },
                  ]}
                />
              </View>
              {isCurrent && (
                <Text style={[styles.sheetProgressHint, { color: colors.mutedForeground }]}>
                  {progressInLevel}/{neededThisLevel} giriş · {neededThisLevel - progressInLevel} qalıb
                </Text>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

function LeaderboardRow({
  item,
  index,
}: {
  item: ApiLeaderboardEntry;
  index: number;
}) {
  const colors = useColors();
  const medals = ["🥇", "🥈", "🥉"];
  const medal = index < 3 ? medals[index] : null;

  return (
    <View
      style={[
        styles.lbRow,
        {
          backgroundColor: item.isMe
            ? colors.primary + "18"
            : colors.background,
          borderColor: item.isMe ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={[styles.lbRank, { color: colors.mutedForeground }]}>
        {medal ?? `#${item.rank}`}
      </Text>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.lbName,
            {
              color: colors.foreground,
              fontWeight: item.isMe ? "800" : "600",
            },
          ]}
        >
          {item.name}
          {item.isMe ? "  (Siz)" : ""}
        </Text>
        <Text style={[styles.lbSub, { color: colors.mutedForeground }]}>
          {item.entryCount} giriş
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.lbCO2, { color: colors.foreground }]}>
          {item.totalCO2.toFixed(1)}
        </Text>
        <Text style={[styles.lbSub, { color: colors.mutedForeground }]}>
          kq CO₂
        </Text>
      </View>
    </View>
  );
}

export default function AchievementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, badges, entries, monthlyTotal, treesEquivalent } = useApp();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ApiLeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  const earned = badges.filter((b) => b.earned).length;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const currentLevel = userProfile.level;
  const entryCount = entries.length;

  const entriesForCurrentLevel = totalEntriesForLevel(currentLevel);
  const neededThisLevel = entriesNeededForLevel(currentLevel);
  const progressInLevel = Math.max(0, entryCount - entriesForCurrentLevel);
  const xpPercent = neededThisLevel > 0
    ? Math.min(100, (progressInLevel / neededThisLevel) * 100)
    : 100;
  const toNextLevel = neededThisLevel - progressInLevel;

  useEffect(() => {
    setLbLoading(true);
    api.leaderboard
      .get()
      .then(setLeaderboard)
      .catch(() => {})
      .finally(() => setLbLoading(false));
  }, [entryCount]);

  const openLevel = (level: number) => {
    setSelectedLevel(level);
    setSheetVisible(true);
  };

  const closeLevel = () => {
    setSheetVisible(false);
    setTimeout(() => setSelectedLevel(null), 250);
  };

  return (
    <>
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
              <Text style={styles.levelValue}>Səviyyə {currentLevel}</Text>
            </View>
            <View style={styles.streakBox}>
              <Feather name="zap" size={18} color="#FFD700" />
              <Text style={styles.streakNum}>{userProfile.streak}</Text>
              <Text style={styles.streakLabel}>Ardıcıl gün</Text>
            </View>
          </View>

          <View style={styles.xpTrack}>
            <View
              style={[
                styles.xpFill,
                { width: `${entryCount === 0 ? 0 : xpPercent}%` },
              ]}
            />
          </View>

          <View style={styles.nextLevelRow}>
            <Text style={styles.xpHint}>
              {progressInLevel}/{neededThisLevel} giriş tamamlandı
            </Text>
            {currentLevel < TOTAL_LEVELS ? (
              <View style={styles.nextLevelBadge}>
                <MaterialCommunityIcons name="arrow-up-circle" size={13} color="#A5D6A7" />
                <Text style={styles.nextLevelText}>
                  {toNextLevel} giriş daha → Səviyyə {currentLevel + 1}
                </Text>
              </View>
            ) : (
              <View style={styles.nextLevelBadge}>
                <MaterialCommunityIcons name="crown" size={13} color="#FFD700" />
                <Text style={styles.nextLevelText}>Maksimum səviyyə!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Eco Impact */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="tree" size={28} color="#4CAF50" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{treesEquivalent}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Ağac qənaəti</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="leaf" size={28} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{monthlyTotal.toFixed(0)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>kq CO₂ bu ay</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="trophy" size={28} color="#FF9800" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{earned}/{badges.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Nişan</Text>
          </View>
        </View>

        {/* Level Grid */}
        <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.gridHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Səviyyə Xəritəsi
            </Text>
            <Text style={[styles.gridSubtitle, { color: colors.mutedForeground }]}>
              Detallar üçün toxunun
            </Text>
          </View>

          <View style={styles.gridLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Cari</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "rgba(45,122,79,0.6)" }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Tamamlandı</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Kilidli</Text>
            </View>
          </View>

          <View style={styles.levelGrid}>
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((lvl) => (
              <LevelCell
                key={lvl}
                level={lvl}
                currentLevel={currentLevel}
                entryCount={entryCount}
                onPress={openLevel}
              />
            ))}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.gridHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Karbon Sıralaması
            </Text>
            <MaterialCommunityIcons name="podium" size={18} color="#FF9800" />
          </View>
          <Text style={[styles.lbDesc, { color: colors.mutedForeground }]}>
            Aşağı CO₂ = daha yaxşı sıralama
          </Text>

          {lbLoading ? (
            <Text style={[styles.lbEmpty, { color: colors.mutedForeground }]}>
              Yüklənir...
            </Text>
          ) : leaderboard.length === 0 ? (
            <Text style={[styles.lbEmpty, { color: colors.mutedForeground }]}>
              Hələ heç bir istifadəçi yoxdur
            </Text>
          ) : (
            leaderboard.map((item, i) => (
              <LeaderboardRow key={i} item={item} index={i} />
            ))
          )}
        </View>

        {/* Badges */}
        <View>
          <View style={[styles.gridHeader, { marginBottom: 10 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Nişanlar
            </Text>
            <Text style={[styles.gridSubtitle, { color: colors.mutedForeground }]}>
              {earned}/{badges.length} qazanıldı
            </Text>
          </View>
          <View style={styles.badgeGrid}>
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </View>
        </View>
      </ScrollView>

      <LevelDetailSheet
        level={selectedLevel}
        currentLevel={currentLevel}
        entryCount={entryCount}
        onClose={closeLevel}
        visible={sheetVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },

  levelCard: { borderRadius: 20, padding: 20, gap: 12 },
  levelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  levelValue: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", marginTop: 2 },
  streakBox: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 12,
    borderRadius: 14,
  },
  streakNum: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  streakLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
  xpTrack: { height: 10, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 5, overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 5 },
  nextLevelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  xpHint: { color: "rgba(255,255,255,0.65)", fontSize: 12 },
  nextLevelBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 12,
  },
  nextLevelText: { color: "#A5D6A7", fontSize: 12, fontWeight: "600" },

  statsRow: { flexDirection: "row", gap: 10 },
  statBox: { flex: 1, alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 6 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },

  gridCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  gridHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  gridSubtitle: { fontSize: 12 },

  gridLegend: { flexDirection: "row", gap: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11 },

  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  levelCell: {
    width: "8.8%",
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  levelCellText: { fontSize: 9 },

  lbDesc: { fontSize: 12, marginTop: -4 },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  lbRank: { fontSize: 16, fontWeight: "700", width: 32, textAlign: "center" },
  lbName: { fontSize: 14 },
  lbSub: { fontSize: 11, marginTop: 2 },
  lbCO2: { fontSize: 16, fontWeight: "800" },
  lbEmpty: { fontSize: 14, textAlign: "center", paddingVertical: 16 },

  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badgeCard: {
    width: "47%",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    gap: 8,
    alignItems: "center",
    overflow: "hidden",
  },
  badgeIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  earnedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  earnedBannerText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  badgeName: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  badgeDesc: { fontSize: 12, textAlign: "center", lineHeight: 18 },

  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetTitle: { fontSize: 22, fontWeight: "800" },
  sheetStatus: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBody: { paddingHorizontal: 20, gap: 0 },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetRowLabel: { fontSize: 12, marginBottom: 2 },
  sheetRowValue: { fontSize: 15, fontWeight: "700" },
  sheetProgressSection: { paddingTop: 16, gap: 8 },
  sheetProgressHeader: { flexDirection: "row", justifyContent: "space-between" },
  sheetProgressTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  sheetProgressFill: { height: "100%", borderRadius: 5 },
  sheetProgressHint: { fontSize: 12 },
});
