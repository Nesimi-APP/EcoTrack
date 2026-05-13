import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const NOTIFICATIONS = [
  {
    id: "1",
    type: "reminder",
    title: "Karbon girişi xatırlatması",
    body: "Bu gün karbon kalkulyatorunu yeniləməmisiniz!",
    time: "2 saat əvvəl",
    icon: "leaf",
    color: "#4CAF50",
  },
  {
    id: "2",
    type: "achievement",
    title: "Təbrikler!",
    body: "Bu həftə karbon izinizi 10% azaltdınız.",
    time: "1 gün əvvəl",
    icon: "trophy",
    color: "#FFD700",
  },
  {
    id: "3",
    type: "ewaste",
    title: "Yeni toplama məntəqəsi",
    body: "Yaxınlığınızda yeni bir e-tullantı toplama məntəqəsi açıldı.",
    time: "3 gün əvvəl",
    icon: "recycle",
    color: "#2196F3",
  },
  {
    id: "4",
    type: "tip",
    title: "Günün məsləhəti",
    body: "Velosiped sürərək işə getmək gündə 4.6 kq CO₂ azaldır.",
    time: "4 gün əvvəl",
    icon: "lightbulb-on",
    color: "#FF9800",
  },
  {
    id: "5",
    type: "reminder",
    title: "Həftəlik hesabat",
    body: "Bu həftəki karbon iziniz: 12.4 kq CO₂. Hədəfinizin 60%-ni qənaət etdiniz.",
    time: "1 həftə əvvəl",
    icon: "chart-line",
    color: "#9C27B0",
  },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {NOTIFICATIONS.map((notif) => (
        <View
          key={notif.id}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: notif.color + "20" }]}>
            <MaterialCommunityIcons name={notif.icon as any} size={22} color={notif.color} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>{notif.title}</Text>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>{notif.body}</Text>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>{notif.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700" },
  body: { fontSize: 13, lineHeight: 19 },
  time: { fontSize: 11, marginTop: 2 },
});
