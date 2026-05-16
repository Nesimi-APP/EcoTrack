import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useColors } from "@/hooks/useColors";

const NOTIF_META = [
  { id: "1", type: "reminder", icon: "leaf", color: "#4CAF50" },
  { id: "2", type: "achievement", icon: "trophy", color: "#FFD700" },
  { id: "3", type: "ewaste", icon: "recycle", color: "#2196F3" },
  { id: "4", type: "tip", icon: "lightbulb-on", color: "#FF9800" },
  { id: "5", type: "reminder", icon: "chart-line", color: "#9C27B0" },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = NOTIF_META.filter((n) => !dismissed.includes(n.id));

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDismissed((prev) => [...prev, id]);
  };

  const handleClearAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setDismissed(NOTIF_META.map((n) => n.id));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {visible.length > 0 && (
        <Pressable
          onPress={handleClearAll}
          style={({ pressed }) => [
            styles.clearAll,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="trash-2" size={14} color={colors.destructive} />
          <Text style={[styles.clearAllText, { color: colors.destructive }]}>
            {t.notifications.clearAll}
          </Text>
        </Pressable>
      )}

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={52}
            color={colors.mutedForeground}
          />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {t.notifications.empty}
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {t.notifications.emptyDesc}
          </Text>
        </View>
      ) : (
        visible.map((notif) => {
          const item = t.notifications.items[parseInt(notif.id) - 1];
          return (
            <View
              key={notif.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: notif.color + "20" }]}>
                <MaterialCommunityIcons
                  name={notif.icon as any}
                  size={22}
                  color={notif.color}
                />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                <Text style={[styles.body, { color: colors.mutedForeground }]}>
                  {item.body}
                </Text>
                <Text style={[styles.time, { color: colors.mutedForeground }]}>
                  {item.time}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDelete(notif.id)}
                hitSlop={10}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
              >
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  clearAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  clearAllText: { fontSize: 13, fontWeight: "600" },
  empty: { marginTop: 80, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "700" },
  body: { fontSize: 13, lineHeight: 19 },
  time: { fontSize: 11, marginTop: 2 },
});
