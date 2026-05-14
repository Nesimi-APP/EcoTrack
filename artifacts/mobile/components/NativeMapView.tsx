import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { WASTE_CATEGORIES, WASTE_COLLECTION_POINTS } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";

export default function NativeMapView() {
  const colors = useColors();
  const [filter, setFilter] = useState("Hamısı");

  const filtered =
    filter === "Hamısı"
      ? WASTE_COLLECTION_POINTS
      : WASTE_COLLECTION_POINTS.filter((p) => p.types.includes(filter));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Filter chips — same system as native map */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipBar, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.chipScroll}
      >
        {WASTE_CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setFilter(cat)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  filter === cat ? colors.primary : colors.card,
                borderColor:
                  filter === cat ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: filter === cat ? "#FFFFFF" : colors.foreground },
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={48}
            color={colors.primary}
          />
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            E-Tullantı Məntəqələri
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            {filtered.length} məntəqə tapıldı
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="map-marker-off-outline"
              size={40}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Bu kateqoriyada məntəqə yoxdur
            </Text>
          </View>
        ) : (
          filtered.map((p) => (
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
                        styles.typeChip,
                        { backgroundColor: colors.secondary },
                      ]}
                    >
                      <Text
                        style={[styles.typeChipText, { color: colors.primary }]}
                      >
                        {t}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chipBar: { flexGrow: 0, borderBottomWidth: 1 },
  chipScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  list: { padding: 16, gap: 10 },
  hero: { alignItems: "center", gap: 6, paddingVertical: 12 },
  heroTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  heroSub: { fontSize: 13 },
  empty: { alignItems: "center", gap: 8, paddingVertical: 32 },
  emptyText: { fontSize: 14, textAlign: "center" },
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
  typeChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeChipText: { fontSize: 11, fontWeight: "600" },
});
