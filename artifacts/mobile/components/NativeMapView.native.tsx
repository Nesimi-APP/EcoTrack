import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
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

const { height: SCREEN_H } = Dimensions.get("window");

// Sheet occupies 68% of screen height
const SHEET_HEIGHT = SCREEN_H * 0.68;
// How much peeks above the bottom when collapsed
const PEEK_HEIGHT = 220;

// translateY snap points
const POS_HIDDEN = SHEET_HEIGHT;          // fully off-screen
const POS_COLLAPSED = SHEET_HEIGHT - PEEK_HEIGHT; // peeking
const POS_EXPANDED = 0;                   // fully open

const SHEET_BG = "#162F22";
const HANDLE_COLOR = "rgba(255,255,255,0.25)";
const CHIP_BG = "rgba(255,255,255,0.12)";
const MUTED = "rgba(255,255,255,0.55)";

export default function NativeMapView() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("Hamısı");
  const [selected, setSelected] = useState<Point | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Single animated value controls the sheet's vertical position
  const sheetY = useRef(new Animated.Value(POS_HIDDEN)).current;
  // Track last settled position so we can base drag from it
  const baseY = useRef(POS_HIDDEN);

  const filtered =
    filter === "Hamısı"
      ? WASTE_COLLECTION_POINTS
      : WASTE_COLLECTION_POINTS.filter((p) => p.types.includes(filter));

  function snapTo(pos: number, onDone?: () => void) {
    baseY.current = pos;
    Animated.spring(sheetY, {
      toValue: pos,
      useNativeDriver: true,
      tension: 72,
      friction: 11,
    }).start(onDone);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        // Set offset so drag is relative to current position
        sheetY.setOffset(baseY.current);
        sheetY.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        const next = g.dy;
        const min = POS_EXPANDED - baseY.current;
        const max = POS_COLLAPSED - baseY.current;
        sheetY.setValue(Math.max(min, Math.min(max, next)));
      },
      onPanResponderRelease: (_, g) => {
        sheetY.flattenOffset();
        const current = baseY.current + g.dy;
        const mid = (POS_COLLAPSED + POS_EXPANDED) / 2;

        if (g.vy < -0.5 || current < mid) {
          // snap open
          setIsExpanded(true);
          snapTo(POS_EXPANDED);
        } else {
          // snap collapsed
          setIsExpanded(false);
          snapTo(POS_COLLAPSED);
        }
      },
    })
  ).current;

  const selectPoint = (point: Point) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(point);
    setIsExpanded(false);
    // Start from hidden and spring into collapsed
    sheetY.setValue(POS_HIDDEN);
    snapTo(POS_COLLAPSED);
  };

  const closePanel = () => {
    setIsExpanded(false);
    snapTo(POS_HIDDEN, () => setSelected(null));
  };

  const openMaps = () => {
    if (!selected) return;
    const url =
      Platform.OS === "ios"
        ? `maps:?q=${encodeURIComponent(selected.name)}&ll=${selected.lat},${selected.lng}`
        : `geo:${selected.lat},${selected.lng}?q=${encodeURIComponent(selected.name)}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.root}>
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
                  borderColor:
                    filter === cat ? colors.primary : colors.border,
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
        {filtered.map((point) => (
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
        ))}
      </MapView>

      {/* ── Draggable bottom sheet ── */}
      {selected && (
        <Animated.View
          style={[
            styles.sheet,
            {
              height: SHEET_HEIGHT,
              transform: [{ translateY: sheetY }],
            },
          ]}
        >
          {/* Drag handle — pan responder lives here */}
          <View {...panResponder.panHandlers} style={styles.handleZone}>
            <View style={[styles.handle, { backgroundColor: HANDLE_COLOR }]} />
          </View>

          {/* Close button */}
          <Pressable onPress={closePanel} style={styles.closeBtn} hitSlop={10}>
            <Feather name="x" size={20} color={MUTED} />
          </Pressable>

          {/* Scrollable content — only scrolls when expanded */}
          <ScrollView
            scrollEnabled={isExpanded}
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <Text style={styles.title}>{selected.name}</Text>

            <View style={styles.infoRow}>
              <Feather name="map-pin" size={14} color={MUTED} />
              <Text style={styles.infoText}>{selected.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="clock" size={14} color={MUTED} />
              <Text style={styles.infoText}>{selected.hours}</Text>
            </View>

            {/* Category chips */}
            <View style={styles.chips}>
              {selected.types.map((t) => (
                <View key={t} style={styles.chip}>
                  <Text style={styles.chipText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Expanded-only detail section */}
            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Haqqında</Text>
            <Text style={styles.bodyText}>
              Bu məntəqədə zərərli tullantılar, elektrik cihazları və emal üçün
              uyğun materiallar qəbul edilir. Zəhmət olmasa tullantıları
              kateqoriyalara görə ayırılmış qablara atın.
            </Text>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
              Əlaqə
            </Text>
            <View style={styles.infoRow}>
              <Feather name="phone" size={14} color={MUTED} />
              <Text style={styles.infoText}>+994 12 000 00 00</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="globe" size={14} color={MUTED} />
              <Text style={styles.infoText}>ecotrack.az</Text>
            </View>

            {/* Directions button */}
            <Pressable
              onPress={openMaps}
              style={[
                styles.directBtn,
                { backgroundColor: colors.primary, marginTop: 20 },
              ]}
            >
              <Feather name="navigation" size={16} color="#FFFFFF" />
              <Text style={styles.directBtnText}>Yol Tarifini Al</Text>
            </Pressable>
          </ScrollView>

          {/* Hint shown only when collapsed */}
          {!isExpanded && (
            <View style={styles.expandHint} pointerEvents="none">
              <Feather name="chevron-up" size={16} color={MUTED} />
              <Text style={styles.expandHintText}>
                Daha çox görmək üçün yuxarı çəkin
              </Text>
            </View>
          )}
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
    shadowOpacity: 0.12,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // ── Bottom sheet ──
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden",
  },
  handleZone: {
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 10,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 18,
    padding: 4,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    paddingRight: 30,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: MUTED,
    flex: 1,
    lineHeight: 18,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    backgroundColor: CHIP_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.70)",
    lineHeight: 20,
  },
  directBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
    borderRadius: 16,
  },
  directBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  expandHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingBottom: 10,
  },
  expandHintText: {
    color: MUTED,
    fontSize: 11,
  },
});
