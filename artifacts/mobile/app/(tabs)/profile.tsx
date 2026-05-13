import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";

function SettingRow({
  icon,
  label,
  sublabel,
  right,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  right: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
        {sublabel && <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>{sublabel}</Text>}
      </View>
      {right}
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, entries, badges, monthlyTotal, treesEquivalent, darkMode, toggleDarkMode } = useApp();
  const earned = badges.filter((b) => b.earned).length;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const initials = userProfile.name.slice(0, 2).toUpperCase();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{userProfile.name}</Text>
        <Text style={styles.profileLevel}>Səviyyə {userProfile.level} · EcoTracker</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{entries.length}</Text>
            <Text style={styles.statLbl}>Giriş</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{userProfile.streak}</Text>
            <Text style={styles.statLbl}>Ardıcıl gün</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{earned}</Text>
            <Text style={styles.statLbl}>Nişan</Text>
          </View>
        </View>
      </View>

      {/* Eco Impact */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ekotəsir</Text>
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <MaterialCommunityIcons name="tree" size={32} color="#4CAF50" />
            <Text style={[styles.impactVal, { color: colors.foreground }]}>{treesEquivalent}</Text>
            <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>Ağac qənaəti</Text>
          </View>
          <View style={styles.impactItem}>
            <MaterialCommunityIcons name="molecule-co2" size={32} color={colors.primary} />
            <Text style={[styles.impactVal, { color: colors.foreground }]}>{monthlyTotal.toFixed(1)}</Text>
            <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>kq CO₂ bu ay</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Parametrlər</Text>
        <SettingRow
          icon="moon"
          label="Gecə rejimi"
          sublabel="Tünd tema"
          right={
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={darkMode ? "#FFFFFF" : colors.mutedForeground}
            />
          }
        />
        <SettingRow
          icon="bell"
          label="Bildirişlər"
          sublabel="Xatırlatmalar"
          right={<Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
        />
        <SettingRow
          icon="book-open"
          label="Eko-Vikipediya"
          right={
            <Pressable onPress={() => router.push("/wiki")}>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          }
        />
      </View>

      {/* About */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Haqqında</Text>
        <View style={styles.aboutRow}>
          <MaterialCommunityIcons name="leaf" size={20} color={colors.primary} />
          <Text style={[styles.aboutText, { color: colors.foreground }]}>EcoTrack v1.0</Text>
        </View>
        <Text style={[styles.aboutDesc, { color: colors.mutedForeground }]}>
          Karbon izi izləmə və e-tullantı idarəetmə sistemi. IPCC standartlarına əsaslanan hesablama metodologiyası.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, padding: 16 },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  profileName: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  profileLevel: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 14,
    padding: 12,
    width: "100%",
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  statLbl: { color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 4 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 15, fontWeight: "500" },
  settingSub: { fontSize: 12, marginTop: 1 },
  impactRow: { flexDirection: "row" },
  impactItem: { flex: 1, alignItems: "center", gap: 4 },
  impactVal: { fontSize: 24, fontWeight: "800" },
  impactLabel: { fontSize: 12, textAlign: "center" },
  aboutRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  aboutText: { fontSize: 15, fontWeight: "600" },
  aboutDesc: { fontSize: 13, lineHeight: 20 },
});
