import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WASTE_CATEGORIES, WASTE_COLLECTION_POINTS } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";

type Point = (typeof WASTE_COLLECTION_POINTS)[0];

const WORLD_REGION: Region = {
  latitude: 20,
  longitude: 15,
  latitudeDelta: 130,
  longitudeDelta: 130,
};

export default function NativeMapView() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("Hamısı");
  const [selected, setSelected] = useState<Point | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const filtered =
    filter === "Hamısı"
      ? WASTE_COLLECTION_POINTS
      : WASTE_COLLECTION_POINTS.filter((p) => p.types.includes(filter));

  const selectPoint = (point: Point) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(point);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
    }).start();
  };

  const closePanel = () => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start(
      () => setSelected(null),
    );
  };

  const openMaps = () => {
    if (!selected) return;
    const url =
      Platform.OS === "ios"
        ? `maps:?q=${encodeURIComponent(selected.name)}&ll=${selected.lat},${selected.lng}`
        : `geo:${selected.lat},${selected.lng}?q=${encodeURIComponent(selected.name)}`;
    Linking.openURL(url);
  };

  const panelTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [320, 0],
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Category filter chips */}
      <View style={[styles.filterBar, { top: insets.top + 8 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {WASTE_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filter === cat ? colors.primary : colors.card,
                  borderColor: filter === cat ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === cat ? "#FFFFFF" : colors.foreground },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Point count badge */}
        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="map-marker" size={12} color="#FFFFFF" />
          <Text style={styles.countText}>{filtered.length} məntəqə</Text>
        </View>
      </View>

      <MapView
        style={styles.map}
        initialRegion={WORLD_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {filtered.map((point) => {
          return (
            <Marker
              key={point.id}
              coordinate={{ latitude: point.lat, longitude: point.lng }}
              onPress={() => selectPoint(point)}
            >
              <View
                style={[
                  styles.markerContainer,
                  { backgroundColor: colors.primary },
                ]}
              >
                <MaterialCommunityIcons
                  name="recycle"
                  size={14}
                  color="#FFFFFF"
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Detail panel */}
      {selected && (
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: panelTranslate }],
            },
          ]}
        >
          <View style={styles.panelHandle} />
          <Pressable onPress={closePanel} style={styles.closeBtn}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>

          <Text style={[styles.panelTitle, { color: colors.foreground }]}>
            {selected.name}
          </Text>
          <View style={styles.panelRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.panelText, { color: colors.mutedForeground }]}>
              {selected.address}
            </Text>
          </View>
          <View style={styles.panelRow}>
            <Feather name="clock" size={14} color={colors.mutedForeground} />
            <Text style={[styles.panelText, { color: colors.mutedForeground }]}>
              {selected.hours}
            </Text>
          </View>

          <View style={styles.typeChips}>
            {selected.types.map((t) => (
              <View
                key={t}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: colors.primary + "1A", // 10% şəffaflıq ilə primary rəngi
                  },
                ]}
              >
                <Text style={[styles.typeChipText, { color: colors.primary }]}>
                  {t}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={openMaps}
            style={[styles.directBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="navigation" size={16} color="#FFFFFF" />
            <Text style={styles.directBtnText}>Yol Tarifini Al</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 1 },
  filterBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    gap: 6,
  },
  filterScroll: { paddingHorizontal: 12, gap: 8, paddingVertical: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  markerContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    gap: 10,
  },
  panelHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C8E6C9",
    alignSelf: "center",
    marginBottom: 4,
  },
  closeBtn: { position: "absolute", top: 16, right: 16, padding: 4 },
  panelTitle: { fontSize: 17, fontWeight: "700", paddingRight: 28 },
  panelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  panelText: { fontSize: 13, flex: 1 },
  typeChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  typeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  typeChipText: { fontSize: 12, fontWeight: "600" },
  directBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  directBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
