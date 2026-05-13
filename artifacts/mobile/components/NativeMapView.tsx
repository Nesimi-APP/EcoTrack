import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { WASTE_COLLECTION_POINTS } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";

export default function NativeMapView() {
  const colors = useColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.hero}>
        <MaterialCommunityIcons
          name="map-marker-radius"
          size={52}
          color={colors.primary}
        />
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          E-Tullantı Məntəqələri
        </Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
          Bakıdakı toplama məntəqələri:
        </Text>
      </View>

      <View style={styles.list}>
        {WASTE_COLLECTION_POINTS.map((p) => (
          <View
            key={p.id}
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.secondary },
              ]}
            >
              <MaterialCommunityIcons
                name="recycle"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>
                {p.name}
              </Text>
              <Text style={[styles.addr, { color: colors.mutedForeground }]}>
                {p.address}
              </Text>
              <Text style={[styles.hours, { color: colors.mutedForeground }]}>
                {p.hours}
              </Text>
              <View style={styles.chips}>
                {p.types.map((t) => (
                  <View
                    key={t}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.secondary },
                    ]}
                  >
                    <Text
                      style={[styles.chipText, { color: colors.primary }]}
                    >
                      {t}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, paddingBottom: 32 },
  hero: { alignItems: "center", gap: 8, paddingVertical: 16 },
  heroTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  heroSub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  list: { gap: 10 },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 14, fontWeight: "700" },
  addr: { fontSize: 12 },
  hours: { fontSize: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  chipText: { fontSize: 11, fontWeight: "600" },
});
