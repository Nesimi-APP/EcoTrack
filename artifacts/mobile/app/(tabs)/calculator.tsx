import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { CARBON_FACTORS } from "@/data/ecoData";
import { useColors } from "@/hooks/useColors";

type TabKey = "transport" | "energy" | "food";
type VehicleKey = keyof typeof CARBON_FACTORS.transport;
type FoodKey = keyof typeof CARBON_FACTORS.food;

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "transport", label: "Nəqliyyat", icon: "car" },
  { key: "energy", label: "Enerji", icon: "lightning-bolt" },
  { key: "food", label: "Qida", icon: "food-apple" },
];

const VEHICLES: { key: VehicleKey; label: string; icon: string }[] = [
  { key: "car_petrol", label: "Benzin", icon: "car" },
  { key: "car_electric", label: "Elektrik", icon: "car-electric" },
  { key: "bus", label: "Avtobus", icon: "bus" },
  { key: "metro", label: "Metro", icon: "subway" },
  { key: "motorcycle", label: "Moto", icon: "motorbike" },
];

const FOODS: { key: FoodKey; label: string; icon: string }[] = [
  { key: "beef", label: "Mal əti", icon: "cow" },
  { key: "lamb", label: "Quzu əti", icon: "sheep" },
  { key: "pork", label: "Donuz əti", icon: "pig" },
  { key: "chicken", label: "Toyuq", icon: "food-drumstick" },
  { key: "fish", label: "Balıq", icon: "fish" },
  { key: "vegan", label: "Vegan", icon: "sprout" },
];

function AnimatedCO2({ value, color }: { value: number; color: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSpring(1.08, {}, () => {
      scale.value = withSpring(1);
    });
  }, [value]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.Text style={[styles.co2Value, { color }, style]}>
      {value.toFixed(2)}
    </Animated.Text>
  );
}

export default function CalculatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEntry } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>("transport");
  const [distance, setDistance] = useState("");
  const [vehicle, setVehicle] = useState<VehicleKey>("car_petrol");
  const [electricity, setElectricity] = useState("");
  const [gas, setGas] = useState("");
  const [foodType, setFoodType] = useState<FoodKey>("chicken");
  const [meals, setMeals] = useState("1");
  const [saved, setSaved] = useState(false);

  const transportCO2 =
    (parseFloat(distance) || 0) * CARBON_FACTORS.transport[vehicle];
  const energyCO2 =
    (parseFloat(electricity) || 0) * CARBON_FACTORS.energy.electricity_per_kwh +
    (parseFloat(gas) || 0) * CARBON_FACTORS.energy.gas_per_m3;
  const foodCO2 =
    (parseFloat(meals) || 0) * CARBON_FACTORS.food[foodType];

  const getTabCO2 = useCallback(() => {
    if (activeTab === "transport") return transportCO2;
    if (activeTab === "energy") return energyCO2;
    return foodCO2;
  }, [activeTab, transportCO2, energyCO2, foodCO2]);

  const totalCO2 = transportCO2 + energyCO2 + foodCO2;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = async () => {
    if (totalCO2 === 0) return;
    await addEntry({
      transport: transportCO2,
      energy: energyCO2,
      food: foodCO2,
      total: totalCO2,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setDistance(""); setElectricity(""); setGas(""); setMeals("1");
    }, 1500);
  };

  const inputStyle = [styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottomPad + 80 }]} showsVerticalScrollIndicator={false}>

        {/* CO2 Display */}
        <View style={[styles.co2Card, { backgroundColor: colors.primary }]}>
          <Text style={styles.co2Label}>Bu tab üzrə CO₂</Text>
          <AnimatedCO2 value={getTabCO2()} color="#FFFFFF" />
          <Text style={styles.co2Unit}>kq CO₂</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Cəmi: </Text>
            <Text style={styles.totalValue}>{totalCO2.toFixed(2)} kq</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.secondary }]}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? "#FFFFFF" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Transport */}
        {activeTab === "transport" && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>Məsafə (km)</Text>
            <TextInput
              style={inputStyle}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Nəqliyyat növü</Text>
            <View style={styles.chipGrid}>
              {VEHICLES.map((v) => (
                <Pressable
                  key={v.key}
                  style={[
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: colors.card },
                    vehicle === v.key && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setVehicle(v.key)}
                >
                  <MaterialCommunityIcons
                    name={v.icon as any}
                    size={16}
                    color={vehicle === v.key ? "#FFFFFF" : colors.mutedForeground}
                  />
                  <Text style={[styles.chipText, { color: vehicle === v.key ? "#FFFFFF" : colors.foreground }]}>
                    {v.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.infoBox, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="information-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                {CARBON_FACTORS.transport[vehicle]} kq CO₂/km
              </Text>
            </View>
          </View>
        )}

        {/* Energy */}
        {activeTab === "energy" && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>Elektrik (kVt·saat)</Text>
            <TextInput
              style={inputStyle}
              value={electricity}
              onChangeText={setElectricity}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[styles.label, { color: colors.foreground }]}>Qaz (m³)</Text>
            <TextInput
              style={inputStyle}
              value={gas}
              onChangeText={setGas}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={[styles.infoBox, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="information-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                Elektrik: 0.233 kq/kVt · Qaz: 2.04 kq/m³
              </Text>
            </View>
          </View>
        )}

        {/* Food */}
        {activeTab === "food" && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>Qida növü</Text>
            <View style={styles.chipGrid}>
              {FOODS.map((f) => (
                <Pressable
                  key={f.key}
                  style={[
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: colors.card },
                    foodType === f.key && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setFoodType(f.key)}
                >
                  <MaterialCommunityIcons
                    name={f.icon as any}
                    size={16}
                    color={foodType === f.key ? "#FFFFFF" : colors.mutedForeground}
                  />
                  <Text style={[styles.chipText, { color: foodType === f.key ? "#FFFFFF" : colors.foreground }]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>Yemək sayı</Text>
            <TextInput
              style={inputStyle}
              value={meals}
              onChangeText={setMeals}
              keyboardType="decimal-pad"
              placeholder="1"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        )}

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={totalCO2 === 0}
          style={[
            styles.saveBtn,
            { backgroundColor: saved ? colors.accent : colors.primary },
            totalCO2 === 0 && { opacity: 0.4 },
          ]}
        >
          <MaterialCommunityIcons
            name={saved ? "check-circle" : "content-save"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.saveBtnText}>
            {saved ? "Saxlanıldı!" : "Girişi Saxla"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  co2Card: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  co2Label: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "500" },
  co2Value: { fontSize: 52, fontWeight: "800", lineHeight: 62 },
  co2Unit: { color: "rgba(255,255,255,0.65)", fontSize: 16 },
  totalRow: { flexDirection: "row", marginTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", paddingTop: 8, width: "100%", justifyContent: "center" },
  totalLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  totalValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  tabs: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 10 },
  tabText: { fontSize: 13, fontWeight: "600" },
  section: { gap: 10 },
  label: { fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: "500",
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  infoBox: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10 },
  infoText: { fontSize: 12 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 18,
    borderRadius: 16,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
