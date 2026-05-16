import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
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
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { Language, LANGUAGE_NAMES } from "@/i18n/translations";

function SettingRow({
  icon,
  label,
  sublabel,
  onPress,
  right,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { borderBottomColor: colors.border, opacity: pressed && onPress ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        {sublabel && (
          <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>
            {sublabel}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
}

const LANGUAGES: Language[] = ["az", "en", "tr"];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, entries, badges, monthlyTotal, treesEquivalent } = useApp();
  const { isDark, toggleDark } = useTheme();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const earned = badges.filter((b) => b.earned).length;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const displayName = user?.name ?? userProfile.name;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <>
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
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileLevel}>
            {t.achievements.level} {userProfile.level} · EcoTracker
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{entries.length}</Text>
              <Text style={styles.statLbl}>{t.profile.entries}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{userProfile.streak}</Text>
              <Text style={styles.statLbl}>{t.profile.streak}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{earned}</Text>
              <Text style={styles.statLbl}>{t.profile.badges}</Text>
            </View>
          </View>
        </View>

        {/* Eco Impact */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t.profile.ecoImpact}
          </Text>
          <View style={styles.impactRow}>
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="tree" size={32} color="#4CAF50" />
              <Text style={[styles.impactVal, { color: colors.foreground }]}>
                {treesEquivalent}
              </Text>
              <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>
                {t.profile.treesSaved}
              </Text>
            </View>
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="molecule-co2" size={32} color={colors.primary} />
              <Text style={[styles.impactVal, { color: colors.foreground }]}>
                {monthlyTotal.toFixed(1)}
              </Text>
              <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>
                {t.profile.co2ThisMonth}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t.profile.settings}
          </Text>
          <SettingRow
            icon="moon"
            label={t.profile.darkMode}
            sublabel={isDark ? t.profile.active : t.profile.inactive}
            right={
              <Switch
                value={isDark}
                onValueChange={() => toggleDark()}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDark ? "#FFFFFF" : colors.mutedForeground}
              />
            }
          />
          <SettingRow
            icon="globe"
            label={t.profile.language}
            sublabel={LANGUAGE_NAMES[language]}
            onPress={() => setLangModalVisible(true)}
            right={
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            }
          />
          <SettingRow
            icon="bell"
            label={t.profile.notifications}
            sublabel={t.profile.reminders}
            onPress={() => router.push("/notifications")}
            right={
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            }
          />
          <SettingRow
            icon="book-open"
            label={t.profile.wiki}
            onPress={() => router.push("/wiki")}
            right={
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            }
          />
          <SettingRow
            icon="list"
            label={t.profile.allEntries}
            onPress={() => router.push("/entries")}
            right={
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            }
          />
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t.profile.about}
          </Text>
          {user && (
            <View style={styles.aboutRow}>
              <Feather name="mail" size={16} color={colors.mutedForeground} />
              <Text style={[styles.aboutText, { color: colors.mutedForeground, fontSize: 13 }]}>
                {user.email}
              </Text>
            </View>
          )}
          <View style={styles.aboutRow}>
            <MaterialCommunityIcons name="leaf" size={20} color={colors.primary} />
            <Text style={[styles.aboutText, { color: colors.foreground }]}>
              EcoTrack v1.0
            </Text>
          </View>
          <Text style={[styles.aboutDesc, { color: colors.mutedForeground }]}>
            {t.profile.appDesc}
          </Text>
        </View>

        {/* Logout */}
        <Pressable
          style={[styles.logoutBtn, { borderColor: "#EF5350" }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color="#EF5350" />
          <Text style={styles.logoutText}>{t.profile.logout}</Text>
        </Pressable>
      </ScrollView>

      {/* Language picker modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {t.profile.language}
            </Text>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                onPress={async () => {
                  await setLanguage(lang);
                  setLangModalVisible(false);
                }}
                style={[
                  styles.langOption,
                  {
                    backgroundColor: language === lang ? colors.primary + "18" : "transparent",
                    borderColor: language === lang ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.langName, { color: colors.foreground, fontWeight: language === lang ? "700" : "500" }]}>
                  {LANGUAGE_NAMES[lang]}
                </Text>
                {language === lang && (
                  <Feather name="check" size={18} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 15, fontWeight: "500" },
  settingSub: { fontSize: 12, marginTop: 1 },
  impactRow: { flexDirection: "row" },
  impactItem: { flex: 1, alignItems: "center", gap: 4 },
  impactVal: { fontSize: 24, fontWeight: "800" },
  impactLabel: { fontSize: 12, textAlign: "center" },
  aboutRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  aboutText: { fontSize: 15, fontWeight: "600" },
  aboutDesc: { fontSize: 13, lineHeight: 20 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 4,
  },
  logoutText: { color: "#EF5350", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  langName: { fontSize: 16 },
});
